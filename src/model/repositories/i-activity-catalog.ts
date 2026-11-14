/**
 * Leitura de tarefas e rotinas para a Home. Provisório até a mudança de Tarefas e Rotinas:
 * o contrato de `getProgressCounts` pode mudar quando os pontos pendentes da RN-0007 forem decididos.
 */
export interface IActivityCatalog {
  /** Concluídas e total, lidos juntos para não ficarem inconsistentes entre si. */
  getProgressCounts(): Promise<{ completed: number; total: number }>;
  /** Se existe ao menos uma tarefa ou rotina que o Modo Foco possa usar como alvo. */
  hasFocusTargets(): Promise<boolean>;
}
