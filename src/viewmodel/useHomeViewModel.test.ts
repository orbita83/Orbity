import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AppState, type AppStateStatus } from "react-native";
import { LocalDate } from "@/model/entities/local-date";
import type { HomeSummary } from "@/model/entities/home-summary";
import { DataSourceError, SchemaVersionError } from "@/model/errors";
import type { IHomeUseCases } from "@/usecase/i-home-use-cases";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";

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

const useCasesFrom = (...results: (HomeSummary | Error)[]): IHomeUseCases => {
  const loadHome = jest.fn<Promise<HomeSummary>, []>();
  for (const result of results) {
    if (result instanceof Error) loadHome.mockRejectedValueOnce(result);
    else loadHome.mockResolvedValueOnce(result);
  }
  return { loadHome };
};

const captureAppStateListener = () => {
  let listener: ((state: AppStateStatus) => void) | undefined;
  jest.spyOn(AppState, "addEventListener").mockImplementation((_type, handler) => {
    listener = handler as (state: AppStateStatus) => void;
    return { remove: jest.fn() } as ReturnType<typeof AppState.addEventListener>;
  });
  return (state: AppStateStatus) => listener?.(state);
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

  it("RF-0015 CA-06 e D17: volta do segundo plano recalcula sem passar por carregando", async () => {
    const emit = captureAppStateListener();
    const useCases = useCasesFrom(summaryWith(5), summaryWith(0));
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current[0].status).toBe("ready"));

    const statuses: string[] = [];
    await act(async () => {
      emit("active");
      statuses.push(result.current[0].status);
    });

    await waitFor(() => expect(result.current[0].summary?.streak.currentDays).toBe(0));
    expect(useCases.loadHome).toHaveBeenCalledTimes(2);
    expect(statuses).not.toContain("loading");
    expect(result.current[0].status).toBe("ready");
  });

  it("ir para segundo plano não recalcula", async () => {
    const emit = captureAppStateListener();
    const useCases = useCasesFrom(summaryWith(5));
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current[0].status).toBe("ready"));

    await act(async () => {
      emit("background");
    });
    expect(useCases.loadHome).toHaveBeenCalledTimes(1);
  });

  it("erro num recálculo depois de pronto mantém o valor anterior", async () => {
    const emit = captureAppStateListener();
    const useCases = useCasesFrom(summaryWith(5), new DataSourceError());
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current[0].status).toBe("ready"));

    await act(async () => {
      emit("active");
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
});
