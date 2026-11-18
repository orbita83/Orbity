import { act, renderHook, waitFor } from "@testing-library/react-native";
import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { LocalDate } from "@/model/entities/localDate";
import { DataSourceError } from "@/model/errors";
import type { IClockService } from "@/model/services/iClockService";
import { RoutineUseCases } from "@/usecase/routineUseCases";
import { PROTOTYPE_ROUTINE_DETAILS } from "@/view/__fixtures__/routines.fixture";
import { useRoutineDetailsViewModel } from "@/viewmodel/useRoutineDetailsViewModel";

// Navegação do Expo Router isolada: o foco é disparado pelo teste com `focusScreen()`.
const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
let mockParams: Record<string, string | undefined> = {};
const mockFocusCallbacks = new Set<() => void>();
jest.mock("expo-router", () => ({
  router: {
    navigate: (...args: unknown[]) => mockNavigate(...args),
    setParams: (...args: unknown[]) => mockSetParams(...args),
  },
  // Registra o efeito de foco enquanto o hook está montado; `focusScreen()` simula a tela ganhando foco.
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = jest.requireActual<typeof import("react")>("react");
    const latest = React.useRef(callback);
    latest.current = callback;
    React.useEffect(() => {
      const run = () => {
        latest.current();
      };
      mockFocusCallbacks.add(run);
      return () => {
        mockFocusCallbacks.delete(run);
      };
    }, []);
  },
  useLocalSearchParams: () => mockParams,
}));
const focusScreen = () => mockFocusCallbacks.forEach((run) => run());

beforeEach(() => {
  mockParams = {};
  mockFocusCallbacks.clear();
});

/** Segunda-feira: a rotina de Seg a Sex é de hoje. */
const monday: IClockService = {
  now: () => "2026-11-16T08:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-16"),
};

/** Caso de uso real sobre DataSources em memória (Fake), sem banco e sem o container. */
const createUseCases = () => {
  const tasks = new MemoryTaskDataSource();
  const routines = new MemoryRoutineDataSource(tasks);
  const dailyActivity = new MemoryDailyActivityDataSource();
  let seq = 0;
  const useCases = new RoutineUseCases(routines, tasks, dailyActivity, monday, () => `id-${++seq}`);
  return { useCases, dailyActivity };
};

describe("useRoutineDetailsViewModel (protótipo)", () => {
  it("F8: concluir tudo e desmarcar todos", async () => {
    const { result } = await renderHook(() => useRoutineDetailsViewModel(PROTOTYPE_ROUTINE_DETAILS));
    expect(result.current[0].completedCount).toBe(1);
    await act(async () => result.current[1].completeAll());
    expect(result.current[0].doneToday).toBe(true);
    expect(result.current[0].completedCount).toBe(3);
    await act(async () => result.current[1].undoAll());
    expect(result.current[0].doneToday).toBe(false);
    expect(result.current[0].completedCount).toBe(0);
  });

  it("concluir item a item não conclui a rotina (R3) e reordenar funciona", async () => {
    const { result } = await renderHook(() => useRoutineDetailsViewModel(PROTOTYPE_ROUTINE_DETAILS));
    await act(async () => result.current[1].toggleTask("b"));
    await act(async () => result.current[1].toggleTask("c"));
    expect(result.current[0].completedCount).toBe(3);
    expect(result.current[0].doneToday).toBe(false);
    await act(async () => result.current[1].moveTaskUp(2));
    expect(result.current[0].routine?.tasks.map((task) => task.id)).toEqual(["a", "c", "b"]);
  });

  it("pede confirmação antes de excluir", async () => {
    const { result } = await renderHook(() => useRoutineDetailsViewModel(PROTOTYPE_ROUTINE_DETAILS));
    await act(async () => result.current[1].requestDelete());
    expect(result.current[0].confirmDeleteVisible).toBe(true);
    await act(async () => result.current[1].cancelDelete());
    expect(result.current[0].confirmDeleteVisible).toBe(false);
  });

  it("sem rotina, fica indisponível", async () => {
    const { result } = await renderHook(() => useRoutineDetailsViewModel());
    expect(result.current[0].routine).toBeNull();
    expect(result.current[0].doneToday).toBe(false);
    expect(result.current[0].loading).toBe(false);
  });
});

describe("useRoutineDetailsViewModel (caso de uso)", () => {
  it("carrega pelo id, conclui, desmarca uma tarefa sem reabrir (R3) e desmarca todos (R4)", async () => {
    const { useCases, dailyActivity } = createUseCases();
    await useCases.createRoutine({ title: "Matemática", days: [1, 2, 3, 4, 5], tasks: ["Revisar", "Resolver"] });
    const { result } = await renderHook(() => useRoutineDetailsViewModel("id-1", useCases));
    await waitFor(() => expect(result.current[0].routine?.title).toBe("Matemática"));

    await act(async () => result.current[1].completeAll());
    await waitFor(async () => expect((await useCases.getRoutine("id-1"))?.doneToday).toBe(true));
    expect((await dailyActivity.listDays()).map(String)).toEqual(["2026-11-16"]);

    await act(async () => result.current[1].toggleTask("id-2"));
    await waitFor(() => expect(result.current[0].completedCount).toBe(1));
    expect(result.current[0].doneToday).toBe(true);

    await act(async () => result.current[1].undoAll());
    await waitFor(() => expect(result.current[0].doneToday).toBe(false));
    expect(result.current[0].completedCount).toBe(0);
    expect((await dailyActivity.listDays()).map(String)).toEqual(["2026-11-16"]);
  });

  it("id inexistente mostra a rotina indisponível", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useRoutineDetailsViewModel("nada", useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0].routine).toBeNull();
  });

  it("falha ao salvar vira aviso e a tela volta ao que ficou salvo", async () => {
    const { useCases } = createUseCases();
    await useCases.createRoutine({ title: "Matemática", days: [1], tasks: ["Revisar"] });
    jest.spyOn(useCases, "completeOccurrence").mockRejectedValue(new DataSourceError());
    const { result } = await renderHook(() => useRoutineDetailsViewModel("id-1", useCases));
    await waitFor(() => expect(result.current[0].routine).not.toBeNull());

    await act(async () => result.current[1].completeAll());
    await waitFor(() => expect(result.current[0].errorKey).toBe("error.save"));
    await waitFor(() => expect(result.current[0].doneToday).toBe(false));
  });
});

describe("useRoutineDetailsViewModel (navegação)", () => {
  it("carrega a rotina pelo id da rota", async () => {
    const { useCases } = createUseCases();
    await useCases.createRoutine({ title: "Matemática", days: [1, 2, 3, 4, 5], tasks: ["Revisar"] });
    mockParams = { id: "id-1" };
    const { result } = await renderHook(() => useRoutineDetailsViewModel(undefined, useCases));
    await waitFor(() => expect(result.current[0].routine?.title).toBe("Matemática"));
  });

  it("volta para a lista, abre a edição e devolve a exclusão para a lista", async () => {
    const { result } = await renderHook(() => useRoutineDetailsViewModel(PROTOTYPE_ROUTINE_DETAILS));
    result.current[1].handleBack();
    expect(mockNavigate).toHaveBeenLastCalledWith("/routines");
    result.current[1].handleEdit("r1");
    expect(mockNavigate).toHaveBeenLastCalledWith({ pathname: "/new-routine", params: { id: "r1" } });
    result.current[1].handleDeleted("r1");
    expect(mockNavigate).toHaveBeenLastCalledWith({ pathname: "/routines", params: { deleted: "r1" } });
  });

  it("recarrega quando a tela ganha foco", async () => {
    const { useCases } = createUseCases();
    await useCases.createRoutine({ title: "Matemática", days: [1, 2, 3, 4, 5], tasks: ["Revisar"] });
    const { result } = await renderHook(() => useRoutineDetailsViewModel("id-1", useCases));
    await waitFor(() => expect(result.current[0].routine?.doneToday).toBe(false));
    await useCases.completeOccurrence("id-1");
    await act(async () => {
      focusScreen();
    });
    await waitFor(() => expect(result.current[0].routine?.doneToday).toBe(true));
  });
});
