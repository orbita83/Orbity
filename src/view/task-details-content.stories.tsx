import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fn } from "storybook/test";
import { createDefaultCategories } from "../model/entities/category";
import { useTaskDetailsViewModel, type TaskDetails } from "../viewmodel/useTaskDetailsViewModel";
import { TaskDetailsScreenContent, type TaskDetailsScreenContentProps } from "./task-details-content";

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } };

const PROTOTYPE_TASK: TaskDetails = {
  id: "c",
  title: "Estudar para IHC",
  description: "Revisar os princípios de Nielsen e o capítulo de acessibilidade.",
  startLabel: "20/10/2026 · 14:00",
  endLabel: "20/10/2026 · 15:00",
  category: "reading",
  completed: false,
};

const baseArgs: TaskDetailsScreenContentProps = {
  task: PROTOTYPE_TASK,
  categories: createDefaultCategories(),
  loading: false,
  errorKey: null,
  toggleCompleted: fn(),
  onBack: fn(),
  onEdit: fn(),
};

// Detalhe com estado real da ViewModel em modo protótipo: o botão do rodapé conclui e reabre.
const InteractiveDetails = () => {
  const [state, actions] = useTaskDetailsViewModel(PROTOTYPE_TASK);
  return <TaskDetailsScreenContent {...state} {...actions} onBack={fn()} onEdit={fn()} />;
};

const meta = {
  title: "Telas/Detalhe da tarefa",
  component: TaskDetailsScreenContent,
  args: baseArgs,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <SafeAreaProvider initialMetrics={metrics}>
        <Story />
      </SafeAreaProvider>
    ),
  ],
} satisfies Meta<TaskDetailsScreenContentProps>;

export default meta;
type Story = StoryObj<TaskDetailsScreenContentProps>;

export const Pendente: Story = { name: "2.4 · Detalhe da tarefa" };
export const Concluida: Story = { name: "2.4 · Tarefa concluída", args: { task: { ...PROTOTYPE_TASK, completed: true } } };
export const SemDatas: Story = {
  name: "2.4 · Sem datas e sem categoria",
  args: { task: { ...PROTOTYPE_TASK, startLabel: undefined, endLabel: undefined, category: undefined, description: undefined } },
};
export const NaoEncontrada: Story = { name: "Tarefa não encontrada", args: { task: null } };
export const Interativa: Story = { name: "Interativa · concluir e reabrir", render: () => <InteractiveDetails /> };
