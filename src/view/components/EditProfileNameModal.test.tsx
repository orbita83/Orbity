import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { EditProfileNameModal } from "./EditProfileNameModal";

describe("EditProfileNameModal", () => {
  const defaultProps = {
    visible: true,
    name: "Alex Silva",
    saving: false,
    validationError: null,
    onChangeName: jest.fn(),
    onSave: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o título, o campo de texto e os botões quando visible for true", async () => {
    // Act
    await render(<EditProfileNameModal {...defaultProps} />);

    // Assert
    expect(screen.getByText("Editar nome")).toBeTruthy();
    expect(screen.getByDisplayValue("Alex Silva")).toBeTruthy();
    expect(screen.getByText("Salvar")).toBeTruthy();
    expect(screen.getByText("Cancelar")).toBeTruthy();
    expect(screen.getByText("10/60")).toBeTruthy();
  });

  it("deve disparar onChangeName ao digitar novo texto no campo", async () => {
    // Arrange
    const onChangeNameMock = jest.fn();
    await render(
      <EditProfileNameModal {...defaultProps} onChangeName={onChangeNameMock} />,
    );

    // Act
    const input = screen.getByDisplayValue("Alex Silva");
    fireEvent.changeText(input, "Alexandre");

    // Assert
    expect(onChangeNameMock).toHaveBeenCalledWith("Alexandre");
  });

  it("deve disparar onSave ao pressionar o botão Salvar", async () => {
    // Arrange
    const onSaveMock = jest.fn();
    await render(<EditProfileNameModal {...defaultProps} onSave={onSaveMock} />);

    // Act
    const saveButton = screen.getByLabelText("Salvar novo nome");
    fireEvent.press(saveButton);

    // Assert
    expect(onSaveMock).toHaveBeenCalledTimes(1);
  });

  it("deve disparar onClose ao pressionar o botão Cancelar", async () => {
    // Arrange
    const onCloseMock = jest.fn();
    await render(<EditProfileNameModal {...defaultProps} onClose={onCloseMock} />);

    // Act
    const cancelButton = screen.getByLabelText("Cancelar edição do nome");
    fireEvent.press(cancelButton);

    // Assert
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("deve disparar onClose ao pressionar o botão Fechar no cabeçalho", async () => {
    // Arrange
    const onCloseMock = jest.fn();
    await render(<EditProfileNameModal {...defaultProps} onClose={onCloseMock} />);

    // Act
    const closeButton = screen.getByLabelText("Fechar modal de edição");
    fireEvent.press(closeButton);

    // Assert
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("deve exibir mensagem de validação quando validationError for fornecido", async () => {
    // Arrange
    const errorMessage = "O nome deve ter no máximo 60 caracteres.";
    await render(
      <EditProfileNameModal {...defaultProps} validationError={errorMessage} />,
    );

    // Assert
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeTruthy();
    expect(errorElement.props.accessibilityRole).toBe("alert");
  });

  it("deve desabilitar os botões e anunciar estado de carregamento quando saving for true", async () => {
    // Act
    await render(<EditProfileNameModal {...defaultProps} saving={true} />);

    // Assert
    expect(screen.getByText("Salvando...")).toBeTruthy();
    const saveButton = screen.getByLabelText("Salvar novo nome");
    expect(saveButton.props.accessibilityState.busy).toBe(true);
    expect(saveButton.props.accessibilityState.disabled).toBe(true);

    // Ao tentar clicar em salvar durante saving, onSave não deve ser acionado
    fireEvent.press(saveButton);
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });
});
