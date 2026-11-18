import { act, renderHook, waitFor } from "@testing-library/react-native";
import { mockStudentProfile } from "@/model/__fixtures__/student-profile.fixture";
import type { StudentProfile } from "@/model/entities/student-profile";
import { DataSourceError, ValidationError } from "@/model/errors";
import type { IProfileUseCases } from "@/usecase/profile-use-cases";
import { useProfileViewModel } from "./useProfileViewModel";

// Navegação do Expo Router isolada.
const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
const mockSetOptions = jest.fn();
const mockNavigation = { setOptions: (...args: unknown[]) => mockSetOptions(...args) };
let mockParams: Record<string, string | undefined> = {};
const mockFocusCallbacks = new Set<() => void>();
jest.mock("expo-router", () => ({
  router: {
    navigate: (...args: unknown[]) => mockNavigate(...args),
    setParams: (...args: unknown[]) => mockSetParams(...args),
  },
  // Registra o efeito de foco enquanto o hook está montado; `focusScreen()` simula a tela ganhando foco.
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = jest.requireActual<typeof import("react")>("react");
    const latest = React.useRef(callback);
    latest.current = callback;
    React.useEffect(() => {
      const run = () => {
        latest.current();
      };
      mockFocusCallbacks.add(run);
      return () => {
        mockFocusCallbacks.delete(run);
      };
    }, []);
  },
  useLocalSearchParams: () => mockParams,
  useNavigation: () => mockNavigation,
}));

beforeEach(() => {
  mockParams = {};
  mockFocusCallbacks.clear();
});

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
      expect(result.current[0].loading).toBe(false);
    });

    // Assert final
    expect(result.current[0].profile).toEqual(mockStudentProfile);
    expect(result.current[0].error).toBeNull();
    expect(fakeUseCases.getProfile).toHaveBeenCalledTimes(1);
  });

  it("deve definir mensagem de erro quando falhar ao carregar o perfil", async () => {
    // Arrange
    fakeUseCases.getProfile = jest.fn(async () => {
      throw new DataSourceError("Erro ao acessar dados remotos.");
    });

    // Act
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));

    await waitFor(() => {
      expect(result.current[0].loading).toBe(false);
    });

    // Assert
    expect(result.current[0].profile).toBeNull();
    expect(result.current[0].error).toBe("Erro ao acessar dados remotos.");
  });

  it("deve abrir o modal de edição populando o input com o nome atual", async () => {
    // Arrange
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    // Act
    await act(async () => {
      result.current[1].openEditNameModal();
    });

    // Assert
    expect(result.current[0].isEditingName).toBe(true);
    expect(result.current[0].nameInput).toBe(mockStudentProfile.name);
    expect(result.current[0].validationError).toBeNull();
  });

  it("deve fechar o modal de edição e limpar mensagem de validação", async () => {
    // Arrange
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    await act(async () => {
      result.current[1].openEditNameModal();
    });

    // Act
    await act(async () => {
      result.current[1].closeEditNameModal();
    });

    // Assert
    expect(result.current[0].isEditingName).toBe(false);
    expect(result.current[0].validationError).toBeNull();
  });

  it("deve atualizar o nome digitado via setNameInput e limpar erro de validação ativo", async () => {
    // Arrange
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    await act(async () => {
      result.current[1].openEditNameModal();
    });

    // Act
    await act(async () => {
      result.current[1].setNameInput("Carlos Drummond");
    });

    // Assert
    expect(result.current[0].nameInput).toBe("Carlos Drummond");
  });

  it("deve salvar novo nome com sucesso, atualizar o perfil e fechar o modal", async () => {
    // Arrange
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    await act(async () => {
      result.current[1].openEditNameModal();
      result.current[1].setNameInput("Novo Nome de Teste");
    });

    // Act
    let success = false;
    await act(async () => {
      success = await result.current[1].saveName();
    });

    // Assert
    expect(success).toBe(true);
    expect(result.current[0].saving).toBe(false);
    expect(result.current[0].isEditingName).toBe(false);
    expect(result.current[0].profile?.name).toBe("Novo Nome de Teste");
    expect(result.current[0].validationError).toBeNull();
    expect(result.current[0].error).toBeNull();
    expect(fakeUseCases.updateName).toHaveBeenCalledWith("Novo Nome de Teste");
  });

  it("deve tratar erro de validação mantendo o input preservado e o modal aberto", async () => {
    // Arrange
    fakeUseCases.updateName = jest.fn(async () => {
      throw new ValidationError("O nome é obrigatório.");
    });
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    await act(async () => {
      result.current[1].openEditNameModal();
      result.current[1].setNameInput("   ");
    });

    // Act
    let success = true;
    await act(async () => {
      success = await result.current[1].saveName();
    });

    // Assert
    expect(success).toBe(false);
    expect(result.current[0].saving).toBe(false);
    expect(result.current[0].isEditingName).toBe(true);
    expect(result.current[0].nameInput).toBe("   ");
    expect(result.current[0].validationError).toBe("O nome é obrigatório.");
  });

  it("deve tratar erro de domínio no salvamento exibindo no erro global", async () => {
    // Arrange
    fakeUseCases.updateName = jest.fn(async () => {
      throw new DataSourceError("Falha de conexão ao persistir nome.");
    });
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    await act(async () => {
      result.current[1].openEditNameModal();
      result.current[1].setNameInput("Ana Paula");
    });

    // Act
    let success = true;
    await act(async () => {
      success = await result.current[1].saveName();
    });

    // Assert
    expect(success).toBe(false);
    expect(result.current[0].saving).toBe(false);
    expect(result.current[0].isEditingName).toBe(true);
    expect(result.current[0].error).toBe("Falha de conexão ao persistir nome.");
    expect(result.current[0].validationError).toBeNull();
  });

  it("deve permitir limpar mensagem de erro através da ação clearError", async () => {
    // Arrange
    fakeUseCases.getProfile = jest.fn(async () => {
      throw new DataSourceError("Falha temporária");
    });
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    expect(result.current[0].error).toBe("Falha temporária");

    // Act
    await act(async () => {
      result.current[1].clearError();
    });

    // Assert
    expect(result.current[0].error).toBeNull();
  });
  it("preserva as métricas após falha na recarga e permite recuperação", async () => {
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    const previous = result.current[0].profile;
    fakeUseCases.getProfile = jest.fn().mockRejectedValueOnce(new DataSourceError("Falha temporária")).mockResolvedValue(currentProfile);
    await act(async () => { await result.current[1].loadProfile(); });
    expect(result.current[0].profile).toBe(previous);
    expect(result.current[0].error).toBe("Falha temporária");
    await act(async () => { await result.current[1].loadProfile(); });
    expect(result.current[0].error).toBeNull();
    expect(result.current[0].profile).toEqual(currentProfile);
  });

  it("mantém as métricas conhecidas quando salvar o nome falha", async () => {
    const { result } = await renderHook(() => useProfileViewModel(fakeUseCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    const previous = result.current[0].profile;
    fakeUseCases.updateName = jest.fn().mockRejectedValue(new DataSourceError("Não foi possível salvar."));
    await act(async () => { await result.current[1].saveName(); });
    expect(result.current[0].profile).toBe(previous);
    expect(result.current[0].loading).toBe(false);
    expect(result.current[0].error).toBe("Não foi possível salvar.");
  });

});

describe("useProfileViewModel (navegação)", () => {
  it.each([
    ["handleOpenAchievements", "/achievements"],
    ["handleOpenCategories", "/categories"],
    ["handleOpenSettings", "/settings"],
  ] as const)("%s abre %s", async (action, path) => {
    const useCases: IProfileUseCases = {
      getProfile: jest.fn(async () => ({ ...mockStudentProfile })),
      updateName: jest.fn(async (name: string) => ({ ...mockStudentProfile, name })),
    };
    const { result } = await renderHook(() => useProfileViewModel(useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    result.current[1][action]();
    expect(mockNavigate).toHaveBeenCalledWith(path);
  });
});
