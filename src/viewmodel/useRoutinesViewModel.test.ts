import { act, renderHook, waitFor } from "@testing-library/react-native";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryRoutineRepository } from "@/infra/repositories/in-memory-routine-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { LocalDate } from "@/model/entities/local-date";
import { DomainError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/i-clock-service";
import type { IRoutineUseCases } from "@/usecase/i-routine-use-cases";
import { RoutineUseCases } from "@/usecase/routine-use-cases";
import { PROTOTYPE_INACTIVE_ROUTINE, PROTOTYPE_ROUTINES } from "@/view/__fixtures__/routines.fixture";
import { UNDO_WINDOW_MS, useRoutinesViewModel } from "@/viewmodel/useRoutinesViewModel";

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

const ids = (items: { id: string }[]) => items.map((item) => item.id);

/** Segunda-feira: a rotina de Seg a Sex é de hoje. */
const monday: IClockService = {
  now: () => "2026-11-16T08:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-16"),
};

/** Caso de uso real sobre repositórios em memória (Fake), sem banco e sem o container. */
const createUseCases = () => {
  const tasks = new InMemoryTaskRepository();
  const routines = new InMemoryRoutineRepository(tasks);
  const dailyActivity = new InMemoryDailyActivityRepository();
  let seq = 0;
  const useCases = new RoutineUseCases(routines, tasks, dailyActivity, monday, () => `id-${++seq}`);
  return { useCases, dailyActivity };
};

describe("useRoutinesViewModel (protótipo)", () => {
  it("começa vazia quando a lista é vazia", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel([]));
    expect(result.current[0].visibleRoutines).toEqual([]);
    expect(result.current[0].loading).toBe(false);
  });

  it("busca pelo nome sem diferenciar maiúsculas", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    await act(async () => result.current[1].setQuery("ING"));
    expect(ids(result.current[0].visibleRoutines)).toEqual(["ing"]);
  });

  it("RF-0011: concluir e desmarcar a rotina do dia", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    expect(result.current[0].doneTodayCount).toBe(1);
    await act(async () => result.current[1].toggleDoneToday("ing"));
    expect(result.current[0].doneTodayCount).toBe(2);
  });

  it("R6: o resumo conta só as rotinas de hoje, e a de outro dia não conclui", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel([...PROTOTYPE_ROUTINES, PROTOTYPE_INACTIVE_ROUTINE]));
    expect(result.current[0].totalCount).toBe(3);
    await act(async () => result.current[1].toggleDoneToday("fds"));
    expect(result.current[0].visibleRoutines.find((routine) => routine.id === "fds")?.doneToday).toBe(false);
  });

  it("3.4: excluir mostra o aviso e desfazer devolve a rotina ao mesmo lugar", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    await act(async () => result.current[1].deleteRoutine("ing"));
    expect(result.current[0].totalCount).toBe(2);
    expect(result.current[0].lastDeleted?.title).toBe("Inglês");

    await act(async () => result.current[1].undoDelete());
    expect(ids(result.current[0].visibleRoutines)).toEqual(["mat", "ing", "leitura"]);
    expect(result.current[0].lastDeleted).toBeNull();
  });

  it("o aviso de exclusão some sozinho", async () => {
    jest.useFakeTimers();
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    await act(async () => result.current[1].deleteRoutine("mat"));
    await act(async () => jest.advanceTimersByTime(UNDO_WINDOW_MS));
    expect(result.current[0].lastDeleted).toBeNull();
    jest.useRealTimers();
  });
});

describe("useRoutinesViewModel (caso de uso)", () => {
  it("RF-0008: carrega as rotinas e conclui pelo caso de uso, registrando o dia", async () => {
    const { useCases, dailyActivity } = createUseCases();
    await useCases.createRoutine({ title: "Matemática", days: [1, 2, 3, 4, 5], tasks: ["Revisar"] });

    const { result } = await renderHook(() => useRoutinesViewModel(useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0].visibleRoutines).toEqual([
      { id: "id-1", title: "Matemática", icon: "track_changes", days: [1, 2, 3, 4, 5], taskCount: 1, activeToday: true, doneToday: false },
    ]);

    await act(async () => result.current[1].toggleDoneToday("id-1"));
    await waitFor(() => expect(result.current[0].doneTodayCount).toBe(1));
    expect((await dailyActivity.listDays()).map(String)).toEqual(["2026-11-16"]);
  });

  it("R7: excluir e desfazer passam pelo caso de uso", async () => {
    const { useCases } = createUseCases();
    await useCases.createRoutine({ title: "Matemática", days: [1], tasks: [] });
    const { result } = await renderHook(() => useRoutinesViewModel(useCases));
    await waitFor(() => expect(result.current[0].visibleRoutines).toHaveLength(1));

    await act(async () => result.current[1].deleteRoutine("id-1"));
    await waitFor(async () => expect(await useCases.listRoutines()).toEqual([]));

    await act(async () => result.current[1].undoDelete());
    await waitFor(async () => expect(await useCases.listRoutines()).toHaveLength(1));
    expect(ids(result.current[0].visibleRoutines)).toEqual(["id-1"]);
  });

  it("falha ao carregar vira aviso, sem quebrar a tela", async () => {
    const failing = { listRoutines: () => Promise.reject(new DomainError("PERSISTENCE_FAILURE")) } as unknown as IRoutineUseCases;
    const { result } = await renderHook(() => useRoutinesViewModel(failing));
    await waitFor(() => expect(result.current[0].errorKey).toBe("error.load"));
    expect(result.current[0].loading).toBe(false);
  });
});

describe("useRoutinesViewModel (navegação)", () => {
  it("abre Nova rotina e o detalhe pela ViewModel", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    result.current[1].handleCreateRoutine();
    expect(mockNavigate).toHaveBeenLastCalledWith("/new-routine");
    result.current[1].handleOpenRoutine(PROTOTYPE_ROUTINES[0].id);
    expect(mockNavigate).toHaveBeenLastCalledWith({ pathname: "/routine-details", params: { id: PROTOTYPE_ROUTINES[0].id } });
  });

  it("conclui a exclusão confirmada no detalhe (?deleted=) e limpa o parâmetro da rota", async () => {
    const target = PROTOTYPE_ROUTINES[0];
    mockParams = { deleted: target.id };
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    await act(async () => {
      focusScreen();
    });
    await waitFor(() => expect(result.current[0].lastDeleted?.id).toBe(target.id));
    expect(ids(result.current[0].visibleRoutines)).not.toContain(target.id);
    expect(mockSetParams).toHaveBeenCalledWith({ deleted: undefined });
  });

  it("recarrega a lista quando a aba ganha foco", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useRoutinesViewModel(useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    await useCases.createRoutine({ title: "Inglês", days: [1], tasks: [] });
    await act(async () => {
      focusScreen();
    });
    await waitFor(() => expect(result.current[0].visibleRoutines.map((routine) => routine.title)).toEqual(["Inglês"]));
  });
});
