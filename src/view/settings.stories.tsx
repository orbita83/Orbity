import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { fn } from "storybook/test";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SettingsScreen from "./settings";

const viewModel = {
  policyUrl: "https://orbita83.github.io/Orbity/privacidade/",
  openingPolicy: false,
  error: null,
  handleReturnToProfile: fn(),
  handleOpenPrivacyPolicy: fn(async () => {}),
};
const meta = {
  title: "Perfil/settings",
  component: SettingsScreen,
  decorators: [(Story) => <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, right: 0, bottom: 0, left: 0 } }}><Story /></SafeAreaProvider>],
  args: { viewModel },
} satisfies Meta<typeof SettingsScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "Política de privacidade" };
export const Opening: Story = { name: "Abrindo navegador", args: { viewModel: { ...viewModel, openingPolicy: true } } };
export const Error: Story = { name: "Falha de abertura", args: { viewModel: { ...viewModel, error: "Não foi possível abrir a política de privacidade. Tente novamente ou copie o endereço abaixo para o navegador." } } };
