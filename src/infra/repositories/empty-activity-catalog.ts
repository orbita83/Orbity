import type { IActivityCatalog } from "@/model/repositories/i-activity-catalog";

/**
 * Provisório até existirem Tarefas e Rotinas: não há nada para contar nem para focar.
 * A Home mostra 0/0 e o Modo Foco fica bloqueado (RN-0007, D7).
 */
export class EmptyActivityCatalog implements IActivityCatalog {
  async getProgressCounts(): Promise<{ completed: number; total: number }> {
    return { completed: 0, total: 0 };
  }

  async hasFocusTargets(): Promise<boolean> {
    return false;
  }
}
