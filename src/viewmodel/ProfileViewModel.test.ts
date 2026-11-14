import { act, renderHook, waitFor } from "@testing-library/react-native";
import { mockStudentProfile } from "@/model/__fixtures__/student-profile.fixture";
import type { StudentProfile } from "@/model/entities/student-profile";
import { DomainError, ValidationError } from "@/model/errors/domain-error";
import type { IProfileUseCases } from "@/usecase/profile-use-cases";
import { useProfileViewModel } from "./ProfileViewModel";

describe("useProfileViewModel", () => {
  let fakeUseCases: IProfileUseCases;
  let currentProfile: StudentProfile;

  beforeEach(() => {
    currentProfile = { ...mockStudentProfile };
    fakeUseCases = {
      getProfile: jest.fn(async () => ({ ...currentProfile })),
      updateName: jest.fn(async (name: string) => {
        currentProfile = { ...currentProfile, name };
        return { ...currentProfile };
      }),
    };
  });

  it("deve carregar os dados do perfil automaticamente na montagem", async () => {
    // Act
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));

    // Aguardar conclusão da carga
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert final
    expect(result.current.profile).toEqual(mockStudentProfile);
    expect(result.current.error).toBeNull();
    expect(fakeUseCases.getProfile).toHaveBeenCalledTimes(1);
  });

  it("deve definir mensagem de erro quando falhar ao carregar o perfil", async () => {
    // Arrange
    fakeUseCases.getProfile = jest.fn(async () => {
      throw new DomainError("Erro ao acessar dados remotos.", "READ_FAILED");
    });

    // Act
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe("Erro ao acessar dados remotos.");
  });

  it("deve abrir o modal de edição populando o input com o nome atual", async () => {
    // Arrange
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Act
    await act(async () => {
      result.current.openEditNameModal();
    });

    // Assert
    expect(result.current.isEditingName).toBe(true);
    expect(result.current.nameInput).toBe(mockStudentProfile.name);
    expect(result.current.validationError).toBeNull();
  });

  it("deve fechar o modal de edição e limpar mensagem de validação", async () => {
    // Arrange
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.openEditNameModal();
    });

    // Act
    await act(async () => {
      result.current.closeEditNameModal();
    });

    // Assert
    expect(result.current.isEditingName).toBe(false);
    expect(result.current.validationError).toBeNull();
  });

  it("deve atualizar o nome digitado via setNameInput e limpar erro de validação ativo", async () => {
    // Arrange
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.openEditNameModal();
    });

    // Act
    await act(async () => {
      result.current.setNameInput("Carlos Drummond");
    });

    // Assert
    expect(result.current.nameInput).toBe("Carlos Drummond");
  });

  it("deve salvar novo nome com sucesso, atualizar o perfil e fechar o modal", async () => {
    // Arrange
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.openEditNameModal();
      result.current.setNameInput("Novo Nome de Teste");
    });

    // Act
    let success = false;
    await act(async () => {
      success = await result.current.saveName();
    });

    // Assert
    expect(success).toBe(true);
    expect(result.current.saving).toBe(false);
    expect(result.current.isEditingName).toBe(false);
    expect(result.current.profile?.name).toBe("Novo Nome de Teste");
    expect(result.current.validationError).toBeNull();
    expect(result.current.error).toBeNull();
    expect(fakeUseCases.updateName).toHaveBeenCalledWith("Novo Nome de Teste");
  });

  it("deve tratar erro de validação mantendo o input preservado e o modal aberto", async () => {
    // Arrange
    fakeUseCases.updateName = jest.fn(async () => {
      throw new ValidationError("O nome é obrigatório.");
    });
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.openEditNameModal();
      result.current.setNameInput("   ");
    });

    // Act
    let success = true;
    await act(async () => {
      success = await result.current.saveName();
    });

    // Assert
    expect(success).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.isEditingName).toBe(true);
    expect(result.current.nameInput).toBe("   ");
    expect(result.current.validationError).toBe("O nome é obrigatório.");
  });

  it("deve tratar erro de domínio no salvamento exibindo no erro global", async () => {
    // Arrange
    fakeUseCases.updateName = jest.fn(async () => {
      throw new DomainError("Falha de conexão ao persistir nome.", "NETWORK_ERROR");
    });
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.openEditNameModal();
      result.current.setNameInput("Ana Paula");
    });

    // Act
    let success = true;
    await act(async () => {
      success = await result.current.saveName();
    });

    // Assert
    expect(success).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.isEditingName).toBe(true);
    expect(result.current.error).toBe("Falha de conexão ao persistir nome.");
    expect(result.current.validationError).toBeNull();
  });

  it("deve permitir limpar mensagem de erro através da ação clearError", async () => {
    // Arrange
    fakeUseCases.getProfile = jest.fn(async () => {
      throw new DomainError("Falha temporária", "TEMP_ERROR");
    });
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Falha temporária");

    // Act
    await act(async () => {
      result.current.clearError();
    });

    // Assert
    expect(result.current.error).toBeNull();
  });
});
