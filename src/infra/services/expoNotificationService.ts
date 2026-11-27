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

type ResponseListener = (data: Readonly<Record<string, string>>) => boolean | void;

/** Cada registro tem a sua entrada, para que o mesmo ouvinte registrado duas vezes saia de forma independente. */
type ResponseListenerEntry = { readonly listener: ResponseListener };

type ParsedResponse = {
  /** Identifica a resposta para não tratá-la duas vezes; ausente quando a notificação não tem identificador. */
  readonly key?: string;
  readonly data: Readonly<Record<string, string>>;
};

const parseResponse = (response: Notifications.NotificationResponse | null | undefined): ParsedResponse | undefined => {
  const notification = response?.notification;
  const content = notification?.request?.content;
  const rawData =
    content?.data && typeof content.data === "object" ? (content.data as Record<string, unknown>) : undefined;
  const data = sanitizeData(rawData);
  if (!data) return undefined;
  const identifier = notification?.request?.identifier;
  if (typeof identifier !== "string" || !identifier) return { data };
  return { key: `${identifier}|${String(notification?.date ?? "")}|${String(response?.actionIdentifier ?? "")}`, data };
};

const notifyListener = (entry: ResponseListenerEntry, data: Readonly<Record<string, string>>): boolean => {
  try {
    return entry.listener(data) === true;
  } catch {
    // Uma falha num ouvinte não impede que os demais recebam a resposta.
    return false;
  }
};

/**
 * Adaptador concreto de notificações locais sobre `expo-notifications` (ADR-0002).
 * Único arquivo do repositório autorizado a importar `expo-notifications`.
 */
export class ExpoNotificationService implements INotificationService {
  private channelInitialized = false;
  private foregroundPresentationConfigured = false;
  private readonly responseListeners = new Set<ResponseListenerEntry>();
  /** Chaves das respostas já tratadas nesta execução do app (o container é único por processo). */
  private readonly handledResponseKeys = new Set<string>();
  private responseSubscription: { remove?: () => void } | undefined;
  private launchResponseChecked = false;
  /** Última resposta que nenhum ouvinte tratou ainda (a que abriu o app, ou uma que chegou antes do seu ouvinte). */
  private pendingResponse: ParsedResponse | undefined;

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

  configureForegroundPresentation(): void {
    if (this.foregroundPresentationConfigured) return;
    try {
      const notifications = loadNotificationsModule();
      if (typeof notifications.setNotificationHandler !== "function") {
        return;
      }
      notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          // No Android, sem som o banner não aparece, qualquer que seja a prioridade do canal.
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      this.foregroundPresentationConfigured = true;
    } catch (error) {
      throw toNotificationServiceError(
        error,
        "Não foi possível configurar a exibição de lembretes com o app aberto.",
      );
    }
  }

  onNotificationResponse(listener: ResponseListener): () => void {
    try {
      const notifications = loadNotificationsModule();
      if (typeof notifications.addNotificationResponseReceivedListener !== "function") {
        return () => undefined;
      }
      const entry: ResponseListenerEntry = { listener };
      this.responseListeners.add(entry);
      if (!this.responseSubscription) {
        this.responseSubscription = notifications.addNotificationResponseReceivedListener((response) => {
          this.dispatchLiveResponse(parseResponse(response));
        });
      }
      this.readLaunchResponse(notifications);
      this.offerPendingResponse(entry);
      return () => {
        if (!this.responseListeners.delete(entry)) return;
        if (this.responseListeners.size === 0) {
          this.responseSubscription?.remove?.();
          this.responseSubscription = undefined;
        }
      };
    } catch {
      return () => undefined;
    }
  }

  /** Lê uma única vez a resposta que abriu o app e a limpa no nativo, para que não seja tratada de novo. */
  private readLaunchResponse(notifications: ExpoNotificationsModule): void {
    if (this.launchResponseChecked) return;
    this.launchResponseChecked = true;
    try {
      if (typeof notifications.getLastNotificationResponse !== "function") return;
      const launch = parseResponse(notifications.getLastNotificationResponse());
      notifications.clearLastNotificationResponse?.();
      if (launch && !this.isHandled(launch)) {
        this.pendingResponse = launch;
      }
    } catch {
      // Sem a resposta de inicialização, os toques seguintes continuam chegando pelo ouvinte nativo.
    }
  }

  /** Oferece a resposta pendente ao novo ouvinte; ela é descartada quando algum ouvinte a trata. */
  private offerPendingResponse(entry: ResponseListenerEntry): void {
    const pending = this.pendingResponse;
    if (!pending) return;
    if (this.isHandled(pending)) {
      this.pendingResponse = undefined;
      return;
    }
    if (notifyListener(entry, pending.data)) {
      this.markHandled(pending);
      this.pendingResponse = undefined;
    }
  }

  /**
   * Entrega a resposta a todos os ouvintes atuais. Se nenhum a tratar (ex.: no início a frio, o aviso do Modo
   * Foco chega antes de a Tela Inicial assinar), ela fica pendente para os próximos ouvintes, em vez de se perder.
   */
  private dispatchLiveResponse(response: ParsedResponse | undefined): void {
    if (!response || this.isHandled(response)) return;
    let handled = false;
    for (const entry of [...this.responseListeners]) {
      if (notifyListener(entry, response.data)) {
        handled = true;
      }
    }
    if (handled) {
      this.markHandled(response);
      if (response.key !== undefined && this.pendingResponse?.key === response.key) {
        this.pendingResponse = undefined;
      }
      return;
    }
    this.pendingResponse = response;
  }

  private isHandled(response: ParsedResponse): boolean {
    return response.key !== undefined && this.handledResponseKeys.has(response.key);
  }

  private markHandled(response: ParsedResponse): void {
    if (response.key !== undefined) {
      this.handledResponseKeys.add(response.key);
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
