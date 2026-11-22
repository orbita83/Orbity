import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { renderRouter } from "expo-router/testing-library";
import { usePathname } from "expo-router";
import { Text } from "react-native";
import RootLayout from "@/app/_layout";
import ProfileScreen from "./profile";
import AchievementsScreen from "./achievements";
import CategoriesScreen from "./categories";
import SettingsScreen from "./settings";
import { mockStudentProfile } from "@/model/__fixtures__/studentProfile.fixture";
import type { IProfileUseCases } from "@/usecase/iProfileUseCases";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";

// ViewModel real com um Use Case falso: os atalhos navegam pelas ações da ViewModel.
const profileUseCases: IProfileUseCases = {
  getProfile: async () => mockStudentProfile,
  updateName: async (name) => ({ ...mockStudentProfile, name }),
};
const Profile = () => {
  const [state, actions] = useProfileViewModel(profileUseCases);
  return <ProfileScreen viewModel={{ ...state, ...actions }} />;
};
const Path = () => <Text>{usePathname()}</Text>;
const routes = { _layout: RootLayout, index: Path, tasks: Path, routines: Path, cosmos: Path, profile: Profile, achievements: AchievementsScreen, categories: CategoriesScreen, settings: SettingsScreen };

describe("Navegação integrada do perfil", () => {
  it.each(["Conquistas", "Categorias", "Configurações"])("abre %s pelo atalho, preserva abas e retorna ao perfil", async (title) => {
    await renderRouter(routes, { initialUrl: "/profile" });
    await fireEvent.press(await screen.findByRole("link", { name: title }));
    await waitFor(() => expect(screen.getByRole("header", { name: title })).toBeTruthy());
    expect(screen.getAllByRole("tab")).toHaveLength(5);
    expect(screen.getByRole("tab", { name: /Aba Perfil/ }).props.accessibilityState.selected).toBe(true);
    await fireEvent.press(screen.getByRole("button", { name: "Voltar ao perfil" }));
    await waitFor(() => expect(screen.getByRole("header", { name: "Meu perfil" })).toBeTruthy());
  });

  it.each(["achievements", "categories", "settings"])("retorna ao perfil após URL direta /%s", async (route) => {
    await renderRouter(routes, { initialUrl: `/${route}` });
    await fireEvent.press(screen.getByRole("button", { name: "Voltar ao perfil" }));
    await waitFor(() => expect(screen.getByRole("header", { name: "Meu perfil" })).toBeTruthy());
  });
});
