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

  it("repassa só o toque em lembretes de tarefa e para de escutar ao encerrar (RF-0021 CA-06)", () => {
    const notifications = new FakeNotificationService();
    const useCases = new NotificationUseCases(notifications);
    const pressedIds: (string | undefined)[] = [];

    const unsubscribe = useCases.onTaskReminderPress((taskId) => {
      pressedIds.push(taskId);
    });
    notifications.emitNotificationResponse({ route: "/tasks", taskId: "t-1" });
    notifications.emitNotificationResponse({ route: "/focus-session" });
    unsubscribe();
    notifications.emitNotificationResponse({ route: "/tasks", taskId: "ignorada" });

    expect(pressedIds).toEqual(["t-1"]);
  });

  it("trata o toque de tarefa que abriu o app e deixa os de outras rotas para outro ouvinte (#270)", () => {
    const notifications = new FakeNotificationService();
    const useCases = new NotificationUseCases(notifications);

    notifications.setLaunchResponse({ route: "/focus-session" });
    const ignored: (string | undefined)[] = [];
    useCases.onTaskReminderPress((taskId) => {
      ignored.push(taskId);
    })();
    expect(ignored).toEqual([]);

    notifications.setLaunchResponse({ route: "/tasks", taskId: "t-9" });
    const pressedIds: (string | undefined)[] = [];
    useCases.onTaskReminderPress((taskId) => {
      pressedIds.push(taskId);
    })();
    // Já tratada: o próximo ouvinte não recebe a mesma resposta de novo.
    useCases.onTaskReminderPress((taskId) => {
      pressedIds.push(taskId);
    })();

    expect(pressedIds).toEqual(["t-9"]);
  });

  it("não escuta nada sem serviço de notificações", () => {
    const unsubscribe = new NotificationUseCases().onTaskReminderPress(() => undefined);

    expect(() => unsubscribe()).not.toThrow();
  });
});
