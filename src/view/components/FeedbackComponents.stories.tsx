import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fn } from "storybook/test";
import { themes } from "../theme/tokens";
import { ConfirmDialog } from "./ConfirmDialog";
import { ContextualActionBar, ContextualHeader } from "./ContextualActionBar";
import { Snackbar } from "./Snackbar";

const theme = themes.cosmic;
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } };

const meta = {
  title: "Design System/Diálogo, aviso e seleção",
  component: ConfirmDialog,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <SafeAreaProvider initialMetrics={metrics}>
        <View style={styles.frame}>
          <Story />
        </View>
      </SafeAreaProvider>
    ),
  ],
  args: {
    visible: true,
    title: "Excluir a rotina Matemática?",
    message: "Ela sai da sua lista e não aparece mais nos próximos dias.",
    icon: "delete_outline",
    cancelLabel: "Manter rotina",
    confirmLabel: "Excluir rotina",
    onCancel: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmacaoDestrutiva: Story = {
  name: "ConfirmDialog · exclusão",
  render: (args) => (
    <ConfirmDialog {...args}>
      <View style={styles.note}>
        <Text style={styles.noteText}>Sua sequência, suas estrelas e suas conquistas continuam do mesmo jeito.</Text>
      </View>
    </ConfirmDialog>
  ),
};

export const AvisoComDesfazer: Story = {
  name: "Snackbar · com Desfazer",
  render: () => (
    <View style={styles.bottom}>
      <Snackbar message="Rotina Matemática excluída." actionLabel="Desfazer" onAction={fn()} />
    </View>
  ),
};

export const SelecaoMultipla: Story = {
  name: "ContextualHeader e ContextualActionBar",
  render: () => (
    <View style={styles.selection}>
      <ContextualHeader countLabel="2 selecionadas" onCancel={fn()} />
      <View style={styles.spacer} />
      <ContextualActionBar
        actions={[
          { id: "pin", label: "Fixar", icon: "push_pin", onPress: fn() },
          { id: "all", label: "Marcar todas", icon: "done_all", onPress: fn() },
          { id: "delete", label: "Excluir (2)", icon: "delete_outline", onPress: fn(), destructive: true },
        ]}
      />
    </View>
  ),
};

const styles = StyleSheet.create({
  frame: { width: 390, height: 844, backgroundColor: theme.color.surface },
  note: {
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color["border-subtle"],
    backgroundColor: theme.navbar.bg,
  },
  noteText: { ...theme.font["body-sm"], color: theme.color["on-surface"] },
  bottom: { flex: 1, justifyContent: "flex-end", padding: theme.space.md },
  selection: { flex: 1 },
  spacer: { flex: 1 },
});
