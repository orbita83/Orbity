import { ValidationError } from "@/model/errors";
import type {
  INotificationService,
  NotificationPermissionStatus,
  ScheduleNotificationInput,
  ScheduledNotification,
} from "@/model/services/iNotificationService";

type ResponseListener = (data: Readonly<Record<string, string>>) => boolean | void;

/**
 * Implementação Fake em memória de `INotificationService` para testes automatizados
 * (`docs/06-quality/guia-testes.md`, ADR-0002).
 */
export class FakeNotificationService implements INotificationService {
  private permissionStatus: NotificationPermissionStatus;
  private nextRequestedStatus: NotificationPermissionStatus;
  private readonly scheduled = new Map<string, ScheduledNotification>();
  private readonly responseListeners = new Set<ResponseListener>();
  private pendingLaunchResponse: Readonly<Record<string, string>> | undefined;

  constructor(
    initialStatus: NotificationPermissionStatus = "granted",
    requestedStatus: NotificationPermissionStatus = initialStatus === "undetermined" ? "granted" : initialStatus,
  ) {
    this.permissionStatus = initialStatus;
    this.nextRequestedStatus = requestedStatus;
  }

  setPermissionStatus(status: NotificationPermissionStatus, nextRequestedStatus: NotificationPermissionStatus = status): void {
    this.permissionStatus = status;
    this.nextRequestedStatus = nextRequestedStatus;
  }

  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    return this.permissionStatus;
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    if (this.permissionStatus !== "granted") {
      this.permissionStatus = this.nextRequestedStatus;
    }
    return this.permissionStatus;
  }

  async schedule(input: ScheduleNotificationInput): Promise<void> {
    const id = input.id.trim();
    if (!id) {
      throw new ValidationError("O identificador da notificação é obrigatório.");
    }
    if (Number.isNaN(Date.parse(input.triggerAt))) {
      throw new ValidationError(`Data de disparo inválida para notificação: "${input.triggerAt}".`);
    }
    const item: ScheduledNotification = Object.freeze({
      id,
      title: input.title,
      body: input.body,
      triggerAt: input.triggerAt,
      ...(input.data ? { data: Object.freeze({ ...input.data }) } : {}),
    });
    this.scheduled.set(id, item);
  }

  async cancel(id: string): Promise<void> {
    const trimmed = id.trim();
    if (!trimmed) return;
    this.scheduled.delete(trimmed);
  }

  async listScheduled(): Promise<ScheduledNotification[]> {
    return [...this.scheduled.values()];
  }

  /** Quantas vezes a apresentação em primeiro plano foi configurada. */
  foregroundPresentationCalls = 0;

  configureForegroundPresentation(): void {
    this.foregroundPresentationCalls += 1;
  }

  /** Simula a resposta que abriu o app (início a frio), oferecida a cada novo ouvinte até um deles tratá-la. */
  setLaunchResponse(data: Readonly<Record<string, string>> | undefined): void {
    this.pendingLaunchResponse = data ? Object.freeze({ ...data }) : undefined;
  }

  onNotificationResponse(listener: ResponseListener): () => void {
    this.responseListeners.add(listener);
    if (this.pendingLaunchResponse && listener(this.pendingLaunchResponse) === true) {
      this.pendingLaunchResponse = undefined;
    }
    return () => {
      this.responseListeners.delete(listener);
    };
  }

  emitNotificationResponse(data: Readonly<Record<string, string>>): void {
    const frozen = Object.freeze({ ...data });
    for (const listener of [...this.responseListeners]) {
      listener(frozen);
    }
  }
}
