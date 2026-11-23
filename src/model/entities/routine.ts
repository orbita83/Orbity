import type { LocalDate } from "@/model/entities/localDate";
import type { CategoryId } from "@/model/entities/category";
import type { Task } from "@/model/entities/task";
import { ValidationError } from "@/model/errors";

/**
 * Ícones que o formulário de rotina oferece hoje (protótipo 3.1), na ordem dele; a lista de categorias do DataSource substitui esta na #213.
 * São ids: os mesmos das categorias de tarefa, mais "general", o padrão (rotinas.md, R8). O símbolo
 * e o rótulo de cada id ficam na apresentação (issue #159).
 */
export const ROUTINE_ICONS: readonly RoutineIcon[] = ["general", "reading", "mathematics", "languages", "science", "programming", "music"];
/** "general" ou o id de uma categoria (categorias.md, issue #212): quais categorias existem é decidido pelo DataSource. */
export type RoutineIcon = "general" | CategoryId;
export const DEFAULT_ROUTINE_ICON: RoutineIcon = "general";

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

/** Próximo dia em que a rotina volta a acontecer após uma data de referência (RF-0012 CA-04 e CA-05). */
export type NextActiveDay = {
  /** Próxima data local em que a rotina acontece (sempre posterior à data de referência). */
  readonly date: LocalDate;
  /** Dia da semana correspondente (0 = domingo .. 6 = sábado). */
  readonly weekday: Weekday;
  /** Quantidade de dias à frente (1 = amanhã .. 7 = próxima ocorrência no mesmo dia da semana). */
  readonly daysAhead: 1 | 2 | 3 | 4 | 5 | 6 | 7;
};

/** Rotina como a lista a apresenta: o estado de hoje já calculado. */
export type RoutineOverview = {
  readonly routine: Routine;
  readonly taskCount: number;
  /** Hoje é um dos dias configurados (RF-0012 CA-04). */
  readonly activeToday: boolean;
  /** A ocorrência de hoje está concluída (RF-0011). */
  readonly doneToday: boolean;
  /** Próximo retorno da rotina após a data de hoje (issue #210). */
  readonly nextActiveDay?: NextActiveDay;
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

/**
 * Calcula o próximo dia ativo da rotina estritamente posterior a `from` (RF-0012 CA-04, issue #210).
 * Cobre todos os casos: todos os dias (1), dia único (7), múltiplos dias e virada de semana.
 */
export function nextActiveDay(routine: Pick<Routine, "days">, from: LocalDate): NextActiveDay {
  if (!routine.days.some(isWeekday)) {
    throw new ValidationError("Escolha pelo menos um dia.");
  }
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = from.addDays(offset);
    if (isRoutineActiveOn(routine, candidate)) {
      return Object.freeze({
        date: candidate,
        weekday: weekdayOf(candidate),
        daysAhead: offset as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      });
    }
  }
  throw new ValidationError("Escolha pelo menos um dia.");
}
