import { fireEvent, render, screen } from "@testing-library/react-native";
import { ProfilePlaceholderScreen } from "./ProfilePlaceholderScreen";

jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: jest.requireActual<typeof import("react-native")>("react-native").View }));

describe("Destinos provisórios do perfil", () => {
  it.each(["Conquistas", "Categorias", "Configurações"])("mostra %s e repassa o retorno à ação da ViewModel", async (title) => {
    const onReturn = jest.fn();
    await render(<ProfilePlaceholderScreen title={title} onReturn={onReturn} />);
    expect(screen.getByRole("header", { name: title })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Voltar ao perfil" }));
    expect(onReturn).toHaveBeenCalledTimes(1);
  });
});
