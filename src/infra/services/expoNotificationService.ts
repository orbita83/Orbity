import type * as Notifications from "expo-notifications";
import { DomainError, NotificationServiceError, ValidationError } from "@/model/errors";
import type {
  INotificationService,
  NotificationPermissionStatus,
  ScheduleNotificationInput,
  ScheduledNotification,
} from "@/model/services/iNotificationService";

export const ORBITY_NOTIFICATION_CHANNEL_ID = "orbity-reminders";
export const ORBITY_NOTIFICATION_CHANNEL_NAME = "Lembretes de estudo";
export const ORBITY_NOTIFICATION_CHANNEL_DESCRIPTION =
  "Avisos acolhedores das suas tarefas agendadas e sessões de foco.";

const TRIGGER_AT_META_KEY = "__orbityTriggerAt";

type ExpoNotificationsModule = typeof Notifications;

const loadNotificationsModule = (): ExpoNotificationsModule => {
  // Carregamento sob demanda para que importar o container não dispare efeitos colaterais nativos.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-notifications") as ExpoNotificationsModule;
};

const toNotificationServiceError = (error: unknown, fallbackMessage?: string): DomainError => {
  if (error instanceof DomainError) {
    return error;
  }
  return new NotificationServiceError(fallbackMessage);
};

const normalizePermissionStatus = (
  notifications: ExpoNotificationsModule,
  response: Pick<Notifications.NotificationPermissionsStatus, "status" | "granted">,
): NotificationPermissionStatus => {
  if (response.granted || response.status === notifications.PermissionStatus.GRANTED) {
    return "granted";
  }
  if (response.status === notifications.PermissionStatus.DENIED) {
    return "denied";
  }
  return "undetermined";
};

const sanitizeData = (
  raw: Record<string, unknown> | undefined,
): Readonly<Record<string, string>> | undefined => {
  if (!raw) return undefined;
  const entries: [string, string][] = [];
  for (const [key, value] of Object.entries(raw)) {
    if (key !== TRIGGER_AT_META_KEY && typeof value === "string") {
      entries.push([key, value]);
    }
  }
  return entries.length > 0 ? Object.freeze(Object.fromEntries(entries)) : undefined;
};

/**
 * Adaptador concreto de notificações locais sobre `expo-notifications` (ADR-0002).
 * Único arquivo do repositório autorizado a importar `expo-notifications`.
 */
export class ExpoNotificationService implements INotificationService {
  private channelInitialized = false;

  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      const notifications = loadNotificationsModule();
      const status = await notifications.getPermissionsAsync();
      return normalizePermissionStatus(notifications, status);
    } catch (error) {
      throw toNotificationServiceError(error, "Não foi possível consultar a permissão de notificações.");
    }
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    try {
      const notifications = loadNotificationsModule();
      await this.ensureAndroidChannel(notifications);
      const current = await notifications.getPermissionsAsync();
      if (current.granted || current.status === notifications.PermissionStatus.GRANTED) {
        return "granted";
      }
      const requested = await notifications.requestPermissionsAsync();
      return normalizePermissionStatus(notifications, requested);
    } catch (error) {
      throw toNotificationServiceError(error, "Não foi possível solicitar a permissão de notificações.");
    }
  }

  async schedule(input: ScheduleNotificationInput): Promise<void> {
    const id = input.id.trim();
    if (!id) {
      throw new ValidationError("O identificador da notificação é obrigatório.");
    }
    const triggerMs = Date.parse(input.triggerAt);
    if (Number.isNaN(triggerMs)) {
      throw new ValidationError(`Data de disparo inválida para notificação: "${input.triggerAt}".`);
    }

    try {
      const notifications = loadNotificationsModule();
      await this.ensureAndroidChannel(notifications);
      await notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: input.title,
          body: input.body,
          data: {
            ...(input.data ?? {}),
            [TRIGGER_AT_META_KEY]: input.triggerAt,
          },
        },
        trigger: {
          type: notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(triggerMs),
          channelId: ORBITY_NOTIFICATION_CHANNEL_ID,
        },
      });
    } catch (error) {
      throw toNotificationServiceError(error, "Não foi possível agendar a notificação local.");
    }
  }

  async cancel(id: string): Promise<void> {
    const trimmed = id.trim();
    if (!trimmed) return;
    try {
      const notifications = loadNotificationsModule();
      await notifications.cancelScheduledNotificationAsync(trimmed);
    } catch (error) {
      throw toNotificationServiceError(error, "Não foi possível cancelar a notificação local.");
    }
  }

  async listScheduled(): Promise<ScheduledNotification[]> {
    try {
      const notifications = loadNotificationsModule();
      const requests = await notifications.getAllScheduledNotificationsAsync();
      return requests.map((request) => {
        const rawData =
          request.content.data && typeof request.content.data === "object"
            ? (request.content.data as Record<string, unknown>)
            : undefined;
        const storedTriggerAt =
          typeof rawData?.[TRIGGER_AT_META_KEY] === "string" ? (rawData[TRIGGER_AT_META_KEY] as string) : "";
        const data = sanitizeData(rawData);
        return Object.freeze({
          id: request.identifier,
          title: request.content.title ?? "",
          body: request.content.body ?? "",
          triggerAt: storedTriggerAt,
          ...(data ? { data } : {}),
        });
      });
    } catch (error) {
      throw toNotificationServiceError(error, "Não foi possível listar as notificações agendadas.");
    }
  }

  onNotificationResponse(listener: (data: Readonly<Record<string, string>>) => void): () => void {
    try {
      const notifications = loadNotificationsModule();
      if (typeof notifications.addNotificationResponseReceivedListener !== "function") {
        return () => undefined;
      }
      const subscription = notifications.addNotificationResponseReceivedListener((response) => {
        const rawData =
          response?.notification?.request?.content?.data &&
          typeof response.notification.request.content.data === "object"
            ? (response.notification.request.content.data as Record<string, unknown>)
            : undefined;
        const data = sanitizeData(rawData);
        if (data) {
          listener(data);
        }
      });
      return () => {
        subscription?.remove?.();
      };
    } catch {
      return () => undefined;
    }
  }

  private async ensureAndroidChannel(notifications: ExpoNotificationsModule): Promise<void> {
    if (this.channelInitialized) return;
    await notifications.setNotificationChannelAsync(ORBITY_NOTIFICATION_CHANNEL_ID, {
      name: ORBITY_NOTIFICATION_CHANNEL_NAME,
      description: ORBITY_NOTIFICATION_CHANNEL_DESCRIPTION,
      importance: notifications.AndroidImportance.HIGH,
    });
    this.channelInitialized = true;
  }
}
