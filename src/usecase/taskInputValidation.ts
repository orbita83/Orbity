import {
  type CreateTaskInput,
  type NormalizedCreateTaskInput,
  isTaskCategoryId,
} from "@/model/entities/task";
import { ValidationError } from "@/model/errors";

const DISPLAY_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const DISPLAY_TIME_PATTERN = /^(\d{2}):(\d{2})$/;

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

function normalizeOptionalText(value?: string | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
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

/** Título obrigatório (tarefas.md, G4). Devolve o título sem espaços nas pontas. */
export function validateTaskTitle(value: string): string {
  const title = value.trim();
  if (title.length === 0) {
    throw new ValidationError("Dê um título para a tarefa.", "title");
  }
  return title;
}

/** Valida e normaliza a entrada de criação de tarefa (tarefas.md, G4). */
export function validateCreateTaskInput(input: CreateTaskInput): NormalizedCreateTaskInput {
  const title = validateTaskTitle(input.title);

  const description = normalizeOptionalText(input.description);
  const startDate = normalizeDisplayDate(input.startDate);
  const startTime = normalizeDisplayTime(input.startTime);
  const endDate = normalizeDisplayDate(input.endDate);
  const endTime = normalizeDisplayTime(input.endTime);

  validateDateTimeFields({ startDate, startTime, endDate, endTime });

  if (input.category !== undefined && !isTaskCategoryId(input.category)) {
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

/** Datas e horas válidas, e término igual ou depois do início (tarefas.md, G4). */
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
