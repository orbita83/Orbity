import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LocalDate } from "../model/entities/local-date";
import type { HomeSummary } from "../model/entities/home-summary";
import { HomeScreenContent, type HomeScreenContentProps } from "./index-content";
import { themes } from "./theme/tokens";

// Histórias com props fixas: nunca importam @/DI (Technical Plan §7).
const zeroMetrics = { frame: { x: 0, y: 0, width: 390, height: 760 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } };
const today = LocalDate.parse("2026-11-14");
const noop = () => undefined;

const summaryWith = (currentDays: number, completed: number, total: number): HomeSummary => ({
  streak: { currentDays, lastActiveDate: currentDays > 0 ? today : null, asOf: today },
  progress: { completed, total, ratio: total === 0 ? null : completed / total },
  focus: { canStart: false, reason: "no-targets", durations: [5, 10, 15, 20, 25, 30], defaultDuration: 15 },
});

const baseArgs: HomeScreenContentProps = {
  status: "ready",
  error: null,
  summary: summaryWith(0, 0, 0),
  progressLabel: "0/0",
  sheetStage: "collapsed",
  reduceMotion: false,
  onRetry: noop,
  onCycleSheetStage: noop,
  onCollapseSheet: noop,
  onExpandSheet: noop,
  onReduceSheet: noop,
  onSetSheetStage: noop,
};

const meta = {
  title: "Telas/Início",
  component: HomeScreenContent,
  args: baseArgs,
  argTypes: { sheetStage: { control: "select", options: ["collapsed", "stage1_1", "stage1_2"] } },
  parameters: { cosmicHome: true, layout: "fullscreen" },
  decorators: [
    (Story) => (
      <SafeAreaProvider initialMetrics={zeroMetrics}>
        <View style={styles.frame}>
          <Story />
        </View>
      </SafeAreaProvider>
    ),
  ],
} satisfies Meta<HomeScreenContentProps>;

export default meta;
type Story = StoryObj<HomeScreenContentProps>;

export const Vazio: Story = { name: "Vazio · sem atividades" };
export const VazioPainelAberto: Story = { name: "Vazio · painel aberto", args: { sheetStage: "stage1_1" } };
export const VazioPainelExpandido: Story = { name: "Vazio · painel expandido", args: { sheetStage: "stage1_2" } };
export const ComSequencia: Story = {
  name: "Com sequência · 12 dias, 1/25",
  args: { summary: summaryWith(12, 1, 25), progressLabel: "1/25", sheetStage: "collapsed" },
};
export const ComSequenciaPainelAberto: Story = {
  name: "Com sequência · painel aberto",
  args: { summary: summaryWith(12, 1, 25), progressLabel: "1/25", sheetStage: "stage1_1" },
};
export const Erro: Story = {
  name: "Erro · nova tentativa",
  args: { status: "error", summary: null, error: { messageKey: "error.persistence", retryable: true } },
};
export const ErroDeEsquema: Story = {
  name: "Erro · versão do banco",
  args: { status: "error", summary: null, error: { messageKey: "error.schema", retryable: false } },
};

const styles = StyleSheet.create({
  frame: { width: 390, height: 760, backgroundColor: themes.cosmic.color.surface },
});
