import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { PrimaryButton } from "@/view/components/primary-button";
import { themes } from "@/view/theme/tokens";

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

  it("usa o fundo e o texto desabilitados sólidos no tema cósmico", async () => {
    await render(<PrimaryButton label="Iniciar" onPress={() => {}} disabled theme={themes.cosmic} />);
    const label = StyleSheet.flatten(screen.getByText("Iniciar").props.style);
    expect(label.color).toBe(themes.cosmic.button.labelDisabled);
    const button = screen.getByRole("button");
    const style = StyleSheet.flatten(
      typeof button.props.style === "function" ? button.props.style({ pressed: false }) : button.props.style,
    );
    expect(style.backgroundColor).toBe(themes.cosmic.button.bgDisabled);
  });
});
