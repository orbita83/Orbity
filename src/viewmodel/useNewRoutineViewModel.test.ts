import { act, renderHook, waitFor } from "@testing-library/react-native";
import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { LocalDate } from "@/model/entities/localDate";
import { DataSourceError } from "@/model/errors";
import type { IClockService } from "@/model/services/iClockService";
import type { IRoutineUseCases } from "@/usecase/iRoutineUseCases";
import { RoutineUseCases } from "@/usecase/routineUseCases";
import { useNewRoutineViewModel } from "@/viewmodel/useNewRoutineViewModel";

// Navegação do Expo Router isolada.
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

describe("useNewRoutineViewModel", () => {
  it("RF-0007 e RF-0012: exige nome e pelo menos um dia sem chamar o caso de uso nem perder o que foi digitado", async () => {
    const { useCases } = createUseCases();
    const create = jest.spyOn(useCases, "createRoutine");
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases));
    await act(async () => result.current[1].setDescription("Estudos diários"));
    await act(async () => result.current[1].submit());

    expect(result.current[0].nameError).toBe(true);
    expect(result.current[0].daysError).toBe(true);
    expect(result.current[0].description).toBe("Estudos diários");
    expect(create).not.toHaveBeenCalled();
  });

  it("cria a rotina com as tarefas na ordem escolhida", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases));
    await act(async () => result.current[1].setName("Matemática"));
    await act(async () => result.current[1].toggleDay(3));
    await act(async () => result.current[1].toggleDay(1));
    expect(result.current[0].days).toEqual([1, 3]);
    for (const title of ["Revisar", "Resolver", "   "]) {
      await act(async () => result.current[1].setDraft(title));
      await act(async () => result.current[1].addTask());
    }
    await act(async () => result.current[1].moveTaskUp(1));
    expect(result.current[0].tasks).toEqual(["Resolver", "Revisar"]);

    await act(async () => result.current[1].submit());
    await waitFor(() => expect(result.current[0].created).toBe(true));
    const details = await useCases.getRoutine("id-1");
    expect(details?.routine.days).toEqual([1, 3]);
    expect(details?.tasks.map((item) => item.task.title)).toEqual(["Resolver", "Revisar"]);
  });

  it("falha ao salvar mostra o aviso e preserva o formulário", async () => {
    const failing = { createRoutine: () => Promise.reject(new DataSourceError()) } as unknown as IRoutineUseCases;
    const { result } = await renderHook(() => useNewRoutineViewModel(failing));
    await act(async () => result.current[1].setName("Matemática"));
    await act(async () => result.current[1].toggleDay(1));
    await act(async () => result.current[1].submit());

    await waitFor(() => expect(result.current[0].formError).toBe("Não foi possível salvar a rotina agora. Tente de novo."));
    expect(result.current[0].name).toBe("Matemática");
    expect(result.current[0].submitting).toBe(false);
    expect(result.current[0].created).toBe(false);
  });

  it("o ícone começa em Geral e pode ser trocado", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases));
    expect(result.current[0].icon).toBe("general");
    await act(async () => result.current[1].setIcon("science"));
    expect(result.current[0].icon).toBe("science");
  });
});

describe("useNewRoutineViewModel (edição, #137)", () => {
  const createMath = async (useCases: RoutineUseCases) => {
    const routine = await useCases.createRoutine({
      title: "Matemática",
      icon: "mathematics",
      description: "Diária",
      days: [1, 3],
      tasks: ["Revisar", "Resolver"],
    });
    return routine.id;
  };

  it("RF-0009 CA-02: abre com as informações atuais da rotina", async () => {
    const { useCases } = createUseCases();
    const id = await createMath(useCases);
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases, id));

    expect(result.current[0].editing).toBe(true);
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0]).toMatchObject({
      name: "Matemática",
      icon: "mathematics",
      description: "Diária",
      days: [1, 3],
      tasks: ["Revisar", "Resolver"],
    });
    // Sem alterações, sai sem perguntar.
    expect(result.current[1].requestLeave()).toBe(true);
  });

  it("RF-0009 CA-03 a CA-06: salva mantendo as tarefas existentes e a marcação delas", async () => {
    const { useCases } = createUseCases();
    const id = await createMath(useCases);
    const [revisar] = (await useCases.getRoutine(id))!.tasks;
    await useCases.toggleRoutineTask(id, revisar.task.id);
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases, id));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    await act(async () => result.current[1].setName("Cálculo"));
    await act(async () => result.current[1].removeTask(1));
    await act(async () => result.current[1].setDraft("Anotar"));
    await act(async () => result.current[1].addTask());
    await act(async () => result.current[1].moveTaskUp(1));
    await act(async () => result.current[1].submit());
    await waitFor(() => expect(result.current[0].created).toBe(true));

    const details = (await useCases.getRoutine(id))!;
    expect(details.routine.title).toBe("Cálculo");
    expect(details.tasks.map(({ task, checkedToday }) => [task.title, checkedToday])).toEqual([
      ["Anotar", false],
      ["Revisar", true],
    ]);
    expect(details.tasks[1].task.id).toBe(revisar.task.id);
  });

  it("sair com alterações pede confirmação, e continuar editando mantém o que foi digitado", async () => {
    const { useCases } = createUseCases();
    const id = await createMath(useCases);
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases, id));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    await act(async () => result.current[1].toggleDay(5));

    let canLeave = true;
    await act(async () => {
      canLeave = result.current[1].requestLeave();
    });
    expect(canLeave).toBe(false);
    expect(result.current[0].discardVisible).toBe(true);

    await act(async () => result.current[1].cancelLeave());
    expect(result.current[0].discardVisible).toBe(false);
    expect(result.current[0].days).toEqual([1, 3, 5]);
  });

  it("rotina que não existe mais: avisa e não deixa salvar", async () => {
    const { useCases } = createUseCases();
    const update = jest.spyOn(useCases, "updateRoutine");
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases, "nada"));

    await waitFor(() => expect(result.current[0].formError).toBe("Esta rotina não está mais na sua lista."));
    await act(async () => result.current[1].submit());
    expect(update).not.toHaveBeenCalled();
  });

  it("a criação não pergunta ao sair, mesmo com algo digitado", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases));
    await act(async () => result.current[1].setName("Inglês"));
    expect(result.current[1].requestLeave()).toBe(true);
  });
});

describe("useNewRoutineViewModel (navegação)", () => {
  it("lê o id da rota e abre a edição", async () => {
    const { useCases } = createUseCases();
    const routine = await useCases.createRoutine({ title: "Matemática", days: [1], tasks: [] });
    mockParams = { id: routine.id };
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases));
    expect(result.current[0].editing).toBe(true);
    await waitFor(() => expect(result.current[0].name).toBe("Matemática"));
  });

  it("sair da criação limpa o formulário e volta para a lista", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases));
    await act(async () => result.current[1].setName("Inglês"));
    await act(async () => result.current[1].handleLeave());
    expect(result.current[0].name).toBe("");
    expect(mockSetParams).toHaveBeenCalledWith({ id: "" });
    expect(mockNavigate).toHaveBeenCalledWith("/routines");
  });

  it("sair da edição volta para o detalhe da rotina", async () => {
    const { useCases } = createUseCases();
    const routine = await useCases.createRoutine({ title: "Matemática", days: [1], tasks: [] });
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases, routine.id));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    await act(async () => result.current[1].handleLeave());
    expect(mockNavigate).toHaveBeenCalledWith({ pathname: "/routine-details", params: { id: routine.id } });
  });
});
