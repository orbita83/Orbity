import {
  advanceFocusSessionPhase,
  computePhaseProgress,
  computePlanetFocusStage,
  computeRemainingMs,
  computeTotalFocusedMinutes,
  createInitialFocusSession,
  endFocusSession,
  isCycleCompleted,
  pauseFocusSession,
  resumeFocusSession,
} from "@/model/entities/focusSession";

describe("focusSession (domínio puro)", () => {
  const startIso = "2026-11-25T14:00:00-03:00";

  it("inicia ciclo de foco com cycleEndsAt preservando o fuso local e calcula tempo restante em segundo plano", () => {
    const session = createInitialFocusSession({
      id: "s-1",
      target: { kind: "standalone-task", id: "t-1", title: "Revisar Álgebra" },
      focusDurationMinutes: 15,
      nowIso: startIso,
    });

    expect(session.cycleEndsAt).toBe("2026-11-25T14:15:00-03:00");
    expect(computeRemainingMs(session, "2026-11-25T14:06:00-03:00")).toBe(9 * 60_000);
    expect(isCycleCompleted(session, "2026-11-25T14:14:59-03:00")).toBe(false);
    expect(isCycleCompleted(session, "2026-11-25T14:15:00-03:00")).toBe(true);
    expect(computeRemainingMs(session, "2026-11-25T14:20:00-03:00")).toBe(0);
  });

  it("pausa congelando o tempo restante e retoma recalculando cycleEndsAt a partir do novo horário", () => {
    const initial = createInitialFocusSession({
      id: "s-1",
      target: { kind: "routine", id: "r-1", title: "Rotina Matinal" },
      focusDurationMinutes: 20,
      nowIso: startIso,
    });

    // Passaram 5 min -> faltam 15 min
    const paused = pauseFocusSession(initial, "2026-11-25T14:05:00-03:00");
    expect(paused.status).toBe("paused");
    expect(paused.cycleEndsAt).toBeNull();
    expect(paused.pausedRemainingMs).toBe(15 * 60_000);
    // Mesmo 30 min depois no relógio, enquanto pausada o tempo restante não diminui
    expect(computeRemainingMs(paused, "2026-11-25T14:35:00-03:00")).toBe(15 * 60_000);

    const resumed = resumeFocusSession(paused, "2026-11-25T14:35:00-03:00");
    expect(resumed.status).toBe("running");
    expect(resumed.pausedRemainingMs).toBeNull();
    expect(resumed.cycleEndsAt).toBe("2026-11-25T14:50:00-03:00");
  });

  it("alterna 4 ciclos de foco com pausas curtas de 5 min e pausa longa de 15 min no 4º ciclo", () => {
    let session = createInitialFocusSession({
      id: "s-1",
      target: { kind: "standalone-task", id: "t-1", title: "Física" },
      focusDurationMinutes: 10,
      nowIso: "2026-11-25T14:00:00-03:00",
    });

    // Fim do foco 1 -> pausa curta (5 min)
    session = advanceFocusSessionPhase(session, "2026-11-25T14:10:00-03:00");
    expect(session.phase).toBe("short-break");
    expect(session.completedFocusCycles).toBe(1);
    expect(session.cycleEndsAt).toBe("2026-11-25T14:15:00-03:00");

    // Fim da pausa 1 -> foco 2 (10 min)
    session = advanceFocusSessionPhase(session, "2026-11-25T14:15:00-03:00");
    expect(session.phase).toBe("focus");
    expect(session.cycleEndsAt).toBe("2026-11-25T14:25:00-03:00");

    // Foco 2 -> pausa curta -> Foco 3 -> pausa curta -> Foco 4
    session = advanceFocusSessionPhase(session, "2026-11-25T14:25:00-03:00");
    expect(session.phase).toBe("short-break");
    session = advanceFocusSessionPhase(session, "2026-11-25T14:30:00-03:00");
    session = advanceFocusSessionPhase(session, "2026-11-25T14:40:00-03:00");
    expect(session.phase).toBe("short-break");
    expect(session.completedFocusCycles).toBe(3);
    session = advanceFocusSessionPhase(session, "2026-11-25T14:45:00-03:00");

    // Fim do 4º ciclo de foco -> pausa longa (15 min)
    session = advanceFocusSessionPhase(session, "2026-11-25T14:55:00-03:00");
    expect(session.phase).toBe("long-break");
    expect(session.completedFocusCycles).toBe(4);
    expect(session.cycleEndsAt).toBe("2026-11-25T15:10:00-03:00");
    expect(computeTotalFocusedMinutes(session, "2026-11-25T15:00:00-03:00")).toBe(40);
  });

  it("RN-0006 e EC-0007: evolui os estágios do planeta durante a sessão e volta a 0 ao encerrar registrando só minutos focados", () => {
    const session = createInitialFocusSession({
      id: "s-1",
      target: { kind: "standalone-task", id: "t-1", title: "Leitura" },
      focusDurationMinutes: 20,
      nowIso: startIso,
    });

    expect(computePlanetFocusStage(null, startIso)).toBe(0);
    expect(computePlanetFocusStage(session, "2026-11-25T14:01:00-03:00")).toBe(1);
    expect(computePlanetFocusStage(session, "2026-11-25T14:05:00-03:00")).toBe(2);
    expect(computePlanetFocusStage(session, "2026-11-25T14:10:00-03:00")).toBe(3);
    expect(computePlanetFocusStage(session, "2026-11-25T14:16:00-03:00")).toBe(4);
    expect(computePhaseProgress(session, "2026-11-25T14:10:00-03:00")).toBe(0.5);

    const ended = endFocusSession(session, "2026-11-25T14:07:30-03:00");
    expect(ended.status).toBe("ended");
    expect(computePlanetFocusStage(ended, "2026-11-25T14:07:30-03:00")).toBe(0);
    expect(computeTotalFocusedMinutes(ended, "2026-11-25T14:20:00-03:00")).toBe(7);
  });
});
