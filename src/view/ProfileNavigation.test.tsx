import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { renderRouter } from "expo-router/testing-library";
import { usePathname } from "expo-router";
import { Text } from "react-native";
import RootLayout from "@/app/_layout";
import ProfileScreen from "./ProfileScreen";
import AchievementsScreen from "./AchievementsScreen";
import CategoriesScreen from "./CategoriesScreen";
import SettingsScreen from "./SettingsScreen";
import { mockStudentProfile } from "@/model/__fixtures__/student-profile.fixture";

const profileState = {
  profile: mockStudentProfile, loading: false, saving: false, error: null, validationError: null,
  isEditingName: false, nameInput: "Alex", loadProfile: async () => { }, openEditNameModal: () => { },
  closeEditNameModal: () => { }, setNameInput: () => { }, saveName: async () => true, clearError: () => { },
};
const Profile = () => <ProfileScreen viewModel={profileState} />;
const Path = () => <Text>{usePathname()}</Text>;
const routes = { _layout: RootLayout, index: Path, tasks: Path, routines: Path, cosmos: Path, profile: Profile, achievements: AchievementsScreen, categories: CategoriesScreen, settings: SettingsScreen };

describe("Navegação integrada do perfil", () => {
  it.each(["Conquistas", "Categorias", "Configurações"])("abre %s pelo atalho, preserva abas e retorna ao perfil", async (title) => {
    await renderRouter(routes, { initialUrl: "/profile" });
    await fireEvent.press(screen.getByRole("link", { name: title }));
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
