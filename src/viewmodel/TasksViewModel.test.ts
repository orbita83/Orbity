import { act, renderHook } from "@testing-library/react-native";
import { PROTOTYPE_TASKS } from "@/view/__fixtures__/task-list.fixture";
import { useTasksViewModel } from "@/viewmodel/TasksViewModel";

const ids = (tasks: { id: string }[]) => tasks.map((task) => task.id);

describe("useTasksViewModel", () => {
  it("começa sem tarefas quando nada é passado", async () => {
    const { result } = await renderHook(() => useTasksViewModel());
    expect(result.current.visibleTasks).toEqual([]);
    expect(result.current.totalCount).toBe(0);
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

  it("fixar leva as selecionadas para o topo e sai da seleção", async () => {
    const { result } = await renderHook(() => useTasksViewModel(PROTOTYPE_TASKS));
    await act(async () => result.current.startSelection("c"));
    await act(async () => result.current.pinSelected());
    expect(ids(result.current.visibleTasks)[0]).toBe("c");
    expect(result.current.visibleTasks[0].pinned).toBe(true);
    expect(result.current.selectionMode).toBe(false);
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
});
