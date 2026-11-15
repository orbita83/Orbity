import { useCallback, useMemo, useState } from "react";

/**
 * Tarefa como a lista a apresenta. Provisório: vira o resultado do caso de uso de Tarefas
 * (RF de consulta) quando o domínio existir; por enquanto a lista começa vazia em produção.
 */
export type TaskListItem = {
  id: string;
  title: string;
  /** Prazo já formatado, no padrão "19/10 · 08:00–09:00". */
  dueLabel?: string;
  completed: boolean;
  pinned: boolean;
};

export type TaskFilter = "all" | "pending" | "completed";

export type TasksState = {
  /** Tarefas do filtro atual, com as fixadas primeiro. */
  visibleTasks: TaskListItem[];
  pendingCount: number;
  totalCount: number;
  filter: TaskFilter;
  selectionMode: boolean;
  selectedIds: string[];
  confirmDeleteVisible: boolean;
};

export type TasksActions = {
  selectFilter: (filter: TaskFilter) => void;
  toggleCompleted: (id: string) => void;
  startSelection: (id: string) => void;
  toggleSelected: (id: string) => void;
  cancelSelection: () => void;
  selectAll: () => void;
  pinSelected: () => void;
  requestDelete: () => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
};

const matchesFilter = (task: TaskListItem, filter: TaskFilter) =>
  filter === "all" || (filter === "pending" ? !task.completed : task.completed);

/**
 * Estado de apresentação da lista de Tarefas: filtro, conclusão, seleção múltipla e confirmação.
 * As mudanças ficam só em memória até o caso de uso de Tarefas ser ligado aqui.
 */
export const useTasksViewModel = (initialTasks: readonly TaskListItem[] = []): TasksState & TasksActions => {
  const [tasks, setTasks] = useState<TaskListItem[]>(() => [...initialTasks]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const visibleTasks = useMemo(
    () =>
      tasks
        .filter((task) => matchesFilter(task, filter))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    [filter, tasks],
  );

  const toggleCompleted = useCallback((id: string) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  }, []);

  const startSelection = useCallback((id: string) => setSelectedIds([id]), []);
  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((current) => {
      const ids = current ?? [];
      return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
    });
  }, []);
  const cancelSelection = useCallback(() => {
    setSelectedIds(null);
    setConfirmDeleteVisible(false);
  }, []);
  const selectAll = useCallback(() => setSelectedIds(visibleTasks.map((task) => task.id)), [visibleTasks]);

  const pinSelected = useCallback(() => {
    const ids = selectedIds ?? [];
    setTasks((current) => current.map((task) => (ids.includes(task.id) ? { ...task, pinned: true } : task)));
    setSelectedIds(null);
  }, [selectedIds]);

  const requestDelete = useCallback(() => {
    if ((selectedIds ?? []).length > 0) setConfirmDeleteVisible(true);
  }, [selectedIds]);
  const cancelDelete = useCallback(() => setConfirmDeleteVisible(false), []);
  const confirmDelete = useCallback(() => {
    const ids = selectedIds ?? [];
    setTasks((current) => current.filter((task) => !ids.includes(task.id)));
    setConfirmDeleteVisible(false);
    setSelectedIds(null);
  }, [selectedIds]);

  return {
    visibleTasks,
    pendingCount: tasks.filter((task) => !task.completed).length,
    totalCount: tasks.length,
    filter,
    selectionMode: selectedIds !== null,
    selectedIds: selectedIds ?? [],
    confirmDeleteVisible,
    selectFilter: setFilter,
    toggleCompleted,
    startSelection,
    toggleSelected,
    cancelSelection,
    selectAll,
    pinSelected,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
};
