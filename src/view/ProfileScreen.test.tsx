import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { mockStudentProfile } from "@/model/__fixtures__/student-profile.fixture";
import ProfileScreen from "./ProfileScreen";

describe("ProfileScreen", () => {
  it("deve renderizar o título da tela com accessibilityRole header", async () => {
    // Arrange
    const mockViewModel = {
      profile: mockStudentProfile,
      loading: false,
      saving: false,
      error: null,
      validationError: null,
      isEditingName: false,
      nameInput: mockStudentProfile.name,
      loadProfile: jest.fn(),
      openEditNameModal: jest.fn(),
      closeEditNameModal: jest.fn(),
      setNameInput: jest.fn(),
      saveName: jest.fn(async () => true),
      clearError: jest.fn(),
    };

    // Act
    await render(<ProfileScreen viewModel={mockViewModel} />);

    // Assert
    const header = screen.getByText("Meu perfil");
    expect(header).toBeTruthy();
    expect(header.props.accessibilityRole).toBe("header");
    expect(screen.getByText(mockStudentProfile.name)).toBeTruthy();
  });

  it("deve disparar openEditNameModal ao clicar no botão de editar", async () => {
    // Arrange
    const openEditMock = jest.fn();
    const mockViewModel = {
      profile: mockStudentProfile,
      loading: false,
      saving: false,
      error: null,
      validationError: null,
      isEditingName: false,
      nameInput: mockStudentProfile.name,
      loadProfile: jest.fn(),
      openEditNameModal: openEditMock,
      closeEditNameModal: jest.fn(),
      setNameInput: jest.fn(),
      saveName: jest.fn(async () => true),
      clearError: jest.fn(),
    };

    await render(<ProfileScreen viewModel={mockViewModel} />);

    // Act
    const editButton = screen.getByLabelText("Editar nome do perfil");
    fireEvent.press(editButton);

    // Assert
    expect(openEditMock).toHaveBeenCalledTimes(1);
  });

  it("deve exibir o modal de edição quando isEditingName for true e permitir salvar", async () => {
    // Arrange
    const saveNameMock = jest.fn(async () => true);
    const mockViewModel = {
      profile: mockStudentProfile,
      loading: false,
      saving: false,
      error: null,
      validationError: null,
      isEditingName: true,
      nameInput: "Alex Silva Atualizado",
      loadProfile: jest.fn(),
      openEditNameModal: jest.fn(),
      closeEditNameModal: jest.fn(),
      setNameInput: jest.fn(),
      saveName: saveNameMock,
      clearError: jest.fn(),
    };

    await render(<ProfileScreen viewModel={mockViewModel} />);

    // Assert modal visível
    expect(screen.getByText("Editar nome")).toBeTruthy();
    expect(screen.getByDisplayValue("Alex Silva Atualizado")).toBeTruthy();

    // Act
    const saveButton = screen.getByLabelText("Salvar novo nome");
    fireEvent.press(saveButton);

    // Assert
    expect(saveNameMock).toHaveBeenCalledTimes(1);
  });

  it("deve exibir alerta de erro e permitir acionar nova tentativa", async () => {
    // Arrange
    const loadProfileMock = jest.fn();
    const clearErrorMock = jest.fn();
    const mockViewModel = {
      profile: null,
      loading: false,
      saving: false,
      error: "Falha na conexão de rede.",
      validationError: null,
      isEditingName: false,
      nameInput: "",
      loadProfile: loadProfileMock,
      openEditNameModal: jest.fn(),
      closeEditNameModal: jest.fn(),
      setNameInput: jest.fn(),
      saveName: jest.fn(async () => false),
      clearError: clearErrorMock,
    };

    await render(<ProfileScreen viewModel={mockViewModel} />);

    // Assert
    expect(screen.getByText("Falha na conexão de rede.")).toBeTruthy();

    // Act
    const retryButton = screen.getByLabelText("Tentar carregar o perfil novamente");
    fireEvent.press(retryButton);

    // Assert
    expect(clearErrorMock).toHaveBeenCalledTimes(1);
    expect(loadProfileMock).toHaveBeenCalledTimes(1);
  });
});
