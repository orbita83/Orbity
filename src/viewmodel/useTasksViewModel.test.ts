import { act, renderHook, waitFor } from "@testing-library/react-native";
import { MemoryCategoryDataSource } from "@/infra/datasources/memoryCategoryDataSource";
import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { createCategoryFixture } from "@/model/__fixtures__/category.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { LocalDate } from "@/model/entities/localDate";
import { DataSourceError } from "@/model/errors";
import type { IClockService } from "@/model/services/iClockService";
import type { ITaskUseCases } from "@/usecase/iTaskUseCases";
import { TaskUseCases } from "@/usecase/taskUseCases";
import { PROTOTYPE_TASKS } from "@/view/__fixtures__/taskList.fixture";
import { formatTaskDueLabel, useTasksViewModel } from "@/viewmodel/useTasksViewModel";

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
    const taskRepo = new MemoryTaskDataSource([
      createTaskFixture({
        id: "t1",
        title: "Estudar Cálculo",
        category: "mathematics",
        startDate: "15/11/2026",
        startTime: "08:00",
        endTime: "09:00",
        createdAt: "2026-11-15T08:00:00-03:00",
      }),
      createTaskFixture({
        id: "t2",
        title: "Revisar SOLID",
        category: "programming",
        createdAt: "2026-11-15T07:00:00-03:00",
      }),
    ]);
    const activityRepo = new MemoryDailyActivityDataSource();
    const useCases = new TaskUseCases(taskRepo, activityRepo, clock);

    const { result } = await renderHook(() => useTasksViewModel(useCases));

    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0].visibleTasks).toHaveLength(2);
    expect(result.current[0].visibleTasks[0]).toMatchObject({
      id: "t1",
      dueLabel: "15/11 · 08:00–09:00",
      category: "mathematics",
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
      .mockRejectedValueOnce(new DataSourceError())
      .mockResolvedValueOnce([createTaskFixture({ id: "t1" })]);
    const failingUseCases: ITaskUseCases = {
      listTasks,
      listCategories: jest.fn().mockResolvedValue([]),
      getTask: jest.fn(),
      todayLocal: jest.fn(),
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

    const categoryFailingUseCases: ITaskUseCases = {
      ...failingUseCases,
      listTasks: jest.fn().mockResolvedValue([]),
      listCategories: jest.fn().mockRejectedValueOnce(new DataSourceError()),
    };
    const { result: catFailResult } = await renderHook(() => useTasksViewModel(categoryFailingUseCases));
    await waitFor(() => expect(catFailResult.current[0].errorKey).toBe("error.load"));
  });

  it("issue #213: carrega as categorias do DataSource e atualiza ao ganhar foco quando uma categoria muda", async () => {
    const taskRepo = new MemoryTaskDataSource([
      createTaskFixture({ id: "t1", title: "Estudar violão", category: "music" }),
    ]);
    const categoryRepo = new MemoryCategoryDataSource(taskRepo);
    const useCases = new TaskUseCases(
      taskRepo,
      new MemoryDailyActivityDataSource(),
      clock,
      undefined,
      undefined,
      categoryRepo,
    );

    const { result } = await renderHook(() => useTasksViewModel(useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0].categories?.find((cat) => cat.id === "music")?.name).toBeUndefined();

    // Renomeia "music" para "Violão" e cria "Física", depois foca a aba Tarefas
    const music = (await categoryRepo.findById("music"))!;
    await categoryRepo.update({ ...music, name: "Violão", icon: "star" }, "violao");
    await categoryRepo.create(createCategoryFixture({ id: "cat-fis", name: "Física", icon: "rocket" }), "fisica");

    await act(async () => {
      focusScreen();
    });

    await waitFor(() =>
      expect(result.current[0].categories?.find((cat) => cat.id === "music")).toMatchObject({
        name: "Violão",
        icon: "star",
      }),
    );
    expect(result.current[0].categories?.some((cat) => cat.id === "cat-fis")).toBe(true);
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

  it("recarrega a lista, reconcilia os lembretes quando a aba ganha foco e navega para /tasks ao tocar na notificação", async () => {
    let reminderPressHandler: ((taskId?: string) => void) | undefined;
    const useCases: ITaskUseCases = {
      listTasks: jest.fn(async () => []),
      listCategories: jest.fn(async () => []),
      getTask: jest.fn(),
      todayLocal: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
      togglePinTasks: jest.fn(),
      deleteTasks: jest.fn(),
      reconcileScheduledReminders: jest.fn(async () => undefined),
      onTaskReminderPress: jest.fn((onPress) => {
        reminderPressHandler = onPress;
        return () => {
          reminderPressHandler = undefined;
        };
      }),
    };
    const { result } = await renderHook(() => useTasksViewModel(useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    const callsBefore = (useCases.listTasks as jest.Mock).mock.calls.length;
    await act(async () => {
      focusScreen();
    });
    expect(useCases.listTasks).toHaveBeenCalledTimes(callsBefore + 1);
    expect(useCases.reconcileScheduledReminders).toHaveBeenCalled();

    act(() => {
      reminderPressHandler?.("t1");
    });
    expect(mockNavigate).toHaveBeenLastCalledWith("/tasks");
  });
});

describe("formatTaskDueLabel", () => {
  it("formata data única com faixa de horário no padrão curto do card", () => {
    expect(
      formatTaskDueLabel({
        startDate: "19/10/2026",
        startTime: "08:00",
        endDate: "19/10/2026",
        endTime: "09:00",
      }),
    ).toBe("19/10 · 08:00–09:00");
  });

  it("formata intervalos entre dias diferentes e retorna undefined quando vazio", () => {
    expect(
      formatTaskDueLabel({
        startDate: "19/10/2026",
        startTime: "08:00",
        endDate: "21/10/2026",
        endTime: "18:00",
      }),
    ).toBe("19/10 08:00 – 21/10 18:00");

    expect(formatTaskDueLabel({})).toBeUndefined();
  });
});
