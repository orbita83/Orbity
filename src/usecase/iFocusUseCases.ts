import type { FocusSession, FocusTarget, FocusTargetKind } from "@/model/entities/focusSession";
import type { NotificationPermissionStatus } from "@/model/services/iNotificationService";

/** Casos de uso do cronômetro pomodoro do Modo Foco (RF-0019, RN-0001, UC-0010, issue #217). */
export interface IFocusUseCases {
  /** Instante atual do relógio injetado, para cálculo determinístico do tempo restante. */
  now(): string;
  /** Carrega alvos disponíveis, sessão ativa (validada contra EC-0008), última sessão e dias de sequência. */
  loadSnapshot(): Promise<{
    readonly targets: readonly FocusTarget[];
    readonly activeSession: FocusSession | null;
    readonly lastEndedSession: FocusSession | null;
    readonly streakDays: number;
    readonly nowIso: string;
  }>;
  /**
   * Inicia uma sessão de foco vinculada a uma tarefa avulsa ou rotina ativa (RN-0001, RF-0019).
   *
   * @throws {ValidationError} Caso o alvo não seja informado/encontrado ou a duração seja inválida.
   */
  startSession(input: {
    readonly targetKind: FocusTargetKind;
    readonly targetId: string;
    readonly durationMinutes?: number;
  }): Promise<FocusSession>;
  /** Pausa o ciclo em execução congelando o tempo restante e cancelando o aviso local. */
  pauseSession(): Promise<FocusSession>;
  /** Retoma o ciclo pausado recalculando o horário de término e reagendando o aviso local. */
  resumeSession(): Promise<FocusSession>;
  /** Conclui o ciclo atual e avança para a próxima fase (pausa curta, pausa longa ou foco). */
  advanceCycle(): Promise<FocusSession>;
  /** Encerra a sessão ativa sem penalidade (EC-0007), salvando apenas os minutos efetivamente focados. */
  endSession(): Promise<FocusSession | null>;
  /** Consulta ou solicita permissão de notificações sem bloquear o uso do Modo Foco (RF-0019 CA-06). */
  ensureNotificationPermission(): Promise<NotificationPermissionStatus>;
  /** Escuta o toque do estudante na notificação de término de ciclo para abrir a tela do Modo Foco. */
  onCycleNotificationPress(onPress: () => void): () => void;
}
