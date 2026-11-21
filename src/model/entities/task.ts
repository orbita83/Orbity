export type TaskFilter = "all" | "pending" | "completed";

/**
 * Categorias iniciais de estudo (tarefas.md, T3). O domínio conhece só os ids; rótulo e ícone
 * de cada um ficam na apresentação (issue #159).
 */
export const TASK_CATEGORY_IDS = ["mathematics", "reading", "languages", "science", "programming", "music"] as const;

export type TaskCategoryId = (typeof TASK_CATEGORY_IDS)[number];

export type Task = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly startDate?: string;
  readonly startTime?: string;
  readonly endDate?: string;
  readonly endTime?: string;
  readonly category?: TaskCategoryId;
  readonly completed: boolean;
  readonly pinned: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  /**
   * Rotina a que a tarefa pertence (rotinas.md, R1). Sem rotina, a tarefa é avulsa e aparece na
   * aba Tarefas. Uma tarefa de rotina não usa `completed`: a marcação dela vale por dia (R2).
   */
  readonly routineId?: string;
  /** Ordem dentro da rotina, começando em 0. */
  readonly position?: number;
};

/** Tarefa sem rotina associada (RN-0002): a única que aparece na aba Tarefas e conta sozinha. */
export function isStandaloneTask(task: Pick<Task, "routineId">): boolean {
  return task.routineId === undefined;
}

export type CreateTaskInput = {
  readonly title: string;
  readonly description?: string;
  readonly startDate?: string;
  readonly startTime?: string;
  readonly endDate?: string;
  readonly endTime?: string;
  readonly category?: TaskCategoryId;
};

export type NormalizedCreateTaskInput = {
  readonly title: string;
  readonly description?: string;
  readonly startDate?: string;
  readonly startTime?: string;
  readonly endDate?: string;
  readonly endTime?: string;
  readonly category?: TaskCategoryId;
};

export type UpdateTaskInput = {
  readonly id: string;
  readonly title?: string;
  readonly description?: string | null;
  readonly startDate?: string | null;
  readonly startTime?: string | null;
  readonly endDate?: string | null;
  readonly endTime?: string | null;
  readonly category?: TaskCategoryId | null;
  readonly completed?: boolean;
  readonly pinned?: boolean;
};

export function isTaskCategoryId(value: string): value is TaskCategoryId {
  return (TASK_CATEGORY_IDS as readonly string[]).includes(value);
}

/** Filtra tarefas por status e ordena colocando as fixadas no topo preservando a ordem relativa. */
export function filterAndSortTasks<T extends { readonly completed: boolean; readonly pinned: boolean }>(
  tasks: readonly T[],
  filter: TaskFilter,
): T[] {
  const filtered = tasks.filter((task) => {
    if (filter === "pending") {
      return !task.completed;
    }
    if (filter === "completed") {
      return task.completed;
    }
    return true;
  });

  return [...filtered].sort((a, b) => Number(b.pinned) - Number(a.pinned));
}
