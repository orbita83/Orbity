import { NotificationServiceError } from "@/model/errors";
import type { INotificationService } from "@/model/services/iNotificationService";
import { NotificationUseCases } from "@/usecase/notificationUseCases";
import { FakeNotificationService } from "../../tests/fixtures/fakeNotificationService";

describe("NotificationUseCases", () => {
  it("configura a apresentação em primeiro plano no serviço de notificações", () => {
    const notifications = new FakeNotificationService();
    const useCases = new NotificationUseCases(notifications);

    useCases.startForegroundPresentation();

    expect(notifications.foregroundPresentationCalls).toBe(1);
  });

  it("não propaga falha do serviço ao configurar a apresentação", () => {
    const notifications = new FakeNotificationService();
    const failing: INotificationService = Object.assign(Object.create(notifications), {
      configureForegroundPresentation: () => {
        throw new NotificationServiceError("falha nativa");
      },
    });
    const useCases = new NotificationUseCases(failing);

    expect(() => useCases.startForegroundPresentation()).not.toThrow();
  });

  it("não faz nada sem serviço de notificações ou sem suporte à apresentação", () => {
    expect(() => new NotificationUseCases().startForegroundPresentation()).not.toThrow();

    const withoutSupport: INotificationService = {
      getPermissionStatus: async () => "granted",
      requestPermission: async () => "granted",
      schedule: async () => undefined,
      cancel: async () => undefined,
      listScheduled: async () => [],
    };
    expect(() => new NotificationUseCases(withoutSupport).startForegroundPresentation()).not.toThrow();
  });
});
