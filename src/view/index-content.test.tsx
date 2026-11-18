import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LocalDate } from "@/model/entities/localDate";
import type { HomeSummary } from "@/model/entities/homeSummary";
import { HOME_COPY, PUNITIVE_TERMS } from "@/view/homeCopy";
import { HomeScreenContent, type HomeScreenContentProps } from "@/view/index-content";

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
  sheetStage: "stage1_1",
  reduceMotion: true,
  onRetry: jest.fn(),
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
    // O convite à jornada não aparece no planeta (protótipo), mas segue no nome acessível.
    expect(screen.getByLabelText(`0 dias de sequência. ${HOME_COPY["streak.empty"]}`)).toBeTruthy();
    expect(screen.getByText("0/0")).toBeTruthy();

    const start = screen.getByRole("button", { name: HOME_COPY["focus.start"] });
    expect(start.props.accessibilityState.disabled).toBe(true);
    expect(start.props.accessibilityHint).toBe(HOME_COPY["focus.blocked"]);
    expect(screen.getByText(HOME_COPY["focus.blocked"])).toBeTruthy();
    expect(screen.getByText(HOME_COPY["achievements.title"])).toBeTruthy();
  });

  it("D23: o cabeçalho mostra a marca e o botão de Configurações, ainda sem ação", async () => {
    await renderContent(propsWith());

    expect(screen.getByRole("header", { name: HOME_COPY.brand })).toBeTruthy();
    const settings = screen.getByRole("button", { name: HOME_COPY.settings });
    expect(settings.props.accessibilityState.disabled).toBe(true);
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

  describe("arraste vertical no cenário", () => {
    // Evento mínimo do sistema de responder: um toque que foi de `fromY` para `toY` em `timestamp`.
    const touchEvent = (fromY: number, toY: number, timestamp: number) => ({
      nativeEvent: { touches: [{}] },
      touchHistory: {
        numberActiveTouches: 1,
        indexOfSingleActiveTouch: 0,
        mostRecentTimeStamp: timestamp,
        touchBank: [
          {
            touchActive: true,
            startPageX: 200,
            startPageY: fromY,
            previousPageX: 200,
            previousPageY: fromY,
            currentPageX: 200,
            currentPageY: toY,
            startTimeStamp: 1,
            previousTimeStamp: timestamp - 1,
            currentTimeStamp: timestamp,
          },
        ],
      },
    });

    // Segue a ordem do sistema de responder. O mesmo elemento que reivindica o toque precisa
    // receber a soltura (antes, um Pressable sobrescrevia esses handlers e o arraste se perdia).
    const swipe = (fromY: number, toY: number) => {
      const hero = screen.getByTestId("home-hero");
      const start = touchEvent(fromY, fromY, 1);
      hero.props.onStartShouldSetResponderCapture(start);
      expect(hero.props.onStartShouldSetResponder(start)).toBe(true);
      hero.props.onResponderGrant(start);
      if (toY !== fromY) hero.props.onResponderMove(touchEvent(fromY, toY, 2));
      hero.props.onResponderRelease(touchEvent(toY, toY, 3));
    };

    it("tocar no planeta abre um estágio só", async () => {
      const onExpandSheet = jest.fn();
      await renderContent(propsWith({ sheetStage: "collapsed", onExpandSheet }));
      swipe(500, 500);
      expect(onExpandSheet).toHaveBeenCalledTimes(1);
    });

    it("um arraste curto e indeciso não muda o painel", async () => {
      const onExpandSheet = jest.fn();
      const onReduceSheet = jest.fn();
      await renderContent(propsWith({ sheetStage: "stage1_1", onExpandSheet, onReduceSheet }));
      swipe(500, 490);
      expect(onExpandSheet).not.toHaveBeenCalled();
      expect(onReduceSheet).not.toHaveBeenCalled();
    });

    it("arrastar para cima abre o painel", async () => {
      const onExpandSheet = jest.fn();
      await renderContent(propsWith({ sheetStage: "collapsed", onExpandSheet }));
      swipe(500, 400);
      expect(onExpandSheet).toHaveBeenCalledTimes(1);
    });

    it("arrastar para baixo reduz o painel", async () => {
      const onReduceSheet = jest.fn();
      const onExpandSheet = jest.fn();
      await renderContent(propsWith({ sheetStage: "stage1_1", onReduceSheet, onExpandSheet }));
      swipe(400, 500);
      expect(onReduceSheet).toHaveBeenCalledTimes(1);
      expect(onExpandSheet).not.toHaveBeenCalled();
    });
  });

  it("RNF-0002: nenhum texto na tela tem termo punitivo", async () => {
    await renderContent(propsWith());
    const text = allText().toLocaleLowerCase("pt-BR");
    for (const term of PUNITIVE_TERMS) expect(text).not.toContain(term);
  });
});
