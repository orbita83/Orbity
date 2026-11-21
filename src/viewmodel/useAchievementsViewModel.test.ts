import { renderHook } from "@testing-library/react-native";
import { BackHandler, Platform } from "react-native";
import { useAchievementsViewModel } from "@/viewmodel/useAchievementsViewModel";

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = jest.requireActual<typeof import("react")>("react");
    React.useEffect(() => callback(), [callback]);
  },
}));

describe("useAchievementsViewModel", () => {
  it("volta para Meu perfil pela ação da tela", async () => {
    const { result } = await renderHook(() => useAchievementsViewModel());
    result.current[1].handleReturnToProfile();
    expect(mockReplace).toHaveBeenCalledWith("/profile");
  });

  it("trata o voltar do Android enquanto a tela está aberta e remove o listener ao sair", async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
    const remove = jest.fn();
    const listener = jest.spyOn(BackHandler, "addEventListener").mockReturnValue({ remove });
    try {
      const view = await renderHook(() => useAchievementsViewModel());
      expect(listener).toHaveBeenCalledWith("hardwareBackPress", expect.any(Function));
      const handler = listener.mock.calls[0][1];
      expect(handler({} as never)).toBe(true);
      expect(mockReplace).toHaveBeenCalledWith("/profile");
      await view.unmount();
      expect(remove).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(Platform, "OS", { configurable: true, value: original });
      listener.mockRestore();
    }
  });

  it("não registra o voltar do sistema fora do Android", async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
    const listener = jest.spyOn(BackHandler, "addEventListener");
    try {
      await renderHook(() => useAchievementsViewModel());
      expect(listener).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(Platform, "OS", { configurable: true, value: original });
      listener.mockRestore();
    }
  });
});
