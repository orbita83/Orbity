import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { PrimaryButton } from "@/view/components/primary-button";

describe("PrimaryButton", () => {
  it("renderiza o rótulo do botão corretamente", async () => {
    await render(<PrimaryButton label="Entrar" onPress={() => {}} />);
    expect(screen.getByText("Entrar")).toBeTruthy();
  });

  it("dispara o evento onPress ao ser pressionado", async () => {
    const onPressMock = jest.fn();
    await render(<PrimaryButton label="Confirmar" onPress={onPressMock} />);

    fireEvent.press(screen.getByText("Confirmar"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("renderiza no estado desabilitado quando especificado", async () => {
    await render(<PrimaryButton label="Salvar" onPress={() => {}} disabled />);
    const button = screen.getByRole("button");
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
