import { ValidationError } from "@/model/errors";

export type TaskFilter = "all" | "pending" | "completed";

export type TaskCategoryIcon = "calculate" | "menu_book" | "translate" | "science" | "code" | "music_note";

export type TaskCategoryId = "matematica" | "leitura" | "idiomas" | "ciencias" | "programacao" | "musica";

export type TaskCategoryOption = {
  readonly id: TaskCategoryId;
  readonly label: string;
  readonly icon: TaskCategoryIcon;
};

/** Categorias iniciais de estudo exibidas na criação e nos cards de tarefas. */
export const TASK_CATEGORIES: readonly TaskCategoryOption[] = Object.freeze([
  Object.freeze({ id: "matematica", label: "Matemática", icon: "calculate" }),
  Object.freeze({ id: "leitura", label: "Leitura", icon: "menu_book" }),
  Object.freeze({ id: "idiomas", label: "Idiomas", icon: "translate" }),
  Object.freeze({ id: "ciencias", label: "Ciências", icon: "science" }),
  Object.freeze({ id: "programacao", label: "Programação", icon: "code" }),
  Object.freeze({ id: "musica", label: "Música", icon: "music_note" }),
]);

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

const DISPLAY_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const DISPLAY_TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export function isValidTaskCategoryId(value: string): value is TaskCategoryId {
  return TASK_CATEGORIES.some((category) => category.id === value);
}

export function getTaskCategoryOption(id?: string | null): TaskCategoryOption | undefined {
  if (!id) {
    return undefined;
  }
  return TASK_CATEGORIES.find((category) => category.id === id);
}

/** Valida uma data digitada no formato brasileiro `dd/mm/aaaa` existente no calendário. */
export function isValidDisplayDate(value: string): boolean {
  const match = DISPLAY_DATE_PATTERN.exec(value.trim());
  if (!match) {
    return false;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  return probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
}

/** Valida um horário no formato 24h `hh:mm`. */
export function isValidDisplayTime(value: string): boolean {
  const match = DISPLAY_TIME_PATTERN.exec(value.trim());
  if (!match) {
    return false;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function toIsoDateKey(displayDate: string): string {
  const [day, month, year] = displayDate.split("/");
  return `${year}-${month}-${day}`;
}

function extractDigitsFromSegments(value: string, separatorPattern: RegExp, maxPadIndex: number): string {
  const rawSegments = value.split(separatorPattern);
  return rawSegments
    .map((segment, index) => {
      const digits = segment.replace(/\D/g, "");
      const hasFollowingSeparator = index < rawSegments.length - 1;
      if (index <= maxPadIndex && hasFollowingSeparator && digits.length === 1) {
        return `0${digits}`;
      }
      return digits;
    })
    .join("");
}

/** Formata progressivamente a digitação de uma data para o padrão brasileiro `dd/mm/aaaa`. */
export function formatDisplayDateInput(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }

  const trailingSeparator = /[/.-]$/.test(trimmed);
  const digits = extractDigitsFromSegments(trimmed, /[/.-]+/, 1).slice(0, 8);
  if (digits.length === 0) {
    return "";
  }
  if (digits.length <= 2) {
    return digits.length === 2 && trailingSeparator ? `${digits}/` : digits;
  }
  if (digits.length <= 4) {
    const formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits.length === 4 && trailingSeparator ? `${formatted}/` : formatted;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/** Formata progressivamente a digitação de um horário 24h para o padrão `hh:mm`. */
export function formatDisplayTimeInput(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }

  const trailingSeparator = /[:hH.-]$/.test(trimmed);
  const hasSeparator = /[:hH.-]/.test(trimmed);
  let digits = extractDigitsFromSegments(trimmed, /[:hH.-]+/, 0);
  if (digits.length === 0) {
    return "";
  }
  if (!hasSeparator && digits.length >= 2 && digits[0] >= "3") {
    digits = `0${digits}`;
  }
  digits = digits.slice(0, 4);

  if (digits.length <= 2) {
    return digits.length === 2 && trailingSeparator ? `${digits}:` : digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

/** Normaliza uma data digitada (ex.: `15112026`, `5/3/2026`, `15-11-2026`) para `dd/mm/aaaa`. */
export function normalizeDisplayDate(value?: string | null): string | undefined {
  const trimmed = normalizeOptionalText(value);
  if (!trimmed) {
    return undefined;
  }
  const separatedMatch = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(trimmed);
  if (separatedMatch) {
    return `${separatedMatch[1].padStart(2, "0")}/${separatedMatch[2].padStart(2, "0")}/${separatedMatch[3]}`;
  }
  const digitsMatch = /^(\d{2})(\d{2})(\d{4})$/.exec(trimmed);
  if (digitsMatch) {
    return `${digitsMatch[1]}/${digitsMatch[2]}/${digitsMatch[3]}`;
  }
  return trimmed;
}

/** Normaliza um horário digitado (ex.: `0830`, `830`, `8:30`, `8:5`, `08h30`) para `hh:mm`. */
export function normalizeDisplayTime(value?: string | null): string | undefined {
  const trimmed = normalizeOptionalText(value);
  if (!trimmed) {
    return undefined;
  }
  const separatedMatch = /^(\d{1,2})[:hH.-](\d{1,2})$/.exec(trimmed);
  if (separatedMatch) {
    return `${separatedMatch[1].padStart(2, "0")}:${separatedMatch[2].padStart(2, "0")}`;
  }
  const digitsMatch = /^(\d{1,2})(\d{2})$/.exec(trimmed);
  if (digitsMatch) {
    return `${digitsMatch[1].padStart(2, "0")}:${digitsMatch[2]}`;
  }
  return trimmed;
}

function normalizeOptionalText(value?: string | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Valida e normaliza o formulário/entrada de criação de tarefa conforme regras de domínio. */
export function validateCreateTaskInput(input: CreateTaskInput): NormalizedCreateTaskInput {
  const title = input.title.trim();
  if (title.length === 0) {
    throw new ValidationError("Dê um título para a tarefa.");
  }

  const description = normalizeOptionalText(input.description);
  const startDate = normalizeDisplayDate(input.startDate);
  const startTime = normalizeDisplayTime(input.startTime);
  const endDate = normalizeDisplayDate(input.endDate);
  const endTime = normalizeDisplayTime(input.endTime);

  validateDateTimeFields({ startDate, startTime, endDate, endTime });

  if (input.category !== undefined && !isValidTaskCategoryId(input.category)) {
    throw new ValidationError("Categoria de tarefa inválida.");
  }

  return {
    title,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    category: input.category,
  };
}

export function validateDateTimeFields(values: {
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}): void {
  if (values.startDate && !isValidDisplayDate(values.startDate)) {
    throw new ValidationError("Use uma data de início válida no formato dd/mm/aaaa.");
  }
  if (values.endDate && !isValidDisplayDate(values.endDate)) {
    throw new ValidationError("Use uma data de término válida no formato dd/mm/aaaa.");
  }
  if (values.startTime && !isValidDisplayTime(values.startTime)) {
    throw new ValidationError("Use uma hora de início válida no formato hh:mm.");
  }
  if (values.endTime && !isValidDisplayTime(values.endTime)) {
    throw new ValidationError("Use uma hora de término válida no formato hh:mm.");
  }

  if (values.startDate && values.endDate) {
    const startKey = toIsoDateKey(values.startDate);
    const endKey = toIsoDateKey(values.endDate);
    if (endKey < startKey) {
      throw new ValidationError("A data de término precisa ser igual ou posterior à de início.");
    }
    if (endKey === startKey && values.startTime && values.endTime && values.endTime < values.startTime) {
      throw new ValidationError("A hora de término precisa ser igual ou posterior à de início.");
    }
  } else if (!values.startDate && !values.endDate && values.startTime && values.endTime && values.endTime < values.startTime) {
    throw new ValidationError("A hora de término precisa ser igual ou posterior à de início.");
  }
}

function shortDisplayDate(displayDate: string): string {
  return displayDate.slice(0, 5);
}

/** Formata data e horário de prazo no padrão curto dos cards (ex.: `19/10 · 08:00–09:00`). */
export function formatTaskDueLabel(
  task: Pick<Task, "startDate" | "startTime" | "endDate" | "endTime">,
): string | undefined {
  const { startDate, startTime, endDate, endTime } = task;
  const timeRange = startTime && endTime ? `${startTime}–${endTime}` : (startTime ?? (endTime ? `até ${endTime}` : undefined));

  if (startDate && endDate && startDate !== endDate) {
    const startPart = `${shortDisplayDate(startDate)}${startTime ? ` ${startTime}` : ""}`;
    const endPart = `${shortDisplayDate(endDate)}${endTime ? ` ${endTime}` : ""}`;
    return `${startPart} – ${endPart}`;
  }

  const singleDate = startDate ?? endDate;
  if (singleDate) {
    const dateLabel = !startDate && endDate ? `Até ${shortDisplayDate(singleDate)}` : shortDisplayDate(singleDate);
    if (!startDate && endDate && !startTime && endTime) {
      return `${dateLabel} · ${endTime}`;
    }
    return timeRange ? `${dateLabel} · ${timeRange}` : dateLabel;
  }

  if (startTime && endTime) {
    return `${startTime}–${endTime}`;
  }
  if (startTime) {
    return startTime;
  }
  if (endTime) {
    return `Até ${endTime}`;
  }
  return undefined;
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
