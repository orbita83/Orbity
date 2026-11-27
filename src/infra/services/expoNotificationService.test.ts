import {
  ExpoNotificationService,
  ORBITY_NOTIFICATION_CHANNEL_DESCRIPTION,
  ORBITY_NOTIFICATION_CHANNEL_ID,
  ORBITY_NOTIFICATION_CHANNEL_NAME,
} from "@/infra/services/expoNotificationService";
import { NotificationServiceError, ValidationError } from "@/model/errors";
import { FakeNotificationService } from "../../../tests/fixtures/fakeNotificationService";

const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockSetNotificationChannelAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn();
const mockCancelScheduledNotificationAsync = jest.fn();
const mockGetAllScheduledNotificationsAsync = jest.fn();
const mockAddNotificationResponseReceivedListener = jest.fn();
const mockSetNotificationHandler = jest.fn();

jest.mock("expo-notifications", () => ({
  PermissionStatus: {
    GRANTED: "granted",
    DENIED: "denied",
    UNDETERMINED: "undetermined",
  },
  AndroidImportance: {
    HIGH: 6,
  },
  SchedulableTriggerInputTypes: {
    DATE: "date",
  },
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissionsAsync(...args),
  setNotificationChannelAsync: (...args: unknown[]) => mockSetNotificationChannelAsync(...args),
  scheduleNotificationAsync: (...args: unknown[]) => mockScheduleNotificationAsync(...args),
  cancelScheduledNotificationAsync: (...args: unknown[]) => mockCancelScheduledNotificationAsync(...args),
  getAllScheduledNotificationsAsync: (...args: unknown[]) => mockGetAllScheduledNotificationsAsync(...args),
  addNotificationResponseReceivedListener: (...args: unknown[]) => mockAddNotificationResponseReceivedListener(...args),
  setNotificationHandler: (...args: unknown[]) => mockSetNotificationHandler(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockSetNotificationChannelAsync.mockResolvedValue(undefined);
  mockScheduleNotificationAsync.mockResolvedValue("id");
  mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
  mockGetAllScheduledNotificationsAsync.mockResolvedValue([]);
});

describe("FakeNotificationService (contrato de domínio)", () => {
  it("consulta e solicita permissão preservando transições", async () => {
    const fake = new FakeNotificationService("undetermined", "granted");
    expect(await fake.getPermissionStatus()).toBe("undetermined");
    expect(await fake.requestPermission()).toBe("granted");
    expect(await fake.getPermissionStatus()).toBe("granted");
  });

  it("permite simular permissão negada sem lançar erro", async () => {
    const fake = new FakeNotificationService("denied");
    expect(await fake.getPermissionStatus()).toBe("denied");
    expect(await fake.requestPermission()).toBe("denied");
  });

  it("agenda, substitui pelo mesmo id, lista e cancela lembretes", async () => {
    const fake = new FakeNotificationService();
    await fake.schedule({
      id: "task-reminder:1",
      title: "Hora da sua tarefa",
      body: "Revisar cálculo",
      triggerAt: "2026-11-22T18:00:00-03:00",
      data: { route: "/tasks" },
    });
    await fake.schedule({
      id: "task-reminder:1",
      title: "Hora da sua tarefa",
      body: "Revisar álgebra",
      triggerAt: "2026-11-22T19:00:00-03:00",
      data: { route: "/tasks" },
    });

    const listed = await fake.listScheduled();
    expect(listed).toEqual([
      {
        id: "task-reminder:1",
        title: "Hora da sua tarefa",
        body: "Revisar álgebra",
        triggerAt: "2026-11-22T19:00:00-03:00",
        data: { route: "/tasks" },
      },
    ]);

    await fake.cancel("task-reminder:1");
    expect(await fake.listScheduled()).toEqual([]);
  });

  it("rejeita identificador vazio ou data inválida com ValidationError", async () => {
    const fake = new FakeNotificationService();
    await expect(
      fake.schedule({ id: "   ", title: "Aviso", body: "Corpo", triggerAt: "2026-11-22T18:00:00-03:00" }),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      fake.schedule({ id: "id-1", title: "Aviso", body: "Corpo", triggerAt: "data-invalida" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("ExpoNotificationService (adaptador real na infraestrutura)", () => {
  it("mapeia os estados de permissão granted, denied e undetermined", async () => {
    const service = new ExpoNotificationService();

    mockGetPermissionsAsync.mockResolvedValueOnce({ status: "granted", granted: true });
    expect(await service.getPermissionStatus()).toBe("granted");

    mockGetPermissionsAsync.mockResolvedValueOnce({ status: "denied", granted: false });
    expect(await service.getPermissionStatus()).toBe("denied");

    mockGetPermissionsAsync.mockResolvedValueOnce({ status: "undetermined", granted: false });
    expect(await service.getPermissionStatus()).toBe("undetermined");
  });

  it("configura o canal Android em pt-BR e pede permissão quando ainda não concedida", async () => {
    const service = new ExpoNotificationService();
    mockGetPermissionsAsync.mockResolvedValueOnce({ status: "undetermined", granted: false });
    mockRequestPermissionsAsync.mockResolvedValueOnce({ status: "denied", granted: false });

    const status = await service.requestPermission();
    expect(status).toBe("denied");
    expect(mockSetNotificationChannelAsync).toHaveBeenCalledWith(ORBITY_NOTIFICATION_CHANNEL_ID, {
      name: ORBITY_NOTIFICATION_CHANNEL_NAME,
      description: ORBITY_NOTIFICATION_CHANNEL_DESCRIPTION,
      importance: 6,
    });
    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it("não reabre o diálogo do sistema se a permissão já estiver concedida", async () => {
    const service = new ExpoNotificationService();
    mockGetPermissionsAsync.mockResolvedValueOnce({ status: "granted", granted: true });

    expect(await service.requestPermission()).toBe("granted");
    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  });

  it("agenda notificação no canal Android e reconstrói a lista agendada sem vazar metadados internos", async () => {
    const service = new ExpoNotificationService();
    const triggerAt = "2026-11-22T18:30:00-03:00";

    await service.schedule({
      id: "task-reminder:42",
      title: "Hora da sua tarefa",
      body: "Estudar física",
      triggerAt,
      data: { route: "/tasks" },
    });

    expect(mockSetNotificationChannelAsync).toHaveBeenCalledTimes(1);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith({
      identifier: "task-reminder:42",
      content: {
        title: "Hora da sua tarefa",
        body: "Estudar física",
        data: {
          route: "/tasks",
          __orbityTriggerAt: triggerAt,
        },
      },
      trigger: {
        type: "date",
        date: new Date(Date.parse(triggerAt)),
        channelId: ORBITY_NOTIFICATION_CHANNEL_ID,
      },
    });

    mockGetAllScheduledNotificationsAsync.mockResolvedValueOnce([
      {
        identifier: "task-reminder:42",
        content: {
          title: "Hora da sua tarefa",
          body: "Estudar física",
          data: {
            route: "/tasks",
            __orbityTriggerAt: triggerAt,
          },
        },
      },
    ]);

    expect(await service.listScheduled()).toEqual([
      {
        id: "task-reminder:42",
        title: "Hora da sua tarefa",
        body: "Estudar física",
        triggerAt,
        data: { route: "/tasks" },
      },
    ]);

    await service.cancel("task-reminder:42");
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith("task-reminder:42");
  });

  it("converte falhas técnicas do SDK em NotificationServiceError", async () => {
    const service = new ExpoNotificationService();

    mockGetPermissionsAsync.mockRejectedValueOnce(new Error("Native error"));
    await expect(service.getPermissionStatus()).rejects.toBeInstanceOf(NotificationServiceError);

    mockScheduleNotificationAsync.mockRejectedValueOnce(new Error("Native schedule error"));
    await expect(
      service.schedule({
        id: "focus-cycle-end",
        title: "Ciclo concluído",
        body: "Hora de descansar um pouco.",
        triggerAt: "2026-11-22T19:00:00-03:00",
      }),
    ).rejects.toBeInstanceOf(NotificationServiceError);

    mockCancelScheduledNotificationAsync.mockRejectedValueOnce(new Error("Native cancel error"));
    await expect(service.cancel("focus-cycle-end")).rejects.toBeInstanceOf(NotificationServiceError);

    mockGetAllScheduledNotificationsAsync.mockRejectedValueOnce(new Error("Native list error"));
    await expect(service.listScheduled()).rejects.toBeInstanceOf(NotificationServiceError);
  });

  it("pede banner, central e som ao apresentar lembretes com o app em primeiro plano", async () => {
    const service = new ExpoNotificationService();

    service.configureForegroundPresentation();

    expect(mockSetNotificationHandler).toHaveBeenCalledTimes(1);
    const [handler] = mockSetNotificationHandler.mock.calls[0] as [
      { handleNotification: (notification: unknown) => Promise<unknown> },
    ];
    await expect(handler.handleNotification({})).resolves.toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
  });

  it("configura o handler de apresentação uma única vez", () => {
    const service = new ExpoNotificationService();

    service.configureForegroundPresentation();
    service.configureForegroundPresentation();

    expect(mockSetNotificationHandler).toHaveBeenCalledTimes(1);
  });

  it("converte falha ao configurar a apresentação em NotificationServiceError", () => {
    const service = new ExpoNotificationService();
    mockSetNotificationHandler.mockImplementationOnce(() => {
      throw new Error("Native handler error");
    });

    expect(() => service.configureForegroundPresentation()).toThrow(NotificationServiceError);
  });

  it("encaminha resposta ao toque na notificação higienizando metadados internos", () => {
    const remove = jest.fn();
    let registeredCallback: ((event: unknown) => void) | undefined;
    mockAddNotificationResponseReceivedListener.mockImplementationOnce((cb: (event: unknown) => void) => {
      registeredCallback = cb;
      return { remove };
    });

    const service = new ExpoNotificationService();
    const received: Readonly<Record<string, string>>[] = [];
    const unsubscribe = service.onNotificationResponse((data) => received.push(data));

    registeredCallback?.({
      notification: {
        request: {
          content: {
            data: {
              route: "/tasks",
              taskId: "42",
              __orbityTriggerAt: "2026-11-22T18:30:00-03:00",
            },
          },
        },
      },
    });

    expect(received).toEqual([{ route: "/tasks", taskId: "42" }]);
    unsubscribe();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
