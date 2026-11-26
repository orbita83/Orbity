import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fn } from "storybook/test";
import { createFocusSessionFixture } from "../model/__fixtures__/focusSession.fixture";
import { useFocusSessionViewModel, type FocusTarget } from "../viewmodel/useFocusSessionViewModel";
import {
  FocusSessionScreenContent,
  type FocusSessionScreenContentProps,
} from "./focus-session-content";
import { themes } from "./theme/tokens";

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
};

const STORY_TARGETS: readonly FocusTarget[] = [
  { kind: "standalone-task", id: "t-calc", title: "Lista de Cálculo II" },
  { kind: "routine", id: "r-morning", title: "Rotina Matinal de Revisão" },
];

const baseArgs: FocusSessionScreenContentProps = {
  loading: false,
  submitting: false,
  errorKey: null,
  validationError: null,
  permissionNoticeKey: null,
  targets: STORY_TARGETS,
  selectedTarget: STORY_TARGETS[0],
  selectedDuration: 15,
  activeSession: null,
  lastEndedSession: null,
  lastEndedFocusedMinutes: null,
  streakDays: 12,
  remainingMs: 15 * 60_000,
  timerLabel: "15:00",
  cycleCompleted: false,
  phaseProgress: 0,
  planetFocusStage: 0,
  currentCycleInSet: 1,
  totalFocusedMinutes: 0,
  confirmEndVisible: false,
  announcement: null,
  reduceMotion: true,
  onBack: fn(),
  reload: fn(async () => undefined),
  selectTarget: fn(),
  selectDuration: fn(),
  start: fn(async () => undefined),
  pause: fn(async () => undefined),
  resume: fn(async () => undefined),
  advanceCycle: fn(async () => undefined),
  requestEnd: fn(),
  cancelEnd: fn(),
  confirmEnd: fn(async () => undefined),
  dismissPermissionNotice: fn(),
};

const meta = {
  title: "Telas/Modo Foco",
  component: FocusSessionScreenContent,
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
} satisfies Meta<FocusSessionScreenContentProps>;

export default meta;
type Story = StoryObj<FocusSessionScreenContentProps>;

export const ConfigurarSessao: Story = {
  name: "1.3 · Configurar sessão (15 min padrão)",
};

export const SemAtividades: Story = {
  name: "1.3 · Sem tarefas ou rotinas (RN-0001)",
  args: {
    targets: [],
    selectedTarget: null,
  },
};

export const FocoEmAndamento: Story = {
  name: "1.3 · Ciclo de foco em andamento (RN-0006)",
  args: {
    activeSession: createFocusSessionFixture({
      targetTitle: "Lista de Cálculo II",
      phase: "focus",
      status: "running",
      completedFocusCycles: 1,
    }),
    timerLabel: "08:42",
    phaseProgress: 0.58,
    planetFocusStage: 3,
    currentCycleInSet: 2,
    totalFocusedMinutes: 21,
  },
};

export const SessaoPausada: Story = {
  name: "1.3 · Sessão pausada",
  args: {
    activeSession: createFocusSessionFixture({
      targetTitle: "Rotina Matinal de Revisão",
      targetKind: "routine",
      phase: "focus",
      status: "paused",
      pausedRemainingMs: 6 * 60_000,
    }),
    timerLabel: "06:00",
    phaseProgress: 0.6,
    planetFocusStage: 3,
    totalFocusedMinutes: 9,
  },
};

export const PausaLonga: Story = {
  name: "1.3 · Pausa longa (após 4 ciclos)",
  args: {
    activeSession: createFocusSessionFixture({
      targetTitle: "Lista de Cálculo II",
      phase: "long-break",
      status: "running",
      completedFocusCycles: 4,
      cycleDurationMs: 15 * 60_000,
    }),
    timerLabel: "14:10",
    phaseProgress: 0.06,
    planetFocusStage: 1,
    currentCycleInSet: 4,
    totalFocusedMinutes: 60,
  },
};

const InteractiveFocusPreview = () => {
  const [state, actions] = useFocusSessionViewModel({
    prototype: true,
    targets: STORY_TARGETS,
    streakDays: 12,
  });
  const { handleBack, ...restActions } = actions;
  return (
    <FocusSessionScreenContent
      {...state}
      {...restActions}
      reduceMotion
      onBack={handleBack}
    />
  );
};

export const Interativo: Story = {
  name: "1.3 · Protótipo interativo",
  render: () => <InteractiveFocusPreview />,
};

const styles = StyleSheet.create({
  frame: {
    width: 390,
    height: 844,
    backgroundColor: themes.cosmic.color.surface,
  },
});
