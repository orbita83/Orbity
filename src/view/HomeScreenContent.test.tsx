import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LocalDate } from "@/model/entities/local-date";
import type { HomeSummary } from "@/model/entities/home-summary";
import { HOME_COPY, PUNITIVE_TERMS } from "@/view/home-copy";
import { HomeScreenContent, type HomeScreenContentProps } from "@/view/HomeScreenContent";

const metrics = { frame: { x: 0, y: 0, width: 390, height: 760 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } };
const today = LocalDate.parse("2026-11-14");

const emptySummary: HomeSummary = {
  streak: { currentDays: 0, lastActiveDate: null, asOf: today },
  progress: { completed: 0, total: 0, ratio: null },
  focus: { canStart: false, reason: "no-targets", durations: [5, 10, 15, 20, 25, 30], defaultDuration: 15 },
};

const propsWith = (overrides: Partial<HomeScreenContentProps> = {}): HomeScreenContentProps => ({
  status: "ready",
  error: null,
  summary: emptySummary,
  progressLabel: "0/0",
  selectedDuration: 15,
  sheetStage: "stage1_1",
  reduceMotion: true,
  onRetry: jest.fn(),
  onSelectDuration: jest.fn(),
  onCycleSheetStage: jest.fn(),
  onCollapseSheet: jest.fn(),
  onExpandSheet: jest.fn(),
  onReduceSheet: jest.fn(),
  onSetSheetStage: jest.fn(),
  ...overrides,
});

const renderContent = (props: HomeScreenContentProps) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <HomeScreenContent {...props} />
    </SafeAreaProvider>,
  );

// Inclui textos visíveis e nomes acessíveis da árvore renderizada.
const allText = () => JSON.stringify(screen.toJSON());

describe("HomeScreenContent", () => {
  it("CUJ 1: estado vazio mostra 0, o convite à jornada, 0/0 e o foco bloqueado", async () => {
    await renderContent(propsWith());

    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText(HOME_COPY["streak.empty"])).toBeTruthy();
    expect(screen.getByText("0/0")).toBeTruthy();

    const start = screen.getByRole("button", { name: HOME_COPY["focus.start"] });
    expect(start.props.accessibilityState.disabled).toBe(true);
    expect(start.props.accessibilityHint).toBe(HOME_COPY["focus.blocked"]);
    expect(screen.getByText(HOME_COPY["focus.blocked"])).toBeTruthy();
    expect(screen.getByText(HOME_COPY["achievements.soon"])).toBeTruthy();
  });

  it("CUJ 4: erro com nova tentativa mostra a mensagem e o botão, sem o número", async () => {
    const onRetry = jest.fn();
    await renderContent(
      propsWith({ status: "error", summary: null, error: { messageKey: "error.persistence", retryable: true }, onRetry }),
    );

    expect(screen.getByText(HOME_COPY["error.persistence"])).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.queryByText("0/0")).toBeNull();

    fireEvent.press(screen.getByRole("button", { name: HOME_COPY["error.retry"] }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("CUJ 4: erro de versão do banco mostra a mensagem, sem botão", async () => {
    await renderContent(
      propsWith({ status: "error", summary: null, error: { messageKey: "error.schema", retryable: false } }),
    );

    expect(screen.getByText(HOME_COPY["error.schema"])).toBeTruthy();
    expect(screen.queryByRole("button", { name: HOME_COPY["error.retry"] })).toBeNull();
  });

  it("o botão do painel alterna entre abrir e fechar", async () => {
    const view = await renderContent(propsWith({ sheetStage: "stage1_1" }));
    expect(screen.getByRole("button", { name: HOME_COPY["sheet.open"] })).toBeTruthy();

    await view.rerender(
      <SafeAreaProvider initialMetrics={metrics}>
        <HomeScreenContent {...propsWith({ sheetStage: "stage1_2" })} />
      </SafeAreaProvider>,
    );
    expect(screen.getByRole("button", { name: HOME_COPY["sheet.close"] })).toBeTruthy();
  });

  it("com o painel recolhido, o convite abre o painel", async () => {
    const onExpandSheet = jest.fn();
    await renderContent(propsWith({ sheetStage: "collapsed", onExpandSheet }));

    fireEvent.press(screen.getByRole("button", { name: HOME_COPY["sheet.open"] }));
    expect(onExpandSheet).toHaveBeenCalled();
  });

  it("RNF-0002: nenhum texto na tela tem termo punitivo", async () => {
    await renderContent(propsWith());
    const text = allText().toLocaleLowerCase("pt-BR");
    for (const term of PUNITIVE_TERMS) expect(text).not.toContain(term);
  });
});
