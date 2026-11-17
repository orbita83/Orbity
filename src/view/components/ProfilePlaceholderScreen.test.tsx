import { fireEvent, render, screen } from "@testing-library/react-native";
import { BackHandler, Platform } from "react-native";
import { ProfilePlaceholderScreen } from "./ProfilePlaceholderScreen";

const mockReplace = jest.fn();
let mockFocused = true;
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual<typeof import("react")>("react");
    React.useEffect(() => mockFocused ? callback() : undefined, [callback]);
  },
}));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: jest.requireActual<typeof import("react-native")>("react-native").View }));

describe("Retorno dos destinos provisórios", () => {
  it.each(["Conquistas", "Categorias", "Configurações"])("oferece retorno a partir do acesso direto em %s", async (title) => {
    await render(<ProfilePlaceholderScreen title={title} />);
    expect(screen.getByRole("header", { name: title })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Voltar ao perfil" }));
    expect(mockReplace).toHaveBeenCalledWith("/profile");
  });

  it("registra Voltar no Android somente em foco e remove o listener ao sair", async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
    const remove = jest.fn();
    const listener = jest.spyOn(BackHandler, "addEventListener").mockReturnValue({ remove });
    try {
      const view = await render(<ProfilePlaceholderScreen title="Conquistas" />);
      expect(listener).toHaveBeenCalledWith("hardwareBackPress", expect.any(Function));
      const handler = listener.mock.calls[0][1];
      expect(handler({} as never)).toBe(true);
      expect(mockReplace).toHaveBeenCalledWith("/profile");
      mockFocused = false;
      await view.rerender(<ProfilePlaceholderScreen title="Conquistas" />);
      expect(remove).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledTimes(1);
      await view.unmount();
    } finally {
      mockFocused = true;
      Object.defineProperty(Platform, "OS", { configurable: true, value: original });
      listener.mockRestore();
    }
  });
});
