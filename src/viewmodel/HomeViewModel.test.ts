import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AppState, type AppStateStatus } from "react-native";
import { LocalDate } from "@/model/entities/local-date";
import type { HomeSummary } from "@/model/entities/home-summary";
import { DomainError } from "@/model/errors/domain-error";
import type { IHomeUseCases } from "@/usecase/i-home-use-cases";
import { useHomeViewModel } from "@/viewmodel/HomeViewModel";

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

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.summary?.streak.currentDays).toBe(12);
    expect(result.current.progressLabel).toBe("3/30");
    expect(result.current.error).toBeNull();
  });

  it("RN-0007: sem atividades, o rótulo do progresso é 0/0", async () => {
    const useCases = useCasesFrom(summaryWith(0));
    const { result } = await renderHook(() => useHomeViewModel(useCases));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.progressLabel).toBe("0/0");
  });

  it("PERSISTENCE_FAILURE: erro com nova tentativa e sem resumo", async () => {
    const useCases = useCasesFrom(new DomainError("PERSISTENCE_FAILURE"), summaryWith(2));
    const { result } = await renderHook(() => useHomeViewModel(useCases));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toEqual({ messageKey: "error.persistence", retryable: true });
    expect(result.current.summary).toBeNull();

    await act(async () => {
      await result.current.retry();
    });
    expect(result.current.status).toBe("ready");
    expect(result.current.summary?.streak.currentDays).toBe(2);
  });

  it("SCHEMA_VERSION_UNSUPPORTED: erro sem nova tentativa", async () => {
    const useCases = useCasesFrom(new DomainError("SCHEMA_VERSION_UNSUPPORTED"));
    const { result } = await renderHook(() => useHomeViewModel(useCases));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toEqual({ messageKey: "error.schema", retryable: false });
  });

  it("RF-0015 CA-06 e D17: volta do segundo plano recalcula sem passar por carregando", async () => {
    const emit = captureAppStateListener();
    const useCases = useCasesFrom(summaryWith(5), summaryWith(0));
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    const statuses: string[] = [];
    await act(async () => {
      emit("active");
      statuses.push(result.current.status);
    });

    await waitFor(() => expect(result.current.summary?.streak.currentDays).toBe(0));
    expect(useCases.loadHome).toHaveBeenCalledTimes(2);
    expect(statuses).not.toContain("loading");
    expect(result.current.status).toBe("ready");
  });

  it("ir para segundo plano não recalcula", async () => {
    const emit = captureAppStateListener();
    const useCases = useCasesFrom(summaryWith(5));
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => {
      emit("background");
    });
    expect(useCases.loadHome).toHaveBeenCalledTimes(1);
  });

  it("erro num recálculo depois de pronto mantém o valor anterior", async () => {
    const emit = captureAppStateListener();
    const useCases = useCasesFrom(summaryWith(5), new DomainError("PERSISTENCE_FAILURE"));
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => {
      emit("active");
    });

    await waitFor(() => expect(useCases.loadHome).toHaveBeenCalledTimes(2));
    expect(result.current.status).toBe("ready");
    expect(result.current.summary?.streak.currentDays).toBe(5);
  });

  it("abre e fecha o painel pelos botões", async () => {
    const useCases = useCasesFrom(summaryWith(0));
    const { result } = await renderHook(() => useHomeViewModel(useCases));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => result.current.handleExpandSheet());
    expect(result.current.sheetStage).toBe("stage1_1");
    await act(async () => result.current.handleExpandSheet());
    expect(result.current.sheetStage).toBe("stage1_2");
    await act(async () => result.current.handleReduceSheet());
    expect(result.current.sheetStage).toBe("stage1_1");
    await act(async () => result.current.handleCollapseSheet());
    expect(result.current.sheetStage).toBe("collapsed");
  });
});
