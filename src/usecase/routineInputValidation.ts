import {
  type CreateRoutineInput,
  type NormalizedCreateRoutineInput,
  type NormalizedUpdateRoutineInput,
  type UpdateRoutineInput,
  type Weekday,
  DEFAULT_ROUTINE_ICON,
  isWeekday,
} from "@/model/entities/routine";
import { ValidationError } from "@/model/errors";

type RoutineFields = Omit<CreateRoutineInput, "tasks">;
type NormalizedRoutineFields = Omit<NormalizedCreateRoutineInput, "tasks">;

/** Nome e pelo menos um dia são obrigatórios; ícone e dias precisam ser válidos (RF-0007, RF-0012). */
function validateRoutineFields(input: RoutineFields): NormalizedRoutineFields {
  const title = input.title.trim();
  if (title.length === 0) {
    throw new ValidationError("Dê um nome para a rotina.");
  }

  const icon = input.icon ?? DEFAULT_ROUTINE_ICON;
  if (icon.trim().length === 0) {
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
