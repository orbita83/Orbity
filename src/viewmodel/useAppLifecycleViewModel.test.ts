import { renderHook } from "@testing-library/react-native";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";
import { useAppLifecycleViewModel } from "@/viewmodel/useAppLifecycleViewModel";

const createNotificationUseCases = (): jest.Mocked<INotificationUseCases> => ({
  startForegroundPresentation: jest.fn(),
});

describe("useAppLifecycleViewModel", () => {
  it("issue #269: configura a apresentação dos lembretes em primeiro plano ao montar", async () => {
    const useCases = createNotificationUseCases();

    await renderHook(() => useAppLifecycleViewModel(useCases));

    expect(useCases.startForegroundPresentation).toHaveBeenCalledTimes(1);
  });

  it("não configura de novo quando a raiz renderiza outra vez", async () => {
    const useCases = createNotificationUseCases();

    const { rerender } = await renderHook(() => useAppLifecycleViewModel(useCases));
    await rerender({});
    await rerender({});

    expect(useCases.startForegroundPresentation).toHaveBeenCalledTimes(1);
  });

  it("devolve a tupla [state, actions] vazia", async () => {
    const { result } = await renderHook(() => useAppLifecycleViewModel(createNotificationUseCases()));

    expect(result.current).toEqual([{}, {}]);
  });
});
