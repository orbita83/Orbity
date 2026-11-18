import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fn } from "storybook/test";
import { LocalDate } from "../model/entities/local-date";
import { validateCreateTaskInput } from "../model/entities/task";
import type { IClockService } from "../model/services/i-clock-service";
import type { ITaskUseCases } from "../usecase/i-task-use-cases";
import { useNewTaskViewModel } from "../viewmodel/useNewTaskViewModel";
import { useTasksViewModel } from "../viewmodel/useTasksViewModel";
import { PROTOTYPE_TASKS } from "./__fixtures__/task-list.fixture";
import { NewTaskScreenContent } from "./new-task-content";
import { TasksScreenContent, type TasksScreenContentProps } from "./tasks-content";
import { themes } from "./theme/tokens";

// Histórias com props fixas ou estado em memória: nunca importam @/di.
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } };
const noop = () => undefined;

const storyClock: IClockService = {
  now: () => "2026-11-15T10:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-15"),
};

const createStoryTaskUseCases = (): ITaskUseCases => ({
  listTasks: async () => [],
  createTask: async (input) => {
    const normalized = validateCreateTaskInput(input);
    return {
      id: "story-task",
      ...normalized,
      completed: false,
      pinned: false,
      createdAt: storyClock.now(),
      updatedAt: storyClock.now(),
    };
  },
  updateTask: async (input) => ({
    id: input.id,
    title: input.title ?? "",
    completed: false,
    pinned: false,
    createdAt: storyClock.now(),
    updatedAt: storyClock.now(),
  }),
  toggleTaskCompletion: async (id) => ({
    id,
    title: "",
    completed: true,
    pinned: false,
    createdAt: storyClock.now(),
    updatedAt: storyClock.now(),
  }),
  togglePinTasks: async () => [],
  deleteTasks: async () => undefined,
});

const baseArgs: TasksScreenContentProps = {
  visibleTasks: [...PROTOTYPE_TASKS],
  pendingCount: 3,
  totalCount: 4,
  filter: "all",
  selectionMode: false,
  selectedIds: [],
  allSelectedPinned: false,
  confirmDeleteVisible: false,
  loading: false,
  errorKey: null,
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
  reload: fn(async () => undefined),
  onCreateTask: fn(),
  onEditTask: fn(),
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
export const ConfirmarExclusaoIndividual: Story = {
  name: "2.3 · Confirmar exclusão individual",
  args: { selectionMode: true, selectedIds: ["a"], confirmDeleteVisible: true },
};
export const ConfirmarExclusao: Story = {
  name: "2.3 · Confirmar exclusão múltipla",
  args: { selectionMode: true, selectedIds: ["a", "b"], confirmDeleteVisible: true },
};

const InteractiveList = () => {
  const [state, actions] = useTasksViewModel(PROTOTYPE_TASKS);
  return <TasksScreenContent {...state} {...actions} onCreateTask={noop} onEditTask={noop} />;
};
export const Interativa: Story = {
  name: "Interativa · filtros, conclusão e seleção (toque longo)",
  render: () => <InteractiveList />,
};

const storyTaskUseCases = createStoryTaskUseCases();

const InteractiveForm = () => {
  const [state, actions] = useNewTaskViewModel(storyTaskUseCases, storyClock);
  return <NewTaskScreenContent {...state} {...actions} onClose={actions.reset} onFinish={actions.reset} />;
};
export const NovaTarefa: Story = {
  name: "2.1 e 2.2 · Nova tarefa (interativa)",
  render: () => <InteractiveForm />,
};

const styles = StyleSheet.create({
  frame: { width: 390, height: 844, backgroundColor: themes.cosmic.color.surface },
});
