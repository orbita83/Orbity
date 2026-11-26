import type { FocusTarget } from "@/model/entities/focusSession";
import type { LocalDate } from "@/model/entities/localDate";

/** Leitura de tarefas e rotinas para a Home e para o vínculo do Modo Foco (RN-0001, RN-0007, issue #217). */
export interface IActivityDataSource {
  /**
   * Concluídas e total, lidos juntos para não ficarem inconsistentes entre si. Tarefas avulsas
   * contam pelo total geral; cada rotina de `today` conta como uma unidade, concluída quando a
   * ocorrência do dia está concluída. As tarefas de rotina não contam sozinhas.
   */
  getProgressCounts(today: LocalDate): Promise<{ completed: number; total: number }>;
  /** Se existe ao menos uma tarefa ou rotina que o Modo Foco possa usar como alvo. */
  hasFocusTargets(): Promise<boolean>;
  /** Lista as tarefas avulsas e rotinas ativas que podem ser vinculadas a uma sessão de foco (RN-0001). */
  listFocusTargets?(): Promise<FocusTarget[]>;
}
