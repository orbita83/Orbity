import type { IActivityDataSource } from "@/model/datasources/i-activity-datasource";

/**
 * Provisório até existirem Tarefas e Rotinas: não há nada para contar nem para focar.
 * A Home mostra 0/0 e o Modo Foco fica bloqueado (RN-0007, D7).
 */
export class EmptyActivityDataSource implements IActivityDataSource {
  async getProgressCounts(): Promise<{ completed: number; total: number }> {
    return { completed: 0, total: 0 };
  }

  async hasFocusTargets(): Promise<boolean> {
    return false;
  }
}
