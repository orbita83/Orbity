import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createFocusSessionFixture } from "@/model/__fixtures__/focusSession.fixture";
import { PUNITIVE_TERMS } from "@/view/homeCopy";
import { FOCUS_COPY } from "@/view/focusCopy";
import {
  FocusSessionScreenContent,
  type FocusSessionScreenContentProps,
} from "@/view/focus-session-content";

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
};

const sampleTargets = [
  { kind: "standalone-task" as const, id: "t-1", title: "Estudar Cálculo II" },
  { kind: "routine" as const, id: "r-1", title: "Rotina Matinal" },
];

const propsWith = (
  overrides: Partial<FocusSessionScreenContentProps> = {},
): FocusSessionScreenContentProps => ({
  loading: false,
  submitting: false,
  errorKey: null,
  validationError: null,
  permissionNoticeKey: null,
  targets: sampleTargets,
  selectedTarget: sampleTargets[0],
  selectedDuration: 15,
  activeSession: null,
  lastEndedSession: null,
  lastEndedFocusedMinutes: null,
  streakDays: 7,
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
  onBack: jest.fn(),
  reload: jest.fn().mockResolvedValue(undefined),
  selectTarget: jest.fn(),
  selectDuration: jest.fn(),
  start: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(undefined),
  resume: jest.fn().mockResolvedValue(undefined),
  advanceCycle: jest.fn().mockResolvedValue(undefined),
  requestEnd: jest.fn(),
  cancelEnd: jest.fn(),
  confirmEnd: jest.fn().mockResolvedValue(undefined),
  dismissPermissionNotice: jest.fn(),
  ...overrides,
});

const renderScreen = (props: FocusSessionScreenContentProps) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <FocusSessionScreenContent {...props} />
    </SafeAreaProvider>,
  );

describe("FocusSessionScreenContent (issue #217)", () => {
  it("RN-0001 CA-03: sem atividades cadastradas, bloqueia Iniciar foco e orienta de forma acolhedora", async () => {
    await renderScreen(propsWith({ targets: [], selectedTarget: null }));

    expect(screen.getByText(FOCUS_COPY["targets.empty"])).toBeTruthy();
    const startBtn = screen.getByRole("button", { name: FOCUS_COPY["start.cta"] });
    expect(startBtn.props.accessibilityState.disabled).toBe(true);
    expect(screen.queryByTestId("planet-focus-aura")).toBeNull();
  });

  it("RF-0019 e RN-0001: permite selecionar atividade, duração de 5 a 30 min e iniciar sessão", async () => {
    const selectTarget = jest.fn();
    const selectDuration = jest.fn();
    const start = jest.fn().mockResolvedValue(undefined);
    await renderScreen(propsWith({ selectTarget, selectDuration, start }));

    await fireEvent.press(screen.getByRole("radio", { name: /Rotina Matinal/ }));
    expect(selectTarget).toHaveBeenCalledWith(sampleTargets[1]);

    await fireEvent.press(screen.getByRole("radio", { name: "25 minutos de foco" }));
    expect(selectDuration).toHaveBeenCalledWith(25);

    await fireEvent.press(screen.getByRole("button", { name: FOCUS_COPY["start.cta"] }));
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("sessão ativa: exibe vínculo (RN-0001 CA-02), evolução RN-0006 no planeta e visor MM:SS sem live region por segundo", async () => {
    const pause = jest.fn().mockResolvedValue(undefined);
    const requestEnd = jest.fn();
    const active = createFocusSessionFixture({
      targetTitle: "Estudar Cálculo II",
      phase: "focus",
      status: "running",
    });

    await renderScreen(
      propsWith({
        activeSession: active,
        timerLabel: "11:24",
        phaseProgress: 0.55,
        planetFocusStage: 3,
        totalFocusedMinutes: 8,
        pause,
        requestEnd,
      }),
    );

    expect(screen.getByText("Estudar Cálculo II")).toBeTruthy();
    expect(screen.getByTestId("planet-focus-aura")).toBeTruthy();
    expect(screen.getByTestId("planet-focus-stage-3")).toBeTruthy();

    const timerNode = screen.getByTestId("focus-timer-display");
    expect(timerNode).toHaveTextContent("11:24");
    expect(timerNode.props.accessibilityLiveRegion).toBeUndefined();

    await fireEvent.press(screen.getByRole("button", { name: FOCUS_COPY["controls.pause"] }));
    expect(pause).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole("button", { name: FOCUS_COPY["controls.end"] }));
    expect(requestEnd).toHaveBeenCalledTimes(1);
  });

  it("ciclo concluído no 4º ciclo oferece Iniciar pausa longa e permissão negada mostra aviso não bloqueante", async () => {
    const advanceCycle = jest.fn().mockResolvedValue(undefined);
    const active = createFocusSessionFixture({
      phase: "focus",
      status: "running",
      completedFocusCycles: 3,
    });

    await renderScreen(
      propsWith({
        activeSession: active,
        timerLabel: "00:00",
        cycleCompleted: true,
        phaseProgress: 1,
        planetFocusStage: 4,
        currentCycleInSet: 4,
        permissionNoticeKey: "notice.permission",
        advanceCycle,
      }),
    );

    expect(screen.getByText(FOCUS_COPY["notice.permission"])).toBeTruthy();
    await fireEvent.press(
      screen.getByRole("button", { name: FOCUS_COPY["controls.nextLongBreak"] }),
    );
    expect(advanceCycle).toHaveBeenCalledTimes(1);
  });

  it("EC-0007 e RNF-0002: diálogo de encerramento antecipado não contém nenhum termo punitivo", async () => {
    const confirmEnd = jest.fn().mockResolvedValue(undefined);
    const active = createFocusSessionFixture({ status: "paused" });

    await renderScreen(
      propsWith({
        activeSession: active,
        confirmEndVisible: true,
        confirmEnd,
      }),
    );

    expect(screen.getByText(FOCUS_COPY["confirmEnd.title"])).toBeTruthy();
    const serialized = JSON.stringify(screen.toJSON()).toLocaleLowerCase("pt-BR");
    for (const term of PUNITIVE_TERMS) {
      expect(serialized).not.toContain(term);
    }

    await fireEvent.press(screen.getByRole("button", { name: FOCUS_COPY["confirmEnd.confirm"] }));
    expect(confirmEnd).toHaveBeenCalledTimes(1);
  });
});
