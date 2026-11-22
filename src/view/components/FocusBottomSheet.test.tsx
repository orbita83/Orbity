import { render, screen } from "@testing-library/react-native";
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
});
