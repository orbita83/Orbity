import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fn } from "storybook/test";
import { useNewTaskViewModel } from "../viewmodel/NewTaskViewModel";
import { useTasksViewModel } from "../viewmodel/TasksViewModel";
import { PROTOTYPE_TASKS } from "./__fixtures__/task-list.fixture";
import { NewTaskScreenContent } from "./NewTaskScreenContent";
import { TasksScreenContent, type TasksScreenContentProps } from "./TasksScreenContent";
import { themes } from "./theme/tokens";

// Histórias com props fixas ou ViewModel em memória: nunca importam @/DI.
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } };
const noop = () => undefined;

const baseArgs: TasksScreenContentProps = {
  visibleTasks: [...PROTOTYPE_TASKS],
  pendingCount: 3,
  totalCount: 4,
  filter: "all",
  selectionMode: false,
  selectedIds: [],
  confirmDeleteVisible: false,
  selectFilter: fn(),
  toggleCompleted: fn(),
  startSelection: fn(),
  toggleSelected: fn(),
  cancelSelection: fn(),
  selectAll: fn(),
  pinSelected: fn(),
  requestDelete: fn(),
  cancelDelete: fn(),
  confirmDelete: fn(),
  onCreateTask: fn(),
};

const meta = {
  title: "Telas/Tarefas",
  component: TasksScreenContent,
  args: baseArgs,
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
} satisfies Meta<TasksScreenContentProps>;

export default meta;
type Story = StoryObj<TasksScreenContentProps>;

export const Lista: Story = { name: "2 · Lista de tarefas" };
export const Vazia: Story = {
  name: "2 · Sem tarefas",
  args: { visibleTasks: [], pendingCount: 0, totalCount: 0 },
};
export const Selecao: Story = {
  name: "2.3 · Seleção múltipla",
  args: { selectionMode: true, selectedIds: ["a"] },
};
export const ConfirmarExclusao: Story = {
  name: "2.3 · Confirmar exclusão",
  args: { selectionMode: true, selectedIds: ["a", "b"], confirmDeleteVisible: true },
};

const InteractiveList = () => {
  const vm = useTasksViewModel(PROTOTYPE_TASKS);
  return <TasksScreenContent {...vm} onCreateTask={noop} />;
};
export const Interativa: Story = {
  name: "Interativa · filtros, conclusão e seleção (toque longo)",
  render: () => <InteractiveList />,
};

const InteractiveForm = () => {
  const vm = useNewTaskViewModel();
  return <NewTaskScreenContent {...vm} onClose={vm.reset} onFinish={vm.reset} />;
};
export const NovaTarefa: Story = {
  name: "2.1 e 2.2 · Nova tarefa (interativa)",
  render: () => <InteractiveForm />,
};

const styles = StyleSheet.create({
  frame: { width: 390, height: 844, backgroundColor: themes.cosmic.color.surface },
});
