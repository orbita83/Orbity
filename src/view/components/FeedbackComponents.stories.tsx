import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fn } from "storybook/test";
import { ROUTINES_COPY, formatRoutinesCopy } from "../routines-copy";
import { TASKS_COPY, formatTasksCopy } from "../tasks-copy";
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
    title: formatRoutinesCopy("delete.title", { name: "Matemática" }),
    message: formatRoutinesCopy("delete.message.other", { n: 3 }),
    icon: "delete_outline",
    cancelLabel: ROUTINES_COPY["delete.cancel"],
    confirmLabel: ROUTINES_COPY["delete.confirm"],
    onCancel: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExclusaoTarefaIndividual: Story = {
  name: "ConfirmDialog · exclusão individual de tarefa",
  args: {
    title: TASKS_COPY["delete.title.one"],
    message: TASKS_COPY["delete.message"],
    cancelLabel: TASKS_COPY["delete.cancel"],
    confirmLabel: TASKS_COPY["delete.confirm"],
  },
};

export const ExclusaoTarefasMultiplas: Story = {
  name: "ConfirmDialog · exclusão múltipla de tarefas",
  args: {
    title: formatTasksCopy("delete.title.other", { n: 2 }),
    message: TASKS_COPY["delete.message"],
    cancelLabel: TASKS_COPY["delete.cancel"],
    confirmLabel: TASKS_COPY["delete.confirm"],
  },
};

export const ConfirmacaoDestrutiva: Story = {
  name: "ConfirmDialog · exclusão de rotina",
  render: (args) => (
    <ConfirmDialog {...args}>
      <View style={styles.note}>
        <Text style={styles.noteText}>{ROUTINES_COPY["delete.note"]}</Text>
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
