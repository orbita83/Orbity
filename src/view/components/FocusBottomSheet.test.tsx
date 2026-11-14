import { fireEvent, render, screen } from "@testing-library/react-native";
import type { FocusAvailability } from "@/model/entities/home-summary";
import { FocusBottomSheet, type FocusBottomSheetProps } from "@/view/components/FocusBottomSheet";
import { HOME_COPY } from "@/view/home-copy";

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
  selectedDuration: 15,
  onSelectDuration: jest.fn(),
  onToggleStage: jest.fn(),
  onCollapseSheet: jest.fn(),
  dragging: false,
  onScrollOffsetChange: jest.fn(),
  onHandleTouchStart: jest.fn(),
  ...overrides,
});

describe("FocusBottomSheet", () => {
  it("RF-0019: mostra as seis durações com 15 marcado", async () => {
    await render(<FocusBottomSheet {...propsWith()} />);

    const radios = screen.getAllByRole("radio");
    expect(radios.map((radio) => radio.props.accessibilityLabel)).toEqual(
      ["5", "10", "15", "20", "25", "30"].map((n) => `${n} minutos`),
    );
    expect(screen.getByRole("radio", { name: "15 minutos" }).props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText(HOME_COPY["focus.durations"]).props.accessibilityRole).toBe("radiogroup");
  });

  it("RF-0019: tocar em 20 minutos seleciona 20", async () => {
    const onSelectDuration = jest.fn();
    await render(<FocusBottomSheet {...propsWith({ onSelectDuration })} />);

    fireEvent.press(screen.getByRole("radio", { name: "20 minutos" }));
    expect(onSelectDuration).toHaveBeenCalledWith(20);
  });

  it("RN-0007: sem atividades, mostra 0/0 e nenhuma porcentagem", async () => {
    await render(<FocusBottomSheet {...propsWith()} />);

    expect(screen.getByText("0/0")).toBeTruthy();
    expect(screen.queryByText(/%/)).toBeNull();
    const bar = screen.getByRole("progressbar");
    expect(bar.props.accessibilityValue).toMatchObject({ now: 0, max: 0, text: "0 de 0 atividades concluídas" });
  });

  it("D16: o atalho de Conquistas aparece desabilitado e não navega", async () => {
    await render(<FocusBottomSheet {...propsWith()} />);

    const achievements = screen.getByRole("button", { name: HOME_COPY["achievements.label"] });
    expect(achievements.props.accessibilityState.disabled).toBe(true);
    expect(achievements.props.onPress).toBeUndefined();
    expect(screen.getByText(HOME_COPY["achievements.soon"])).toBeTruthy();
  });

  it("com alvos de foco, o botão Iniciar fica habilitado e sem aviso", async () => {
    await render(<FocusBottomSheet {...propsWith({ focus: { ...blockedFocus, canStart: true, reason: null } })} />);

    const start = screen.getByRole("button", { name: HOME_COPY["focus.start"] });
    expect(start.props.accessibilityState.disabled).toBe(false);
    expect(screen.queryByText(HOME_COPY["focus.blocked"])).toBeNull();
  });
});
