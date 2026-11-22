import { ValidationError } from "@/model/errors";

/** Progresso geral de tarefas e rotinas (RN-0007). `ratio` é `null` quando não há nada a contar. */
export type Progress = {
  completed: number;
  total: number;
  ratio: number | null;
};

export function createProgress(completed: number, total: number): Progress {
  if (!Number.isInteger(completed) || !Number.isInteger(total)) {
    throw new ValidationError("O progresso deve ser contado em números inteiros.");
  }
  if (completed < 0 || total < 0) {
    throw new ValidationError("O progresso não pode ter valores negativos.");
  }
  if (completed > total) {
    throw new ValidationError("As atividades concluídas não podem passar do total.");
  }
  return { completed, total, ratio: total === 0 ? null : completed / total };
}
