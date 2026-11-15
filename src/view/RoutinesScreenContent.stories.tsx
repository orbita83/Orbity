import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fn } from "storybook/test";
import { useNewRoutineViewModel } from "../viewmodel/NewRoutineViewModel";
import { useRoutineDetailsViewModel } from "../viewmodel/RoutineDetailsViewModel";
import { useRoutinesViewModel } from "../viewmodel/RoutinesViewModel";
import { PROTOTYPE_ROUTINE_DETAILS, PROTOTYPE_ROUTINES } from "./__fixtures__/routines.fixture";
import { NewRoutineScreenContent } from "./NewRoutineScreenContent";
import { RoutineDetailsScreenContent } from "./RoutineDetailsScreenContent";
import { RoutinesScreenContent, type RoutinesScreenContentProps } from "./RoutinesScreenContent";
import { themes } from "./theme/tokens";

// Histórias com props fixas ou ViewModel em memória: nunca importam @/DI.
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } };
const noop = () => undefined;

const baseArgs: RoutinesScreenContentProps = {
  visibleRoutines: [...PROTOTYPE_ROUTINES],
  totalCount: 3,
  doneTodayCount: 1,
  query: "",
  lastDeleted: null,
  setQuery: fn(),
  toggleDoneToday: fn(),
  deleteRoutine: fn(),
  undoDelete: fn(),
  dismissDeleted: fn(),
  onCreateRoutine: fn(),
  onOpenRoutine: fn(),
};

const meta = {
  title: "Telas/Rotinas",
  component: RoutinesScreenContent,
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
} satisfies Meta<RoutinesScreenContentProps>;

export default meta;
type Story = StoryObj<RoutinesScreenContentProps>;

export const Lista: Story = { name: "3 · Rotinas" };
export const Vazia: Story = { name: "3 · Sem rotinas", args: { visibleRoutines: [], totalCount: 0, doneTodayCount: 0 } };
export const RotinaExcluida: Story = {
  name: "3.4 · Rotina excluída",
  args: { visibleRoutines: PROTOTYPE_ROUTINES.slice(1), totalCount: 2, doneTodayCount: 0, lastDeleted: PROTOTYPE_ROUTINES[0] },
};

const InteractiveList = () => {
  const vm = useRoutinesViewModel(PROTOTYPE_ROUTINES);
  return <RoutinesScreenContent {...vm} onCreateRoutine={noop} onOpenRoutine={noop} />;
};
export const Interativa: Story = { name: "Interativa · busca e conclusão", render: () => <InteractiveList /> };

const InteractiveForm = () => {
  const vm = useNewRoutineViewModel();
  return <NewRoutineScreenContent {...vm} onBack={vm.reset} />;
};
export const NovaRotina: Story = { name: "3.1 · Nova rotina (interativa)", render: () => <InteractiveForm /> };

const InteractiveDetails = ({ confirm = false }: { confirm?: boolean }) => {
  const vm = useRoutineDetailsViewModel(PROTOTYPE_ROUTINE_DETAILS);
  return <RoutineDetailsScreenContent {...vm} confirmDeleteVisible={confirm || vm.confirmDeleteVisible} onBack={noop} onDeleted={noop} />;
};
export const Detalhe: Story = { name: "3.2 · Detalhe da rotina (interativa)", render: () => <InteractiveDetails /> };
export const ExcluirRotina: Story = { name: "3.3 · Excluir rotina", render: () => <InteractiveDetails confirm /> };

const styles = StyleSheet.create({
  frame: { width: 390, height: 844, backgroundColor: themes.cosmic.color.surface },
});
