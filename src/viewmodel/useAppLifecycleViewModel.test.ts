import { renderHook } from "@testing-library/react-native";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";
import { NotificationUseCases } from "@/usecase/notificationUseCases";
import { useAppLifecycleViewModel } from "@/viewmodel/useAppLifecycleViewModel";
import { FakeNotificationService } from "../../tests/fixtures/fakeNotificationService";

const mockNavigate = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    navigate: (...args: unknown[]) => mockNavigate(...args),
  },
}));

const createNotificationUseCases = (): jest.Mocked<INotificationUseCases> => ({
  startForegroundPresentation: jest.fn(),
  onTaskReminderPress: jest.fn((_onPress: (taskId?: string) => void) => () => undefined),
});

describe("useAppLifecycleViewModel", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("issue #269: configura a apresentação dos lembretes em primeiro plano ao montar", async () => {
    const useCases = createNotificationUseCases();

    await renderHook(() => useAppLifecycleViewModel(useCases));

    expect(useCases.startForegroundPresentation).toHaveBeenCalledTimes(1);
  });

  it("não configura de novo nem assina duas vezes quando a raiz renderiza outra vez", async () => {
    const useCases = createNotificationUseCases();

    const { rerender } = await renderHook(() => useAppLifecycleViewModel(useCases));
    await rerender({});
    await rerender({});

    expect(useCases.startForegroundPresentation).toHaveBeenCalledTimes(1);
    expect(useCases.onTaskReminderPress).toHaveBeenCalledTimes(1);
  });

  it("devolve a tupla [state, actions] vazia", async () => {
    const { result } = await renderHook(() => useAppLifecycleViewModel(createNotificationUseCases()));

    expect(result.current).toEqual([{}, {}]);
  });

  it("issue #270: abre Tarefas quando o toque no lembrete abriu o app (início a frio)", async () => {
    const notifications = new FakeNotificationService();
    notifications.setLaunchResponse({ route: "/tasks", taskId: "t-1" });

    await renderHook(() => useAppLifecycleViewModel(new NotificationUseCases(notifications)));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/tasks");
  });

  it("issue #270: abre Tarefas ao tocar no lembrete com o app aberto e ignora avisos de outras rotas", async () => {
    const notifications = new FakeNotificationService();
    await renderHook(() => useAppLifecycleViewModel(new NotificationUseCases(notifications)));

    notifications.emitNotificationResponse({ route: "/focus-session" });
    expect(mockNavigate).not.toHaveBeenCalled();

    notifications.emitNotificationResponse({ route: "/tasks", taskId: "t-1" });
    expect(mockNavigate).toHaveBeenCalledWith("/tasks");
  });

  it("deixa de escutar os toques ao desmontar", async () => {
    const notifications = new FakeNotificationService();
    const { unmount } = await renderHook(() => useAppLifecycleViewModel(new NotificationUseCases(notifications)));

    await unmount();
    notifications.emitNotificationResponse({ route: "/tasks", taskId: "t-1" });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
