import { render, screen } from "@testing-library/react-native";
import ProfileScreen from "./profile";
import type { ProfileState, ProfileActions } from "@/viewmodel/useProfileViewModel";
import { createStudentProfileFixture } from "@/model/__fixtures__/studentProfile.fixture";

// Isola apresentação; os destinos são validados com Expo Router real na integração.
// A renderização SVG real permanece nos testes dos componentes e da navegação.
jest.mock("./components/MaterialSymbol", () => ({ MaterialSymbol: () => null }));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: jest.requireActual<typeof import("react-native")>("react-native").View,
}));

const state: ProfileState & ProfileActions = {
  profile: createStudentProfileFixture(), loading: false, saving: false, error: null,
  validationError: null, isEditingName: false, nameInput: "Alex Silva",
  loadProfile: async () => { }, openEditNameModal: () => { }, closeEditNameModal: () => { },
  setNameInput: () => { }, saveName: async () => true, clearError: () => { },
  handleOpenAchievements: () => { }, handleOpenCategories: () => { }, handleOpenSettings: () => { },
};

describe("Estados integrados do perfil", () => {
  it("oculta os links durante carregamento e os mantém disponíveis quando a consulta falha", async () => {
    const view = await render(<ProfileScreen viewModel={{ ...state, loading: true, profile: null }} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByLabelText("Carregando métricas do perfil")).toBeTruthy();
    await view.rerender(<ProfileScreen viewModel={{ ...state, profile: null, error: "Falha temporária." }} />);
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByText("Métricas indisponíveis no momento.")).toBeTruthy();
    expect(screen.queryByText(/Sua jornada pode começar/)).toBeNull();
  });

  it("preserva dados conhecidos durante salvamento e erro de edição", async () => {
    await render(<ProfileScreen viewModel={{ ...state, saving: true, error: "Não foi possível salvar o nome." }} />);
    expect(screen.getByLabelText("42 horas de estudo")).toBeTruthy();
    expect(screen.queryByLabelText("Carregando métricas do perfil")).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });
});
