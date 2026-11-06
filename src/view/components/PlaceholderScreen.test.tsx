import { render, screen } from "@testing-library/react-native";
import { PlaceholderScreen } from "./PlaceholderScreen";

describe("PlaceholderScreen", () => {
  it("apresenta um cabeçalho e uma mensagem provisória legível", async () => {
    await render(<PlaceholderScreen title="Rotinas" message="Seu espaço de estudos estará aqui." />);

    expect(screen.getByRole("header", { name: "Rotinas" })).toBeTruthy();
    expect(screen.getByText("Seu espaço de estudos estará aqui.")).toBeTruthy();
  });
});
