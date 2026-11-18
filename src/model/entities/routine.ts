import type { LocalDate } from "@/model/entities/local-date";
import type { Task } from "@/model/entities/task";
import { ValidationError } from "@/model/errors";

/** Ícones que o estudante pode escolher para uma rotina (protótipo 3.1). "Geral" é o padrão. */
export const ROUTINE_ICONS = ["track_changes", "menu_book", "calculate", "translate", "science", "code", "music_note"] as const;
export type RoutineIcon = (typeof ROUTINE_ICONS)[number];
export const DEFAULT_ROUTINE_ICON: RoutineIcon = "track_changes";

/** Dia da semana, 0 = domingo (RF-0012). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Routine = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly icon: RoutineIcon;
  /** Dias ativos, sem repetição e em ordem crescente. */
  readonly days: readonly Weekday[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateRoutineInput = {
  readonly title: string;
  readonly description?: string;
  readonly icon?: string;
  readonly days: readonly number[];
  /** Títulos das tarefas, na ordem em que devem aparecer. */
  readonly tasks: readonly string[];
};

export type NormalizedCreateRoutineInput = {
  readonly title: string;
  readonly description?: string;
  readonly icon: RoutineIcon;
  readonly days: readonly Weekday[];
  readonly tasks: readonly string[];
};

/** Tarefa no formulário de edição: com `id`, é uma tarefa que já existe; sem, é nova (#137). */
export type RoutineTaskDraft = {
  readonly id?: string;
  readonly title: string;
};

/** Edição de rotina (RF-0009, UC-0007): os mesmos campos da criação, e as tarefas na ordem final. */
export type UpdateRoutineInput = Omit<CreateRoutineInput, "tasks"> & {
  readonly id: string;
  readonly tasks: readonly RoutineTaskDraft[];
};

export type NormalizedUpdateRoutineInput = Omit<NormalizedCreateRoutineInput, "tasks"> & {
  readonly id: string;
  readonly tasks: readonly RoutineTaskDraft[];
};

/** Rotina como a lista a apresenta: o estado de hoje já calculado. */
export type RoutineOverview = {
  readonly routine: Routine;
  readonly taskCount: number;
  /** Hoje é um dos dias configurados (RF-0012 CA-04). */
  readonly activeToday: boolean;
  /** A ocorrência de hoje está concluída (RF-0011). */
  readonly doneToday: boolean;
};

export type RoutineTaskState = {
  readonly task: Task;
  /** Marcada na ocorrência de hoje; recomeça desmarcada no dia seguinte (R2). */
  readonly checkedToday: boolean;
};

/** Rotina como o detalhe a apresenta, com as tarefas em ordem. */
export type RoutineDetails = RoutineOverview & {
  readonly tasks: readonly RoutineTaskState[];
};

export function isRoutineIcon(value: string): value is RoutineIcon {
  return (ROUTINE_ICONS as readonly string[]).includes(value);
}

export function isWeekday(value: number): value is Weekday {
  return Number.isInteger(value) && value >= 0 && value <= 6;
}

/** Dia da semana de uma data local, sem depender do fuso do aparelho. */
export function weekdayOf(date: LocalDate): Weekday {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() as Weekday;
}

/** A rotina acontece nesta data (RF-0012 CA-04)? */
export function isRoutineActiveOn(routine: Pick<Routine, "days">, date: LocalDate): boolean {
  return routine.days.includes(weekdayOf(date));
}

type RoutineFields = Omit<CreateRoutineInput, "tasks">;
type NormalizedRoutineFields = Omit<NormalizedCreateRoutineInput, "tasks">;

/** Nome e pelo menos um dia são obrigatórios; ícone e dias precisam ser válidos (RF-0007, RF-0012). */
function validateRoutineFields(input: RoutineFields): NormalizedRoutineFields {
  const title = input.title.trim();
  if (title.length === 0) {
    throw new ValidationError("Dê um nome para a rotina.");
  }

  const icon = input.icon ?? DEFAULT_ROUTINE_ICON;
  if (!isRoutineIcon(icon)) {
    throw new ValidationError("Ícone de rotina inválido.");
  }

  if (!input.days.every(isWeekday)) {
    throw new ValidationError("Dia da semana inválido.");
  }
  const days = [...new Set(input.days as readonly Weekday[])].sort((a, b) => a - b);
  if (days.length === 0) {
    throw new ValidationError("Escolha pelo menos um dia.");
  }

  const description = input.description?.trim() || undefined;
  return { title, description, icon, days };
}

/** Valida e normaliza a criação de rotina (RF-0007, RF-0012). Tarefas vazias são ignoradas. */
export function validateCreateRoutineInput(input: CreateRoutineInput): NormalizedCreateRoutineInput {
  const tasks = input.tasks.map((task) => task.trim()).filter((task) => task.length > 0);
  return { ...validateRoutineFields(input), tasks };
}

/** Valida e normaliza a edição de rotina com as mesmas regras da criação (RF-0009 CA-03 e CA-04). */
export function validateUpdateRoutineInput(input: UpdateRoutineInput): NormalizedUpdateRoutineInput {
  const tasks = input.tasks
    .map((task) => ({ ...(task.id ? { id: task.id } : {}), title: task.title.trim() }))
    .filter((task) => task.title.length > 0);
  return { ...validateRoutineFields(input), id: input.id, tasks };
}
