import { fireEvent, render, screen } from "@testing-library/react-native";
import type { FocusAvailability } from "@/model/entities/homeSummary";
import { FocusBottomSheet, type FocusBottomSheetProps } from "@/view/components/FocusBottomSheet";
import { HOME_COPY } from "@/view/homeCopy";

const blockedFocus: FocusAvailability = {
  canStart: false,
  reason: "no-targets",
  durations: [5, 10, 15, 20, 25, 30],
  defaultDuration: 15,
};

const propsWith = (overrides: Partial<FocusBottomSheetProps> = {}): FocusBottomSheetProps => ({
  stage: "stage1_1",
  progressLabel: "0/0",
  progressRatio: null,
  progressCompleted: 0,
  progressTotal: 0,
  focus: blockedFocus,
  onToggleStage: jest.fn(),
  onCollapseSheet: jest.fn(),
  dragging: false,
  onScrollOffsetChange: jest.fn(),
  onHandleTouchStart: jest.fn(),
  ...overrides,
});

describe("FocusBottomSheet", () => {
  it("D23: segue os cards do protótipo, na ordem, sem chips de duração", async () => {
    await render(<FocusBottomSheet {...propsWith()} />);

    const headers = screen.getAllByRole("header").map((node) => node.props.children);
    expect(headers).toEqual([
      HOME_COPY["focus.title"],
      HOME_COPY["progress.title"],
      HOME_COPY["achievements.title"],
      HOME_COPY["lastSession.title"],
      HOME_COPY["howItWorks.title"],
    ]);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("RN-0007: sem atividades, mostra 0/0 e nenhuma porcentagem", async () => {
    await render(<FocusBottomSheet {...propsWith()} />);

    expect(screen.getByText("0/0")).toBeTruthy();
    expect(screen.queryByText(/%/)).toBeNull();
    const bar = screen.getByRole("progressbar");
    expect(bar.props.accessibilityValue).toMatchObject({ now: 0, max: 0, text: "0 de 0 atividades concluídas" });
  });

  it("ODS 1.2: com atividades, mostra a porcentagem ao lado do contador, fora da barra", async () => {
    await render(<FocusBottomSheet {...propsWith({ progressLabel: "1/25", progressRatio: 1 / 25, progressCompleted: 1, progressTotal: 25 })} />);

    expect(screen.getByText("1/25")).toBeTruthy();
    expect(screen.getByText("4%")).toBeTruthy();
    expect(screen.getByRole("progressbar")).not.toHaveTextContent("4%");
  });

  it("#220: a largura do preenchimento acompanha a razão, de 0% a 100%", async () => {
    const withRatio = (ratio: number | null, completed: number, total: number) =>
      propsWith({ progressLabel: `${completed}/${total}`, progressRatio: ratio, progressCompleted: completed, progressTotal: total });

    await render(<FocusBottomSheet {...withRatio(0, 0, 3)} />);
    expect(screen.queryByTestId("progress-fill")).toBeNull();

    await screen.rerender(<FocusBottomSheet {...withRatio(2 / 3, 2, 3)} />);
    expect(screen.getByTestId("progress-fill")).toHaveStyle({ width: `${(2 / 3) * 100}%` });

    await screen.rerender(<FocusBottomSheet {...withRatio(1, 3, 3)} />);
    expect(screen.getByTestId("progress-fill")).toHaveStyle({ width: "100%" });
  });

  it("estado vazio: as quatro conquistas aparecem bloqueadas", async () => {
    await render(<FocusBottomSheet {...propsWith()} />);

    for (const n of [1, 2, 3, 4]) {
      expect(screen.getByLabelText(`Conquista ${n} de 4, bloqueada`)).toBeTruthy();
    }
    expect(screen.getByText(HOME_COPY["lastSession.empty"])).toBeTruthy();
  });

  it("as setas dos cards aparecem desabilitadas enquanto as telas de destino não existem", async () => {
    await render(<FocusBottomSheet {...propsWith()} />);

    for (const key of ["focus.details", "achievements.open", "lastSession.details", "howItWorks.open"] as const) {
      const chevron = screen.getByRole("button", { name: HOME_COPY[key] });
      expect(chevron.props.accessibilityState.disabled).toBe(true);
    }
  });

  it("D7: sem alvos, Iniciar foco fica desabilitado e explica o motivo", async () => {
    await render(<FocusBottomSheet {...propsWith()} />);

    const start = screen.getByRole("button", { name: HOME_COPY["focus.start"] });
    expect(start.props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText(HOME_COPY["focus.blocked"])).toBeTruthy();
  });

  it("com alvos de foco, o botão Iniciar fica habilitado e sem aviso", async () => {
    await render(<FocusBottomSheet {...propsWith({ focus: { ...blockedFocus, canStart: true, reason: null } })} />);

    const start = screen.getByRole("button", { name: HOME_COPY["focus.start"] });
    expect(start.props.accessibilityState.disabled).toBe(false);
    expect(screen.queryByText(HOME_COPY["focus.blocked"])).toBeNull();
  });

  it("RF-0017 CA-05: exibe retorno acolhedor quando a estrela do dia foi conquistada", async () => {
    await render(<FocusBottomSheet {...propsWith({ starEarnedToday: true })} />);

    expect(screen.getByText(HOME_COPY["progress.starEarnedToday"])).toBeTruthy();
  });

  it("issue #217: aciona onStartFocus, mostra Retomar foco em sessão ativa e exibe minutos reais na Última sessão", async () => {
    const onStartFocus = jest.fn();
    await render(
      <FocusBottomSheet
        {...propsWith({
          onStartFocus,
          focus: {
            ...blockedFocus,
            canStart: true,
            reason: null,
            activeSession: {
              id: "f-1",
              targetTitle: "Revisar Física",
              phase: "focus",
              status: "running",
            },
            lastSession: {
              targetTitle: "Cálculo I",
              focusedMinutes: 15,
              completedCycles: 1,
              endedAt: "2026-11-25T14:15:00-03:00",
            },
          },
        })}
      />,
    );

    expect(screen.getByText('15 min focados em "Cálculo I"')).toBeTruthy();
    const resumeBtn = screen.getByRole("button", { name: HOME_COPY["focus.resume"] });
    await fireEvent.press(resumeBtn);
    expect(onStartFocus).toHaveBeenCalledTimes(1);
  });
});
