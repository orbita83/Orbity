import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { expect, userEvent, within } from "storybook/test";
import { PROTOTYPE_HOME_DASHBOARD } from "../infra/repositories/in-memory-home-repository";
import HomeScreen, { type HomeScreenProps } from "./home-screen";
import { cosmicTokens as t } from "./theme/tokens";

const zeroMetrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } };

const meta = {
  title: "Telas/Início cósmico",
  component: HomeScreen,
  tags: ["autodocs"],
  args: { initialStage: "collapsed", initialFocusMode: false, initialLoading: false },
  argTypes: {
    initialData: { control: false },
    initialStage: { control: "select", options: ["collapsed", "stage1_1", "stage1_2"] },
    previewWidth: { control: "number" },
    previewHeight: { control: "number" },
  },
  parameters: {
    cosmicHome: true,
    layout: "fullscreen",
    docs: { description: { component: "Protótipo baseado na referência visual aprovada: cenário cósmico, planeta com sequência, três alturas do painel, cards de foco, progresso e conquistas. A navegação permanece fixa nos três estágios. Dados e sessões ficam em memória." } },
  },
  decorators: [(Story) => <SafeAreaProvider initialMetrics={zeroMetrics}><Story /></SafeAreaProvider>],
} satisfies Meta<HomeScreenProps>;

export default meta;
type Story = StoryObj<HomeScreenProps>;

export const ReferenciaCompleta: Story = {
  name: "Referência · três estados lado a lado",
  render: () => <ScrollView horizontal contentContainerStyle={styles.gallery}><View style={styles.frame}><HomeScreen previewWidth={390} previewHeight={844} initialStage="collapsed" /></View><View style={styles.frame}><HomeScreen previewWidth={390} previewHeight={844} initialStage="stage1_1" /></View><View style={styles.frame}><HomeScreen previewWidth={390} previewHeight={844} initialStage="stage1_2" /></View></ScrollView>,
};

export const PrototipoPadrao: Story = { name: "1. Planeta · painel recolhido" };
export const PainelEstagio1_1: Story = { name: "2. Foco e progresso · painel intermediário", args: { initialStage: "stage1_1" } };
export const PainelEstagio1_2: Story = { name: "3. Jornada completa · painel expandido", args: { initialStage: "stage1_2" } };
export const ModoFocoAtivo: Story = { name: "4. Sessão de foco em andamento", args: { initialFocusMode: true, initialStage: "stage1_1" } };
export const SemSessoesHoje: Story = {
  name: "5. Sua jornada começa aqui",
  args: { initialStage: "stage1_1", initialData: { ...PROTOTYPE_HOME_DASHBOARD, streakDays: 0, planetStageName: "Inicie sua jornada no seu ritmo", lastSession: undefined, dailyProgress: { completedMinutes: 0, targetMinutes: 25, completedSessions: 0, targetSessions: 15 }, achievements: PROTOTYPE_HOME_DASHBOARD.achievements.map((achievement) => ({ ...achievement, unlocked: false })) } },
};
export const Carregando: Story = { name: "6. Carregando", args: { initialStage: "stage1_1", initialLoading: true } };

export const ExplorarPainel: Story = {
  name: "7. Interação · explorar os três estados",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Deslize para explorar" }));
    await expect(canvas.findByRole("button", { name: "Iniciar foco" })).resolves.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Expandir painel de foco" }));
    await expect(canvas.findByText("Última sessão")).resolves.toBeVisible();
    await expect(canvas.getByRole("tab", { name: "Início, 1 de 5" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Recolher painel de foco" }));
    await expect(canvas.findByRole("button", { name: "Deslize para explorar" })).resolves.toBeVisible();
  },
};

const styles = StyleSheet.create({
  gallery: { backgroundColor: t.color.desktop, padding: t.space.xxl, gap: t.space.section, alignItems: "flex-start" },
  frame: { width: 390, height: 844 },
});
