import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AppState, type AppStateStatus } from "react-native";
import { LocalDate } from "@/model/entities/localDate";
import type { HomeSummary } from "@/model/entities/homeSummary";
import { DataSourceError, SchemaVersionError } from "@/model/errors";
import type { IFocusUseCases } from "@/usecase/iFocusUseCases";
import type { IHomeUseCases } from "@/usecase/iHomeUseCases";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { FakeDayChangeService } from "../../tests/fixtures/fakeDayChangeService";

// Navegação do Expo Router isolada: o foco é disparado pelo teste com `focusScreen()`.
const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
const mockSetOptions = jest.fn();
const mockNavigation = { setOptions: (...args: unknown[]) => mockSetOptions(...args) };
let mockParams: Record<string, string | undefined> = {};
const mockFocusCallbacks = new Set<() => void>();
jest.mock("expo-router", () => ({
  router: {
    navigate: (...args: unknown[]) => mockNavigate(...args),
    setParams: (...args: unknown[]) => mockSetParams(...args),
  },
  // Registra o efeito de foco enquanto o hook está montado; `focusScreen()` simula a tela ganhando foco.
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = jest.requireActual<typeof import("react")>("react");
    const latest = React.useRef(callback);
    latest.current = callback;
    React.useEffect(() => {
      const run = () => {
        latest.current();
      };
      mockFocusCallbacks.add(run);
      return () => {
        mockFocusCallbacks.delete(run);
      };
    }, []);
  },
  useLocalSearchParams: () => mockParams,
  useNavigation: () => mockNavigation,
}));
const focusScreen = () => mockFocusCallbacks.forEach((run) => run());

beforeEach(() => {
  mockParams = {};
  mockFocusCallbacks.clear();
});

const today = LocalDate.parse("2026-11-14");

const summaryWith = (currentDays: number, completed = 0, total = 0): HomeSummary => ({
  streak: { currentDays, lastActiveDate: currentDays > 0 ? today : null, asOf: today },
  progress: { completed, total, ratio: total === 0 ? null : completed / total },
  focus: { canStart: false, reason: "no-targets", durations: [5, 10, 15, 20, 25, 30], defaultDuration: 15 },
});

const useCasesFrom = (...results: (HomeSummary | Error)[]): IHomeUseCases & { dayChange: FakeDayChangeService } => {
  const loadHome = jest.fn<Promise<HomeSummary>, []>();
  const dayChange = new FakeDayChangeService();
  for (const result of results) {
    if (result instanceof Error) loadHome.mockRejectedValueOnce(result);
    else loadHome.mockResolvedValueOnce(result);
  }
  return {
    loadHome,
    subscribeDayChange: (listener) => dayChange.subscribe(listener),
    dayChange,
  };
};

describe("useHomeViewModel", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("começa carregando e fica pronto com o resumo", async () => {
    const useCases = useCasesFrom(summaryWith(12, 3, 30));
    const { result } = await renderHook(() => useHomeViewModel(useCases));

    await waitFor(() => expect(result.current[0].status).toBe("ready"));
    expect(result.current[0].summary?.streak.currentDays).toBe(12);
    expect(result.current[0].progressLabel).toBe("3/30");
    expect(result.current[0].error).toBeNull();
  });

  it("RN-0007: sem atividades, o rótulo do progresso é 0/0", async () => {
    const useCases = useCasesFrom(summaryWith(0));
    const { result } = await renderHook(() => useHomeViewModel(useCases));

    await waitFor(() => expect(result.current[0].status).toBe("ready"));
    expect(result.current[0].progressLabel).toBe("0/0");
  });

  it("DataSourceError: erro com nova tentativa e sem resumo", async () => {
    const useCases = useCasesFrom(new DataSourceError(), summaryWith(2));
    const { result } = await renderHook(() => useHomeViewModel(useCases));

    await waitFor(() => expect(result.current[0].status).toBe("error"));
    expect(result.current[0].error).toEqual({ messageKey: "error.persistence", retryable: true });
    expect(result.current[0].summary).toBeNull();

    await act(async () => {
      await result.current[1].retry();
    });
    expect(result.current[0].status).toBe("ready");
    expect(result.current[0].summary?.streak.currentDays).toBe(2);
  });

  it("SchemaVersionError: erro sem nova tentativa", async () => {
    const useCases = useCasesFrom(new SchemaVersionError());
    const { result } = await renderHook(() => useHomeViewModel(useCases));

    await waitFor(() => expect(result.current[0].status).toBe("error"));
    expect(result.current[0].error).toEqual({ messageKey: "error.schema", retryable: false });
  });

  it("RF-0015 CA-06, D17 e issue #210: mudança de dia recalcula sem passar por carregando", async () => {
    const useCases = useCasesFrom(summaryWith(5), summaryWith(0));
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current[0].status).toBe("ready"));

    const statuses: string[] = [];
    await act(async () => {
      useCases.dayChange.emitDayChange(LocalDate.parse("2026-11-15"));
      statuses.push(result.current[0].status);
    });

    await waitFor(() => expect(result.current[0].summary?.streak.currentDays).toBe(0));
    expect(useCases.loadHome).toHaveBeenCalledTimes(2);
    expect(statuses).not.toContain("loading");
    expect(result.current[0].status).toBe("ready");
  });

  it("remove a assinatura do serviço de mudança de dia ao desmontar", async () => {
    const useCases = useCasesFrom(summaryWith(5));
    const { result, unmount } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current[0].status).toBe("ready"));
    expect(useCases.dayChange.listenerCount).toBe(1);

    await unmount();
    expect(useCases.dayChange.listenerCount).toBe(0);
  });

  it("erro num recálculo depois de pronto mantém o valor anterior", async () => {
    const useCases = useCasesFrom(summaryWith(5), new DataSourceError());
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current[0].status).toBe("ready"));

    await act(async () => {
      useCases.dayChange.emitDayChange(LocalDate.parse("2026-11-15"));
    });

    await waitFor(() => expect(useCases.loadHome).toHaveBeenCalledTimes(2));
    expect(result.current[0].status).toBe("ready");
    expect(result.current[0].summary?.streak.currentDays).toBe(5);
  });

  it("refresh recalcula sequência e progresso ao voltar para a aba sem voltar para carregando", async () => {
    const useCases = useCasesFrom(summaryWith(0, 0, 1), summaryWith(1, 1, 1));
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current[0].status).toBe("ready"));
    expect(result.current[0].progressLabel).toBe("0/1");

    await act(async () => {
      await result.current[1].refresh();
    });

    expect(result.current[0].status).toBe("ready");
    expect(result.current[0].summary?.streak.currentDays).toBe(1);
    expect(result.current[0].progressLabel).toBe("1/1");
  });

  it("abre e fecha o painel pelos botões", async () => {
    const useCases = useCasesFrom(summaryWith(0));
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current[0].status).toBe("ready"));

    await act(async () => result.current[1].handleExpandSheet());
    expect(result.current[0].sheetStage).toBe("stage1_1");
    await act(async () => result.current[1].handleExpandSheet());
    expect(result.current[0].sheetStage).toBe("stage1_2");
    await act(async () => result.current[1].handleReduceSheet());
    expect(result.current[0].sheetStage).toBe("stage1_1");
    await act(async () => result.current[1].handleCollapseSheet());
    expect(result.current[0].sheetStage).toBe("collapsed");
  });
});

describe("useHomeViewModel (navegação)", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("recalcula a Home quando a aba ganha foco", async () => {
    const useCases = useCasesFrom(summaryWith(1), summaryWith(2));
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current[0].status).toBe("ready"));
    await act(async () => {
      focusScreen();
    });
    await waitFor(() => expect(result.current[0].summary?.streak.currentDays).toBe(2));
    expect(useCases.loadHome).toHaveBeenCalledTimes(2);
  });

  it("handleOpenFocus navega para /focus-session e toque na notificação de ciclo abre a sessão", async () => {
    let notificationHandler: (() => void) | undefined;
    const focusUseCases: IFocusUseCases = {
      now: () => "2026-11-14T10:00:00-03:00",
      loadSnapshot: jest.fn(),
      startSession: jest.fn(),
      pauseSession: jest.fn(),
      resumeSession: jest.fn(),
      advanceCycle: jest.fn(),
      endSession: jest.fn(),
      ensureNotificationPermission: jest.fn(),
      onCycleNotificationPress: (listener) => {
        notificationHandler = listener;
        return () => {
          notificationHandler = undefined;
        };
      },
    };
    const useCases = useCasesFrom(summaryWith(3, 1, 2));
    const { result, unmount } = await renderHook(() => useHomeViewModel(useCases, focusUseCases));
    await waitFor(() => expect(result.current[0].status).toBe("ready"));

    await act(async () => {
      result.current[1].handleOpenFocus();
    });
    expect(mockNavigate).toHaveBeenCalledWith("/focus-session");

    mockNavigate.mockClear();
    await act(async () => {
      notificationHandler?.();
    });
    expect(mockNavigate).toHaveBeenCalledWith("/focus-session");

    await unmount();
    expect(notificationHandler).toBeUndefined();
  });

  it("recalcula a Home ao retornar do segundo plano via AppState", async () => {
    let appStateListener: ((state: AppStateStatus) => void) | undefined;
    jest.spyOn(AppState, "addEventListener").mockImplementation((_, listener) => {
      appStateListener = listener;
      return { remove: () => undefined };
    });

    const useCases = useCasesFrom(summaryWith(1), summaryWith(4));
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current[0].status).toBe("ready"));

    await act(async () => {
      appStateListener?.("active");
    });
    await waitFor(() => expect(result.current[0].summary?.streak.currentDays).toBe(4));
  });
});
