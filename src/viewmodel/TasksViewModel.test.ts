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
import { useTasksViewModel } from "@/viewmodel/TasksViewModel";

const ids = (tasks: { id: string }[]) => tasks.map((task) => task.id);

const clock: IClockService = {
  now: () => "2026-11-15T10:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-15"),
};

describe("useTasksViewModel", () => {
  it("começa sem tarefas quando uma lista vazia é passada", async () => {
    const { result } = await renderHook(() => useTasksViewModel([]));
    expect(result.current.visibleTasks).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.loading).toBe(false);
  });

  it("filtra pendentes e concluídas", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    expect(result.current.pendingCount).toBe(3);

    await act(async () => result.current.selectFilter("completed"));
    expect(ids(result.current.visibleTasks)).toEqual(["d"]);

    await act(async () => result.current.selectFilter("pending"));
    expect(ids(result.current.visibleTasks)).toEqual(["a", "b", "c"]);
  });

  it("concluir e desmarcar atualiza a contagem de pendentes", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    await act(async () => result.current.toggleCompleted("a"));
    expect(result.current.pendingCount).toBe(2);
    await act(async () => result.current.toggleCompleted("a"));
    expect(result.current.pendingCount).toBe(3);
  });

  it("F6: toque longo abre a seleção, e marcar todas seleciona as visíveis", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    await act(async () => result.current.startSelection("b"));
    expect(result.current.selectionMode).toBe(true);
    expect(result.current.selectedIds).toEqual(["b"]);

    await act(async () => result.current.toggleSelected("c"));
    await act(async () => result.current.toggleSelected("b"));
    expect(result.current.selectedIds).toEqual(["c"]);

    await act(async () => result.current.selectAll());
    expect(result.current.selectedIds).toEqual(["a", "b", "c", "d"]);

    await act(async () => result.current.cancelSelection());
    expect(result.current.selectionMode).toBe(false);
  });

  it("fixar leva as selecionadas para o topo e desafixa quando todas já estão fixadas", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    await act(async () => result.current.startSelection("c"));
    await act(async () => result.current.pinSelected());
    expect(ids(result.current.visibleTasks)[0]).toBe("c");
    expect(result.current.visibleTasks[0].pinned).toBe(true);
    expect(result.current.selectionMode).toBe(false);

    await act(async () => result.current.startSelection("c"));
    expect(result.current.allSelectedPinned).toBe(true);
    await act(async () => result.current.pinSelected());
    expect(result.current.visibleTasks.find((t) => t.id === "c")?.pinned).toBe(false);
  });

  it("excluir só acontece depois da confirmação", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    await act(async () => result.current.startSelection("a"));
    await act(async () => result.current.requestDelete());
    expect(result.current.confirmDeleteVisible).toBe(true);
    expect(result.current.totalCount).toBe(4);

    await act(async () => result.current.cancelDelete());
    expect(result.current.totalCount).toBe(4);

    await act(async () => result.current.requestDelete());
    await act(async () => result.current.confirmDelete());
    expect(result.current.totalCount).toBe(3);
    expect(result.current.selectionMode).toBe(false);
  });

  it("sem nada selecionado, pedir exclusão não abre a confirmação", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    await act(async () => result.current.startSelection("a"));
    await act(async () => result.current.toggleSelected("a"));
    await act(async () => result.current.requestDelete());
    expect(result.current.confirmDeleteVisible).toBe(false);
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

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.visibleTasks).toHaveLength(2);
    expect(result.current.visibleTasks[0]).toMatchObject({
      id: "t1",
      dueLabel: "15/11 · 08:00–09:00",
      categoryLabel: "Matemática",
    });

    await act(async () => result.current.toggleCompleted("t1"));
    await waitFor(() => expect(result.current.pendingCount).toBe(1));
    expect((await activityRepo.listDays()).map(String)).toEqual(["2026-11-15"]);

    await act(async () => result.current.startSelection("t2"));
    await act(async () => result.current.pinSelected());
    await waitFor(() => expect(ids(result.current.visibleTasks)[0]).toBe("t2"));

    await act(async () => result.current.startSelection("t2"));
    await act(async () => result.current.requestDelete());
    await act(async () => result.current.confirmDelete());
    await waitFor(() => expect(result.current.totalCount).toBe(1));
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

    await waitFor(() => expect(result.current.errorKey).toBe("error.load"));
    await act(async () => {
      await result.current.reload();
    });
    expect(result.current.errorKey).toBeNull();
    expect(result.current.totalCount).toBe(1);
  });
});
