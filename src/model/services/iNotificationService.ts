export type NotificationPermissionStatus = "granted" | "denied" | "undetermined";

export type ScheduleNotificationInput = {
  /** Identificador lógico determinístico do lembrete (ex.: "task-reminder:123" ou "focus-cycle-end"). */
  readonly id: string;
  readonly title: string;
  readonly body: string;
  /** Data e hora do disparo em ISO-8601 com deslocamento local (ex.: "2026-11-22T18:30:00-03:00"). */
  readonly triggerAt: string;
  /** Metadados opcionais puros do domínio (ex.: `{ route: "/tasks", taskId: "123" }`). */
  readonly data?: Readonly<Record<string, string>>;
};

export type ScheduledNotification = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly triggerAt: string;
  readonly data?: Readonly<Record<string, string>>;
};

/**
 * Contrato puro de notificações locais do domínio (ADR-0002).
 * Nenhum tipo ou constante do `expo-notifications` atravessa esta fronteira.
 */
export interface INotificationService {
  /** Consulta o estado atual da permissão de notificações sem abrir o diálogo do sistema. */
  getPermissionStatus(): Promise<NotificationPermissionStatus>;
  /** Solicita a permissão ao estudante no momento contextual (nunca na primeira abertura do app). */
  requestPermission(): Promise<NotificationPermissionStatus>;
  /** Agenda (ou substitui, se já existir com o mesmo `id`) um lembrete local para a data e hora informadas. */
  schedule(input: ScheduleNotificationInput): Promise<void>;
  /** Cancela um lembrete agendado pelo seu identificador lógico. Não falha se não existir. */
  cancel(id: string): Promise<void>;
  /** Lista todos os lembretes atualmente agendados para reconciliação. */
  listScheduled(): Promise<ScheduledNotification[]>;
}
