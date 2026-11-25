import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AppState, type AppStateStatus } from "react-native";
import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { MemoryFocusSessionDataSource } from "@/infra/datasources/memoryFocusSessionDataSource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { TaskActivityDataSource } from "@/infra/datasources/taskActivityDataSource";
import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { LocalDate } from "@/model/entities/localDate";
import { DataSourceError } from "@/model/errors";
import type { IClockService } from "@/model/services/iClockService";
import { FocusUseCases } from "@/usecase/focusUseCases";
import type { IFocusUseCases } from "@/usecase/iFocusUseCases";
import {
  formatTimerMmSs,
  useFocusSessionViewModel,
} from "@/viewmodel/useFocusSessionViewModel";
import { FakeNotificationService } from "../../tests/fixtures/fakeNotificationService";

const mockNavigate = jest.fn();
const mockFocusCallbacks = new Set<() => void>();

jest.mock("expo-router", () => ({
  router: {
    navigate: (...args: unknown[]) => mockNavigate(...args),
  },
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = jest.requireActual<typeof import("react")>("react");
    const latest = React.useRef(callback);
    latest.current = callback;
    React.useEffect(() => {
      const cleanup = latest.current();
      const run = () => {
        latest.current();
      };
      mockFocusCallbacks.add(run);
      return () => {
        mockFocusCallbacks.delete(run);
        if (typeof cleanup === "function") cleanup();
      };
    }, []);
  },
}));

describe("useFocusSessionViewModel (issue #217)", () => {
  let appStateListeners: Set<(state: AppStateStatus) => void>;

  beforeEach(() => {
    mockNavigate.mockReset();
    mockFocusCallbacks.clear();
    appStateListeners = new Set();
    jest.spyOn(AppState, "addEventListener").mockImplementation((_, handler) => {
      appStateListeners.add(handler);
      return {
        remove: () => {
          appStateListeners.delete(handler);
        },
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createHarness = (permission: "granted" | "denied" = "granted") => {
    let nowIso = "2026-11-25T14:00:00-03:00";
    const clock: IClockService = {
      now: () => nowIso,
      todayLocal: () => LocalDate.parse(nowIso.slice(0, 10)),
    };
    const tasks = new MemoryTaskDataSource();
    const routines = new MemoryRoutineDataSource(tasks);
    const focusSessions = new MemoryFocusSessionDataSource();
    const dailyActivity = new MemoryDailyActivityDataSource();
    const activities = new TaskActivityDataSource(tasks, routines);
    const notifications = new FakeNotificationService(permission, permission);
    let seq = 0;
    const useCases = new FocusUseCases(
      focusSessions,
      activities,
      clock,
      notifications,
      () => `focus-${++seq}`,
      dailyActivity,
    );

    return {
      useCases,
      tasks,
      routines,
      dailyActivity,
      focusSessions,
      notifications,
      setNow: (next: string) => {
        nowIso = next;
      },
      emitAppState: (state: AppStateStatus) => {
        appStateListeners.forEach((listener) => listener(state));
      },
    };
  };

  it("formatTimerMmSs formata MM:SS arredondando segundos parciais para cima", () => {
    expect(formatTimerMmSs(15 * 60_000)).toBe("15:00");
    expect(formatTimerMmSs(59_100)).toBe("01:00");
    expect(formatTimerMmSs(59_000)).toBe("00:59");
    expect(formatTimerMmSs(0)).toBe("00:00");
  });

  it("inicia com estado limpo durante loading e carrega alvos, duração padrão 15 min e sequência", async () => {
    const { useCases, tasks, routines, dailyActivity } = createHarness();
    await tasks.create(createTaskFixture({ id: "t-1", title: "Revisar Álgebra" }));
    await routines.create(createRoutineFixture({ id: "r-1", title: "Rotina Matinal" }), []);
    await dailyActivity.recordDay(LocalDate.parse("2026-11-25"));

    const realLoad = useCases.loadSnapshot.bind(useCases);
    let releaseLoad!: () => void;
    const gate = new Promise<void>((resolve) => {
      releaseLoad = resolve;
    });
    jest.spyOn(useCases, "loadSnapshot").mockImplementationOnce(async () => {
      await gate;
      return realLoad();
    });

    const { result } = await renderHook(() => useFocusSessionViewModel(useCases));
    expect(result.current[0].loading).toBe(true);
    expect(result.current[0].targets).toEqual([]);

    await act(async () => {
      releaseLoad();
    });

    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0].targets).toHaveLength(2);
    expect(result.current[0].selectedTarget?.title).toBe("Revisar Álgebra");
    expect(result.current[0].selectedDuration).toBe(15);
    expect(result.current[0].timerLabel).toBe("15:00");
    expect(result.current[0].streakDays).toBe(1);
    expect(result.current[0].planetFocusStage).toBe(0);
  });

  it("inicia, pausa, retoma, recalcula ao voltar do segundo plano e evolui o planeta conforme RN-0006", async () => {
    const { useCases, tasks, setNow, emitAppState } = createHarness();
    await tasks.create(createTaskFixture({ id: "t-1", title: "Física Quântica" }));

    const { result } = await renderHook(() => useFocusSessionViewModel(useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    await act(async () => {
      result.current[1].selectDuration(20);
    });
    expect(result.current[0].timerLabel).toBe("20:00");

    await act(async () => {
      await result.current[1].start();
    });
    expect(result.current[0].activeSession?.status).toBe("running");
    expect(result.current[0].planetFocusStage).toBe(1);
    expect(result.current[0].announcement?.kind).toBe("started");

    // Simula 11 minutos em segundo plano e retorno para "active": 55% concluído -> estágio 3.
    await act(async () => {
      setNow("2026-11-25T14:11:00-03:00");
      emitAppState("active");
    });
    await waitFor(() => expect(result.current[0].timerLabel).toBe("09:00"));
    expect(result.current[0].planetFocusStage).toBe(3);
    expect(result.current[0].totalFocusedMinutes).toBe(11);

    // Pausa e avança o relógio: tempo permanece congelado em 09:00.
    await act(async () => {
      await result.current[1].pause();
    });
    expect(result.current[0].activeSession?.status).toBe("paused");
    expect(result.current[0].announcement?.kind).toBe("paused");

    await act(async () => {
      setNow("2026-11-25T14:25:00-03:00");
      emitAppState("active");
    });
    expect(result.current[0].timerLabel).toBe("09:00");

    // Retoma a partir de 14:25 -> novo término às 14:34.
    await act(async () => {
      await result.current[1].resume();
    });
    expect(result.current[0].activeSession?.status).toBe("running");
    expect(result.current[0].activeSession?.cycleEndsAt).toBe("2026-11-25T14:34:00-03:00");

    // Falta 1 minuto -> emite marco discreto "one-minute-left" e estágio 4.
    await act(async () => {
      setNow("2026-11-25T14:33:15-03:00");
      emitAppState("active");
    });
    await waitFor(() => expect(result.current[0].timerLabel).toBe("00:45"));
    expect(result.current[0].planetFocusStage).toBe(4);
    expect(result.current[0].announcement?.kind).toBe("one-minute-left");
  });

  it("avança pelos 4 ciclos de foco até a pausa longa de 15 min e encerra registrando minutos reais", async () => {
    const { useCases, tasks, setNow } = createHarness();
    await tasks.create(createTaskFixture({ id: "t-1", title: "Redação" }));

    const { result } = await renderHook(() => useFocusSessionViewModel(useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    await act(async () => {
      result.current[1].selectDuration(10);
    });
    await act(async () => {
      await result.current[1].start();
    });

    // Ciclos 1, 2 e 3 geram pausa curta (5 min); ciclo 4 gera pausa longa (15 min).
    setNow("2026-11-25T14:10:00-03:00");
    await act(async () => {
      await result.current[1].advanceCycle(); // fim foco 1 -> pausa curta
    });
    expect(result.current[0].activeSession?.phase).toBe("short-break");
    expect(result.current[0].timerLabel).toBe("05:00");

    setNow("2026-11-25T14:15:00-03:00");
    await act(async () => {
      await result.current[1].advanceCycle(); // fim pausa 1 -> foco 2
    });
    expect(result.current[0].currentCycleInSet).toBe(2);

    setNow("2026-11-25T14:25:00-03:00");
    await act(async () => {
      await result.current[1].advanceCycle(); // fim foco 2 -> pausa curta
    });
    setNow("2026-11-25T14:30:00-03:00");
    await act(async () => {
      await result.current[1].advanceCycle(); // fim pausa 2 -> foco 3
    });
    setNow("2026-11-25T14:40:00-03:00");
    await act(async () => {
      await result.current[1].advanceCycle(); // fim foco 3 -> pausa curta
    });
    setNow("2026-11-25T14:45:00-03:00");
    await act(async () => {
      await result.current[1].advanceCycle(); // fim pausa 3 -> foco 4
    });
    expect(result.current[0].currentCycleInSet).toBe(4);

    setNow("2026-11-25T14:55:00-03:00");
    await act(async () => {
      await result.current[1].advanceCycle(); // fim foco 4 -> pausa longa (15 min)!
    });
    expect(result.current[0].activeSession?.phase).toBe("long-break");
    expect(result.current[0].timerLabel).toBe("15:00");

    // Encerra a sessão com diálogo acolhedor: planeta volta ao estágio 0 e salva 40 min focados.
    await act(async () => {
      result.current[1].requestEnd();
    });
    expect(result.current[0].confirmEndVisible).toBe(true);

    await act(async () => {
      await result.current[1].confirmEnd();
    });
    expect(result.current[0].activeSession).toBeNull();
    expect(result.current[0].planetFocusStage).toBe(0);
    expect(result.current[0].lastEndedFocusedMinutes).toBe(40);
  });

  it("exibe aviso não bloqueante quando a permissão de notificações está negada (RF-0019 CA-06)", async () => {
    const { useCases, tasks } = createHarness("denied");
    await tasks.create(createTaskFixture({ id: "t-1", title: "História" }));

    const { result } = await renderHook(() => useFocusSessionViewModel(useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    await act(async () => {
      await result.current[1].start();
    });
    expect(result.current[0].activeSession?.status).toBe("running");
    expect(result.current[0].permissionNoticeKey).toBe("notice.permission");

    await act(async () => {
      result.current[1].dismissPermissionNotice();
    });
    expect(result.current[0].permissionNoticeKey).toBeNull();
  });

  it("expõe errorKey quando o carregamento inicial falha", async () => {
    const failingUseCases: IFocusUseCases = {
      now: () => "2026-11-25T14:00:00-03:00",
      loadSnapshot: jest.fn().mockRejectedValue(new DataSourceError()),
      startSession: jest.fn(),
      pauseSession: jest.fn(),
      resumeSession: jest.fn(),
      advanceCycle: jest.fn(),
      endSession: jest.fn(),
      ensureNotificationPermission: jest.fn(),
      onCycleNotificationPress: () => () => undefined,
    };

    const { result } = await renderHook(() => useFocusSessionViewModel(failingUseCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0].errorKey).toBe("error.load");
  });
});
