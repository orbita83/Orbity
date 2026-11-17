import { act, renderHook, waitFor } from "@testing-library/react-native";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { LocalDate } from "@/model/entities/local-date";
import { DomainError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/i-clock-service";
import type { ITaskUseCases } from "@/usecase/i-task-use-cases";
import { TaskUseCases } from "@/usecase/task-use-cases";
import { useNewTaskViewModel } from "@/viewmodel/useNewTaskViewModel";

// Navegação do Expo Router isolada.
const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
const mockSetOptions = jest.fn();
const mockNavigation = { setOptions: (...args: unknown[]) => mockSetOptions(...args) };
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
  useNavigation: () => mockNavigation,
}));

beforeEach(() => {
  mockParams = {};
  mockFocusCallbacks.clear();
});

const fixedClock: IClockService = {
  now: () => "2026-11-15T10:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-15"),
};

const createVmDependencies = () => {
  const taskRepo = new InMemoryTaskRepository();
  const useCases = new TaskUseCases(taskRepo, new InMemoryDailyActivityRepository(), fixedClock, () => "task-created");
  return { taskRepo, useCases };
};

describe("useNewTaskViewModel", () => {
  it("sem título, criar mostra o erro e mantém o que foi digitado", async () => {
    const { useCases } = createVmDependencies();
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock));

    await act(async () => result.current.setField("description", "Capítulo 3"));
    expect(result.current.titleError).toBe(false);

    await act(async () => result.current.submit());
    expect(result.current.titleError).toBe(true);
    expect(result.current.created).toBe(false);
    expect(result.current.fields.description).toBe("Capítulo 3");
  });

  it("com título e dados válidos, cria e persiste a tarefa, e reset limpa o formulário", async () => {
    const { taskRepo, useCases } = createVmDependencies();
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock));

    await act(async () => result.current.setField("title", "Revisar SOLID"));
    await act(async () => result.current.setField("startDate", "15/11/2026"));
    await act(async () => result.current.setField("startTime", "08:00"));
    await act(async () => result.current.openPicker("category"));
    expect(result.current.activePicker).toBe("category");

    await act(async () => result.current.selectCategory("programacao"));
    expect(result.current.activePicker).toBeNull();
    expect(result.current.fields.category).toBe("programacao");

    await act(async () => result.current.submit());
    await waitFor(() => expect(result.current.created).toBe(true));

    const stored = await taskRepo.listAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      title: "Revisar SOLID",
      startDate: "15/11/2026",
      startTime: "08:00",
      category: "programacao",
    });

    await act(async () => result.current.reset());
    expect(result.current.created).toBe(false);
    expect(result.current.fields.title).toBe("");
    expect(result.current.fields.category).toBeUndefined();
  });

  it("data inválida ou falha ao persistir exibe formError e preserva o que foi preenchido", async () => {
    const { useCases } = createVmDependencies();
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock));

    await act(async () => result.current.setField("title", "Revisar grafos"));
    await act(async () => result.current.setField("startDate", "31/02/2026"));
    await act(async () => result.current.submit());

    await waitFor(() => expect(result.current.formError).toBeTruthy());
    expect(result.current.created).toBe(false);
    expect(result.current.fields.title).toBe("Revisar grafos");

    const failingUseCases: ITaskUseCases = {
      listTasks: jest.fn(),
      createTask: jest.fn().mockRejectedValueOnce(new DomainError("PERSISTENCE_FAILURE")),
      updateTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
      togglePinTasks: jest.fn(),
      deleteTasks: jest.fn(),
    };
    const { result: failingResult } = await renderHook(() => useNewTaskViewModel(failingUseCases, fixedClock));
    await act(async () => failingResult.current.setField("title", "Estudar"));
    await act(async () => failingResult.current.submit());

    await waitFor(() => expect(failingResult.current.formError).toBe("Não foi possível salvar a tarefa agora."));
    expect(failingResult.current.created).toBe(false);
  });

  it("gera opções de data começando em Hoje e Amanhã conforme a data local", async () => {
    const { useCases } = createVmDependencies();
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock));

    expect(result.current.dateOptions.slice(0, 3)).toEqual([
      { id: "clear", label: "Sem data", value: "" },
      { id: "today", label: "Hoje", hint: "15/11/2026", value: "15/11/2026" },
      { id: "tomorrow", label: "Amanhã", hint: "16/11/2026", value: "16/11/2026" },
    ]);
    expect(result.current.categoryOptions.some((option) => option.value === "programacao")).toBe(true);
    expect(result.current.timeOptions[1]).toEqual({ id: "00:00", label: "00:00", value: "00:00" });
  });

  it("no modo de edição, carrega os dados da tarefa existente e atualiza ao salvar", async () => {
    const taskRepo = new InMemoryTaskRepository([
      {
        id: "t1",
        title: "Estudar Cálculo",
        description: "Limites",
        startDate: "15/11/2026",
        startTime: "08:00",
        endDate: "15/11/2026",
        endTime: "09:00",
        category: "matematica",
        completed: false,
        pinned: true,
        createdAt: "2026-11-15T08:00:00-03:00",
        updatedAt: "2026-11-15T08:00:00-03:00",
      },
    ]);
    const useCases = new TaskUseCases(taskRepo, new InMemoryDailyActivityRepository(), fixedClock);
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock, "t1"));

    expect(result.current.editing).toBe(true);
    await waitFor(() => expect(result.current.fields.title).toBe("Estudar Cálculo"));
    expect(result.current.fields).toEqual({
      title: "Estudar Cálculo",
      description: "Limites",
      startDate: "15/11/2026",
      startTime: "08:00",
      endDate: "15/11/2026",
      endTime: "09:00",
      category: "matematica",
    });

    await act(async () => result.current.setField("title", "Estudar Cálculo II"));
    await act(async () => result.current.setField("description", ""));
    await act(async () => result.current.selectCategory(undefined));
    await act(async () => result.current.submit());

    await waitFor(() => expect(result.current.created).toBe(true));

    const updated = await taskRepo.findById("t1");
    expect(updated).toMatchObject({
      id: "t1",
      title: "Estudar Cálculo II",
      description: undefined,
      category: undefined,
      pinned: true,
    });
  });

  it("formata datas e horários digitados apenas com números ou separadores parciais e cria a tarefa", async () => {
    const { taskRepo, useCases } = createVmDependencies();
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock));

    await act(async () => result.current.setField("title", "Praticar redação"));
    await act(async () => result.current.setField("startDate", "15112026"));
    await act(async () => result.current.setField("startTime", "830"));
    await act(async () => result.current.setField("endDate", "5/12/2026"));
    await act(async () => result.current.setField("endTime", "8:30"));

    expect(result.current.fields.startDate).toBe("15/11/2026");
    expect(result.current.fields.startTime).toBe("08:30");
    expect(result.current.fields.endDate).toBe("05/12/2026");
    expect(result.current.fields.endTime).toBe("08:30");

    await act(async () => result.current.submit());
    await waitFor(() => expect(result.current.created).toBe(true));

    const stored = await taskRepo.listAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      title: "Praticar redação",
      startDate: "15/11/2026",
      startTime: "08:30",
      endDate: "05/12/2026",
      endTime: "08:30",
    });
  });
});

describe("useNewTaskViewModel (navegação)", () => {
  it("lê o id da tarefa na rota e abre a edição", async () => {
    const taskRepo = new InMemoryTaskRepository([
      {
        id: "t1",
        title: "Estudar Cálculo",
        completed: false,
        pinned: false,
        createdAt: "2026-11-15T08:00:00-03:00",
        updatedAt: "2026-11-15T08:00:00-03:00",
      },
    ]);
    const useCases = new TaskUseCases(taskRepo, new InMemoryDailyActivityRepository(), fixedClock);
    mockParams = { id: "t1" };
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock));
    expect(result.current.editing).toBe(true);
    await waitFor(() => expect(result.current.fields.title).toBe("Estudar Cálculo"));
  });

  it("fechar limpa o formulário, tira o id da rota e volta para Tarefas", async () => {
    const { useCases } = createVmDependencies();
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock));
    await act(async () => result.current.setField("title", "Ler capítulo 3"));
    await act(async () => result.current.handleClose());
    expect(result.current.fields.title).toBe("");
    expect(mockSetParams).toHaveBeenCalledWith({ id: "" });
    expect(mockNavigate).toHaveBeenCalledWith("/tasks");
  });
});
