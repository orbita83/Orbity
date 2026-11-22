import type { LocalDate } from "@/model/entities/localDate";

/** Leitura de tarefas e rotinas para a Home (RN-0007, issue #138). */
export interface IActivityDataSource {
  /**
   * Concluídas e total, lidos juntos para não ficarem inconsistentes entre si. Tarefas avulsas
   * contam pelo total geral; cada rotina de `today` conta como uma unidade, concluída quando a
   * ocorrência do dia está concluída. As tarefas de rotina não contam sozinhas.
   */
  getProgressCounts(today: LocalDate): Promise<{ completed: number; total: number }>;
  /** Se existe ao menos uma tarefa ou rotina que o Modo Foco possa usar como alvo. */
  hasFocusTargets(): Promise<boolean>;
}
