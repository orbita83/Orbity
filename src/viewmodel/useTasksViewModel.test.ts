import { act, renderHook, waitFor } from "@testing-library/react-native";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { LocalDate } from "@/model/entities/local-date";
import { DomainError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/i-clock-service";
import type { ITaskUseCases } from "@/usecase/i-task-use-cases";
import { TaskUseCases } from "@/usecase/task-use-cases";
import { PROTOTYPE_TASKS } from "@/view/__fixtures__/task-list.fixture";
import { useTasksViewModel } from "@/viewmodel/useTasksViewModel";

// Navegação do Expo Router isolada: o foco é disparado pelo teste com `focusScreen()`.
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
const focusScreen = () => mockFocusCallbacks.forEach((run) => run());

beforeEach(() => {
  mockParams = {};
  mockFocusCallbacks.clear();
});

const ids = (tasks: { id: string }[]) => tasks.map((task) => task.id);

const clock: IClockService = {
  now: () => "2026-11-15T10:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-15"),
};

describe("useTasksViewModel", () => {
  it("começa sem tarefas quando uma lista vazia é passada", async () => {
    const { result } = await renderHook(() => useTasksViewModel([]));
    expect(result.current[0].visibleTasks).toEqual([]);
    expect(result.current[0].totalCount).toBe(0);
    expect(result.current[0].loading).toBe(false);
  });

  it("filtra pendentes e concluídas", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    expect(result.current[0].pendingCount).toBe(3);

    await act(async () => result.current[1].selectFilter("completed"));
    expect(ids(result.current[0].visibleTasks)).toEqual(["d"]);

    await act(async () => result.current[1].selectFilter("pending"));
    expect(ids(result.current[0].visibleTasks)).toEqual(["a", "b", "c"]);
  });

  it("concluir e desmarcar atualiza a contagem de pendentes", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    await act(async () => result.current[1].toggleCompleted("a"));
    expect(result.current[0].pendingCount).toBe(2);
    await act(async () => result.current[1].toggleCompleted("a"));
    expect(result.current[0].pendingCount).toBe(3);
  });

  it("F6: toque longo abre a seleção, e marcar todas seleciona as visíveis", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    await act(async () => result.current[1].startSelection("b"));
    expect(result.current[0].selectionMode).toBe(true);
    expect(result.current[0].selectedIds).toEqual(["b"]);

    await act(async () => result.current[1].toggleSelected("c"));
    await act(async () => result.current[1].toggleSelected("b"));
    expect(result.current[0].selectedIds).toEqual(["c"]);

    await act(async () => result.current[1].selectAll());
    expect(result.current[0].selectedIds).toEqual(["a", "b", "c", "d"]);

    await act(async () => result.current[1].cancelSelection());
    expect(result.current[0].selectionMode).toBe(false);
  });

  it("fixar leva as selecionadas para o topo e desafixa quando todas já estão fixadas", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    await act(async () => result.current[1].startSelection("c"));
    await act(async () => result.current[1].pinSelected());
    expect(ids(result.current[0].visibleTasks)[0]).toBe("c");
    expect(result.current[0].visibleTasks[0].pinned).toBe(true);
    expect(result.current[0].selectionMode).toBe(false);

    await act(async () => result.current[1].startSelection("c"));
    expect(result.current[0].allSelectedPinned).toBe(true);
    await act(async () => result.current[1].pinSelected());
    expect(result.current[0].visibleTasks.find((t) => t.id === "c")?.pinned).toBe(false);
  });

  it("excluir só acontece depois da confirmação", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    await act(async () => result.current[1].startSelection("a"));
    await act(async () => result.current[1].requestDelete());
    expect(result.current[0].confirmDeleteVisible).toBe(true);
    expect(result.current[0].totalCount).toBe(4);

    await act(async () => result.current[1].cancelDelete());
    expect(result.current[0].totalCount).toBe(4);

    await act(async () => result.current[1].requestDelete());
    await act(async () => result.current[1].confirmDelete());
    expect(result.current[0].totalCount).toBe(3);
    expect(result.current[0].selectionMode).toBe(false);
  });

  it("sem nada selecionado, pedir exclusão não abre a confirmação", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    await act(async () => result.current[1].startSelection("a"));
    await act(async () => result.current[1].toggleSelected("a"));
    await act(async () => result.current[1].requestDelete());
    expect(result.current[0].confirmDeleteVisible).toBe(false);
  });

  it("carrega, conclui, fixa em toggle e exclui tarefas usando os casos de uso", async () => {
    const taskRepo = new InMemoryTaskRepository([
      createTaskFixture({
        id: "t1",
        title: "Estudar Cálculo",
        category: "matematica",
        startDate: "15/11/2026",
        startTime: "08:00",
        endTime: "09:00",
        createdAt: "2026-11-15T08:00:00-03:00",
      }),
      createTaskFixture({
        id: "t2",
        title: "Revisar SOLID",
        category: "programacao",
        createdAt: "2026-11-15T07:00:00-03:00",
      }),
    ]);
    const activityRepo = new InMemoryDailyActivityRepository();
    const useCases = new TaskUseCases(taskRepo, activityRepo, clock);

    const { result } = await renderHook(() => useTasksViewModel(useCases));

    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0].visibleTasks).toHaveLength(2);
    expect(result.current[0].visibleTasks[0]).toMatchObject({
      id: "t1",
      dueLabel: "15/11 · 08:00–09:00",
      categoryLabel: "Matemática",
    });

    await act(async () => result.current[1].toggleCompleted("t1"));
    await waitFor(() => expect(result.current[0].pendingCount).toBe(1));
    expect((await activityRepo.listDays()).map(String)).toEqual(["2026-11-15"]);

    await act(async () => result.current[1].startSelection("t2"));
    await act(async () => result.current[1].pinSelected());
    await waitFor(() => expect(ids(result.current[0].visibleTasks)[0]).toBe("t2"));

    await act(async () => result.current[1].startSelection("t2"));
    await act(async () => result.current[1].requestDelete());
    await act(async () => result.current[1].confirmDelete());
    await waitFor(() => expect(result.current[0].totalCount).toBe(1));
  });

  it("exibe erro ao falhar o carregamento e limpa ao tentar novamente", async () => {
    const listTasks = jest
      .fn<Promise<ReturnType<typeof createTaskFixture>[]>, []>()
      .mockRejectedValueOnce(new DomainError("PERSISTENCE_FAILURE"))
      .mockResolvedValueOnce([createTaskFixture({ id: "t1" })]);
    const failingUseCases: ITaskUseCases = {
      listTasks,
      createTask: jest.fn(),
      updateTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
      togglePinTasks: jest.fn(),
      deleteTasks: jest.fn(),
    };

    const { result } = await renderHook(() => useTasksViewModel(failingUseCases));

    await waitFor(() => expect(result.current[0].errorKey).toBe("error.load"));
    await act(async () => {
      await result.current[1].reload();
    });
    expect(result.current[0].errorKey).toBeNull();
    expect(result.current[0].totalCount).toBe(1);
  });
});

describe("useTasksViewModel (navegação)", () => {
  it("abre Nova tarefa e a edição pela ViewModel", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    result.current[1].handleCreateTask();
    expect(mockNavigate).toHaveBeenLastCalledWith({ pathname: "/new-task", params: { id: "" } });
    result.current[1].handleEditTask("t1");
    expect(mockNavigate).toHaveBeenLastCalledWith({ pathname: "/new-task", params: { id: "t1" } });
  });

  it("esconde a barra de abas durante a seleção múltipla e a mostra de novo ao sair", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    expect(mockSetOptions).toHaveBeenLastCalledWith({ tabBarStyle: undefined });
    await act(async () => result.current[1].startSelection(PROTOTYPE_TASKS[0].id));
    expect(mockSetOptions).toHaveBeenLastCalledWith({ tabBarStyle: { display: "none" } });
    await act(async () => result.current[1].cancelSelection());
    expect(mockSetOptions).toHaveBeenLastCalledWith({ tabBarStyle: undefined });
  });

  it("recarrega a lista quando a aba ganha foco", async () => {
    const useCases: ITaskUseCases = {
      listTasks: jest.fn(async () => []),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
      togglePinTasks: jest.fn(),
      deleteTasks: jest.fn(),
    };
    const { result } = await renderHook(() => useTasksViewModel(useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    const callsBefore = (useCases.listTasks as jest.Mock).mock.calls.length;
    await act(async () => {
      focusScreen();
    });
    expect(useCases.listTasks).toHaveBeenCalledTimes(callsBefore + 1);
  });
});
