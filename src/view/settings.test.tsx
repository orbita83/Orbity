import { fireEvent, render, screen } from "@testing-library/react-native";
import SettingsScreen from "./settings";

const createViewModel = () => ({
  policyUrl: "https://orbita83.github.io/Orbity/privacidade/",
  openingPolicy: false,
  error: null as string | null,
  handleReturnToProfile: jest.fn(),
  handleOpenPrivacyPolicy: jest.fn(async () => {}),
});

describe("Configurações e privacidade", () => {
  it("explica a abertura externa e encaminha o toque", async () => {
    const viewModel = createViewModel();
    await render(<SettingsScreen viewModel={viewModel} />);
    const button = screen.getByRole("link", { name: "Política de privacidade" });
    expect(button.props.accessibilityHint).toContain("navegador externo");
    await fireEvent.press(button);
    expect(viewModel.handleOpenPrivacyPolicy).toHaveBeenCalledTimes(1);
    expect(screen.getByText(viewModel.policyUrl).props.selectable).toBe(true);
  });

  it("anuncia a abertura em andamento e desabilita a ação", async () => {
    await render(<SettingsScreen viewModel={{ ...createViewModel(), openingPolicy: true }} />);
    expect(screen.getByRole("link", { name: "Política de privacidade" }).props.accessibilityState)
      .toEqual({ busy: true, disabled: true });
    expect(screen.getByText("Abrindo o navegador…")).toBeTruthy();
  });

  it("mostra erro e mantém o endereço disponível para copiar", async () => {
    const viewModel = { ...createViewModel(), error: "Não foi possível abrir a política." };
    await render(<SettingsScreen viewModel={viewModel} />);
    expect(screen.getByRole("alert").props.children).toBe(viewModel.error);
    expect(screen.getByText(viewModel.policyUrl).props.selectable).toBe(true);
  });
});
