import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { fn } from "storybook/test";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ProfileScreen from "./profile";
import { themes } from "./theme/tokens";
import type { ProfileState, ProfileActions } from "@/viewmodel/useProfileViewModel";

const viewModel: ProfileState & ProfileActions = {
  profile: { id: "preview", name: "Alex Silva", streakDays: 12, achievementsCount: 5, studyHours: 42 },
  loading: false, saving: false, error: null, validationError: null, isEditingName: false, nameInput: "Alex Silva",
  loadProfile: fn(async () => { }), openEditNameModal: fn(), closeEditNameModal: fn(), setNameInput: fn(), saveName: fn(async () => true), clearError: fn(),
  handleOpenAchievements: fn(), handleOpenCategories: fn(), handleOpenSettings: fn(),
};
const meta = { title: "Perfil/profile", component: ProfileScreen, decorators: [(Story) => <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, right: 0, bottom: 0, left: 0 } }}><Story /></SafeAreaProvider>], tags: ["autodocs"], args: { viewModel, theme: themes.cosmic }, argTypes: { viewModel: { control: false }, theme: { control: false } } } satisfies Meta<typeof ProfileScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Success: Story = { name: "Sucesso",};
export const Loading: Story = { name: "Carregando", args: { viewModel: { ...viewModel, loading: true, profile: null } } };
export const Empty: Story = { name: "Vazio", args: { viewModel: { ...viewModel, profile: { ...viewModel.profile!, streakDays: 0, achievementsCount: 0, studyHours: 0 } } } };
export const FirstUse: Story = { name: "Primeiro uso", args: { viewModel: { ...viewModel, nameInput: "", profile: { id: "preview", name: "", streakDays: 0, achievementsCount: 0, studyHours: 0 } } } };
export const Error: Story = { name: "Erro", args: { viewModel: { ...viewModel, profile: null, error: "Não foi possível carregar os dados do perfil." } } };
export const ErrorWithData: Story = { name: "Erro com dados", args: { viewModel: { ...viewModel, error: "Não foi possível atualizar o nome do perfil." } } };
export const Light: Story = { name: "Claro", args: { theme: themes.light } };
export const Dark: Story = { name: "Escuro", args: { theme: themes.dark } };
