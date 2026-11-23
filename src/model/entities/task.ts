import { DEFAULT_CATEGORY_IDS, isDefaultCategoryId, type CategoryId } from "@/model/entities/category";

export type TaskFilter = "all" | "pending" | "completed";

/**
 * Categorias padrão de estudo (tarefas.md, T3), agora definidas em `category.ts`. Rótulo e ícone
 * de cada um ficam na apresentação (issue #159).
 */
export const TASK_CATEGORY_IDS = DEFAULT_CATEGORY_IDS;

export type TaskCategoryId = CategoryId;

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

/** Diz se o id é de uma categoria padrão. Existir de fato é verificado pelo DataSource nos casos de uso. */
export function isTaskCategoryId(value: string): boolean {
  return isDefaultCategoryId(value);
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
