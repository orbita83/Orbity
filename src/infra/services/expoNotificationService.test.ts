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
const mockGetLastNotificationResponse = jest.fn();
const mockClearLastNotificationResponse = jest.fn();

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
  getLastNotificationResponse: (...args: unknown[]) => mockGetLastNotificationResponse(...args),
  clearLastNotificationResponse: (...args: unknown[]) => mockClearLastNotificationResponse(...args),
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
    const unsubscribe = service.onNotificationResponse((data) => {
      received.push(data);
    });

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

describe("ExpoNotificationService — respostas ao toque na raiz do app (#270)", () => {
  const buildResponse = (identifier: string, data: Record<string, string>, date = 1_764_000_000_000) => ({
    actionIdentifier: "expo.modules.notifications.actions.DEFAULT",
    notification: { date, request: { identifier, content: { data } } },
  });

  const captureNativeListener = () => {
    const remove = jest.fn();
    const native: { emit?: (event: unknown) => void } = {};
    mockAddNotificationResponseReceivedListener.mockImplementation((cb: (event: unknown) => void) => {
      native.emit = cb;
      return { remove };
    });
    return { native, remove };
  };

  beforeEach(() => {
    mockAddNotificationResponseReceivedListener.mockReset();
    mockGetLastNotificationResponse.mockReset();
    mockGetLastNotificationResponse.mockReturnValue(null);
  });

  it("entrega o toque que abriu o app e o limpa no nativo (início a frio, #270)", () => {
    captureNativeListener();
    mockGetLastNotificationResponse.mockReturnValue(
      buildResponse("task-reminder:1", { route: "/tasks", taskId: "1", __orbityTriggerAt: "2026-11-22T18:30:00-03:00" }),
    );
    const service = new ExpoNotificationService();
    const received: Readonly<Record<string, string>>[] = [];

    service.onNotificationResponse((data) => {
      received.push(data);
      return true;
    });

    expect(received).toEqual([{ route: "/tasks", taskId: "1" }]);
    expect(mockGetLastNotificationResponse).toHaveBeenCalledTimes(1);
    expect(mockClearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });

  it("oferece o toque inicial a cada novo ouvinte até um deles tratá-lo, e depois não o entrega de novo", () => {
    captureNativeListener();
    mockGetLastNotificationResponse.mockReturnValue(buildResponse("task-reminder:1", { route: "/tasks", taskId: "1" }));
    const service = new ExpoNotificationService();
    const focusListener = jest.fn(() => false);
    const tasksListener = jest.fn(() => true);
    const lateListener = jest.fn(() => true);

    service.onNotificationResponse(focusListener);
    service.onNotificationResponse(tasksListener);
    service.onNotificationResponse(lateListener);

    expect(focusListener).toHaveBeenCalledTimes(1);
    expect(tasksListener).toHaveBeenCalledTimes(1);
    expect(lateListener).not.toHaveBeenCalled();
    expect(mockGetLastNotificationResponse).toHaveBeenCalledTimes(1);
  });

  it("não entrega duas vezes a mesma resposta quando o nativo a repete depois do início a frio", () => {
    const { native } = captureNativeListener();
    const launch = buildResponse("task-reminder:1", { route: "/tasks", taskId: "1" });
    mockGetLastNotificationResponse.mockReturnValue(launch);
    const service = new ExpoNotificationService();
    const listener = jest.fn(() => true);

    service.onNotificationResponse(listener);
    native.emit?.(launch);
    native.emit?.(buildResponse("task-reminder:2", { route: "/tasks", taskId: "2" }));
    native.emit?.(buildResponse("task-reminder:2", { route: "/tasks", taskId: "2" }));

    expect(listener.mock.calls).toEqual([[{ route: "/tasks", taskId: "1" }], [{ route: "/tasks", taskId: "2" }]]);
  });

  it("entrega o toque com o app aberto a todos os ouvintes por uma única assinatura nativa", () => {
    const { native, remove } = captureNativeListener();
    const service = new ExpoNotificationService();
    const first = jest.fn(() => false);
    const second = jest.fn(() => true);

    const unsubscribeFirst = service.onNotificationResponse(first);
    const unsubscribeSecond = service.onNotificationResponse(second);
    native.emit?.(buildResponse("task-reminder:3", { route: "/tasks", taskId: "3" }));

    expect(mockAddNotificationResponseReceivedListener).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledWith({ route: "/tasks", taskId: "3" });
    expect(second).toHaveBeenCalledWith({ route: "/tasks", taskId: "3" });

    unsubscribeFirst();
    unsubscribeFirst();
    expect(remove).not.toHaveBeenCalled();
    unsubscribeSecond();
    expect(remove).toHaveBeenCalledTimes(1);

    service.onNotificationResponse(first);
    expect(mockAddNotificationResponseReceivedListener).toHaveBeenCalledTimes(2);
  });

  it("guarda a resposta que nenhum ouvinte tratou para o próximo ouvinte, em vez de descartá-la", () => {
    // Início a frio no iOS: o aviso do Modo Foco chega pelo ouvinte nativo antes de a Tela Inicial assinar.
    const { native } = captureNativeListener();
    const service = new ExpoNotificationService();
    const rootListener = jest.fn((data: Readonly<Record<string, string>>) => data.route === "/tasks");
    const homeListener = jest.fn((data: Readonly<Record<string, string>>) => data.route === "/focus-session");
    const lateListener = jest.fn(() => true);

    service.onNotificationResponse(rootListener);
    native.emit?.(buildResponse("focus-cycle-end", { route: "/focus-session" }));
    service.onNotificationResponse(homeListener);
    native.emit?.(buildResponse("focus-cycle-end", { route: "/focus-session" }));
    service.onNotificationResponse(lateListener);

    expect(rootListener).toHaveBeenCalledTimes(1);
    expect(homeListener).toHaveBeenCalledTimes(1);
    expect(homeListener).toHaveBeenCalledWith({ route: "/focus-session" });
    expect(lateListener).not.toHaveBeenCalled();
  });

  it("continua entregando aos demais ouvintes quando um deles falha", () => {
    const { native } = captureNativeListener();
    const service = new ExpoNotificationService();
    const failing = jest.fn(() => {
      throw new Error("listener error");
    });
    const healthy = jest.fn(() => true);

    service.onNotificationResponse(failing);
    service.onNotificationResponse(healthy);
    native.emit?.(buildResponse("task-reminder:4", { route: "/tasks", taskId: "4" }));

    expect(healthy).toHaveBeenCalledWith({ route: "/tasks", taskId: "4" });
  });
});
