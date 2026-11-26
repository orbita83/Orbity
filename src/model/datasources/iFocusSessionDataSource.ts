import type { FocusSession, FocusTargetKind } from "@/model/entities/focusSession";

/** Persistência da sessão ativa e do histórico recente do Modo Foco (issue #217). */
export interface IFocusSessionDataSource {
  /** Retorna a sessão atualmente ativa (`running` ou `paused`), ou `null` se não houver. */
  getActive(): Promise<FocusSession | null>;
  /** Retorna a sessão encerrada mais recente para o card Última sessão da Tela Inicial. */
  getLatestEnded(): Promise<FocusSession | null>;
  /** Insere ou atualiza o estado de uma sessão de foco. */
  save(session: FocusSession): Promise<void>;
  /**
   * EC-0008: encerra qualquer sessão ativa vinculada à tarefa ou rotina removida, retornando
   * `true` caso alguma sessão ativa tenha sido encerrada.
   */
  endActiveByTarget(targetKind: FocusTargetKind, targetId: string, nowIso: string): Promise<boolean>;
}
