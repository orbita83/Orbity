import { act, renderHook } from "@testing-library/react-native";
import { BackHandler, Platform } from "react-native";
import { useSettingsViewModel } from "@/viewmodel/useSettingsViewModel";

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = jest.requireActual<typeof import("react")>("react");
    React.useEffect(() => callback(), [callback]);
  },
}));

describe("useSettingsViewModel", () => {
  it("impede abertura duplicada e libera nova tentativa ao terminar", async () => {
    let finish!: () => void;
    const openPolicy = jest.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    const { result } = await renderHook(() => useSettingsViewModel({ openPolicy }));
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current[1].handleOpenPrivacyPolicy();
      await result.current[1].handleOpenPrivacyPolicy();
    });
    expect(openPolicy).toHaveBeenCalledTimes(1);
    expect(result.current[0].openingPolicy).toBe(true);
    await act(async () => { finish(); await pending; });
    expect(result.current[0].openingPolicy).toBe(false);
    expect(result.current[0].error).toBeNull();
  });

  it("mostra falha sem detalhes técnicos e permite tentar novamente", async () => {
    const openPolicy = jest.fn().mockRejectedValueOnce(new Error("native detail")).mockResolvedValue(undefined);
    const { result } = await renderHook(() => useSettingsViewModel({ openPolicy }));
    await act(async () => { await result.current[1].handleOpenPrivacyPolicy(); });
    expect(result.current[0].error).toContain("Não foi possível abrir");
    expect(result.current[0].error).not.toContain("native detail");
    expect(result.current[0].openingPolicy).toBe(false);
    await act(async () => { await result.current[1].handleOpenPrivacyPolicy(); });
    expect(result.current[0].error).toBeNull();
    expect(openPolicy).toHaveBeenCalledTimes(2);
  });

  it("volta para Meu perfil pela ação da tela", async () => {
    const { result } = await renderHook(() => useSettingsViewModel());
    result.current[1].handleReturnToProfile();
    expect(mockReplace).toHaveBeenCalledWith("/profile");
  });

  it("trata o voltar do Android enquanto a tela está aberta e remove o listener ao sair", async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
    const remove = jest.fn();
    const listener = jest.spyOn(BackHandler, "addEventListener").mockReturnValue({ remove });
    try {
      const view = await renderHook(() => useSettingsViewModel());
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
      await renderHook(() => useSettingsViewModel());
      expect(listener).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(Platform, "OS", { configurable: true, value: original });
      listener.mockRestore();
    }
  });
});
