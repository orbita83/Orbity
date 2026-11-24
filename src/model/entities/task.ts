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

export const TASK_REMINDER_PREFIX = "task-reminder:";

/** Monta o identificador determinístico do lembrete local de uma tarefa avulsa (RN-0011). */
export function buildTaskReminderId(taskId: string): string {
  return `${TASK_REMINDER_PREFIX}${taskId}`;
}

/** Verifica se o identificador pertence a um lembrete de tarefa avulsa. */
export function isTaskReminderId(id: string): boolean {
  return id.startsWith(TASK_REMINDER_PREFIX) && id.length > TASK_REMINDER_PREFIX.length;
}

/**
 * Calcula o instante ISO-8601 com deslocamento local para o disparo do lembrete de uma tarefa
 * avulsa pendente com `startDate` (`dd/mm/aaaa`) e `startTime` (`hh:mm`) estritamente no futuro
 * em relação a `referenceIso` (RN-0011). Retorna `null` quando a tarefa não deve gerar lembrete.
 */
export function getTaskReminderTriggerAt(
  task: Pick<Task, "startDate" | "startTime" | "completed" | "routineId">,
  referenceIso: string,
): string | null {
  if (!isStandaloneTask(task) || task.completed || !task.startDate || !task.startTime) {
    return null;
  }

  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(task.startDate.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(task.startTime.trim());
  if (!dateMatch || !timeMatch) {
    return null;
  }

  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const offsetMatch = /([+-]\d{2}:\d{2}|Z)$/.exec(referenceIso.trim());
  const offset = offsetMatch ? offsetMatch[1] : "";
  const candidateIso = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}T${timeMatch[1]}:${timeMatch[2]}:00${offset}`;

  const triggerMs = Date.parse(candidateIso);
  const referenceMs = Date.parse(referenceIso);
  if (Number.isNaN(triggerMs) || Number.isNaN(referenceMs) || triggerMs <= referenceMs) {
    return null;
  }

  return candidateIso;
}
