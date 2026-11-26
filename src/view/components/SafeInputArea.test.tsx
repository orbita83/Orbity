import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { SafeInputArea } from "./SafeInputArea";

describe("SafeInputArea", () => {
  it("renderiza o conteúdo dentro da área que acompanha o teclado", async () => {
    await render(
      <SafeInputArea>
        <Text>Campo</Text>
      </SafeInputArea>,
    );

    expect(screen.getByText("Campo")).toBeTruthy();
  });

  it("ocupa o espaço disponível e aceita estilo adicional", async () => {
    await render(
      <SafeInputArea testID="area" style={{ justifyContent: "center" }}>
        <Text>Campo</Text>
      </SafeInputArea>,
    );

    expect(screen.getByTestId("area")).toHaveStyle({ flex: 1, justifyContent: "center" });
  });
});
