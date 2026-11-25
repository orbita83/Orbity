import type { FocusDuration } from "@/model/entities/focusDuration";

export type FocusTargetKind = "standalone-task" | "routine";

export type FocusTarget = {
  readonly kind: FocusTargetKind;
  readonly id: string;
  readonly title: string;
};

export type FocusPhase = "focus" | "short-break" | "long-break";

export type FocusSessionStatus = "running" | "paused" | "ended";

/** Estágios progressivos do planeta durante uma sessão ativa (RN-0006): 0 = fora de sessão; 1..4 = evolução no ciclo. */
export type PlanetFocusStage = 0 | 1 | 2 | 3 | 4;

export const SHORT_BREAK_MINUTES = 5;
export const LONG_BREAK_MINUTES = 15;
export const CYCLES_BEFORE_LONG_BREAK = 4;
export const FOCUS_CYCLE_NOTIFICATION_ID = "focus-cycle-end";

const MS_PER_MINUTE = 60_000;

export type FocusSession = {
  readonly id: string;
  readonly targetKind: FocusTargetKind;
  readonly targetId: string;
  readonly targetTitle: string;
  readonly focusDurationMinutes: FocusDuration;
  readonly phase: FocusPhase;
  readonly status: FocusSessionStatus;
  /** Quantidade de ciclos de foco inteiros já concluídos nesta sessão. */
  readonly completedFocusCycles: number;
  readonly cycleDurationMs: number;
  readonly cycleStartedAt: string;
  /** Carimbo ISO-8601 de término do ciclo quando `status === "running"`; `null` quando pausada ou encerrada. */
  readonly cycleEndsAt: string | null;
  /** Tempo restante congelado em ms quando `status === "paused"`; `null` nos demais estados. */
  readonly pausedRemainingMs: number | null;
  /** Milissegundos efetivamente focados já consolidados (ciclos anteriores ou total ao encerrar). */
  readonly accumulatedFocusMs: number;
  readonly startedAt: string;
  readonly endedAt: string | null;
  readonly updatedAt: string;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

/**
 * Soma `deltaMs` a um instante ISO-8601 preservando o deslocamento de fuso original (ex.: `-03:00` ou `Z`).
 */
export function addMillisecondsPreserveOffset(isoWithOffset: string, deltaMs: number): string {
  const baseMs = Date.parse(isoWithOffset);
  const targetMs = baseMs + deltaMs;
  const offsetMatch = /([+-])(\d{2}):(\d{2})$/.exec(isoWithOffset);

  if (!offsetMatch) {
    return new Date(targetMs).toISOString().replace(/\.\d{3}Z$/, "Z");
  }

  const sign = offsetMatch[1] === "-" ? -1 : 1;
  const offsetHours = Number(offsetMatch[2]);
  const offsetMinutes = Number(offsetMatch[3]);
  const totalOffsetMs = sign * (offsetHours * 60 + offsetMinutes) * MS_PER_MINUTE;
  const local = new Date(targetMs + totalOffsetMs);

  const yyyy = local.getUTCFullYear();
  const mm = pad2(local.getUTCMonth() + 1);
  const dd = pad2(local.getUTCDate());
  const hh = pad2(local.getUTCHours());
  const min = pad2(local.getUTCMinutes());
  const ss = pad2(local.getUTCSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${offsetMatch[1]}${offsetMatch[2]}:${offsetMatch[3]}`;
}

export function phaseDurationMs(phase: FocusPhase, focusDurationMinutes: FocusDuration): number {
  if (phase === "short-break") {
    return SHORT_BREAK_MINUTES * MS_PER_MINUTE;
  }
  if (phase === "long-break") {
    return LONG_BREAK_MINUTES * MS_PER_MINUTE;
  }
  return focusDurationMinutes * MS_PER_MINUTE;
}

export function nextPhaseAfter(currentPhase: FocusPhase, completedFocusCyclesAfterCurrent: number): FocusPhase {
  if (currentPhase !== "focus") {
    return "focus";
  }
  return completedFocusCyclesAfterCurrent > 0 &&
    completedFocusCyclesAfterCurrent % CYCLES_BEFORE_LONG_BREAK === 0
    ? "long-break"
    : "short-break";
}

/**
 * Calcula o tempo restante do ciclo atual em milissegundos a partir do relógio (`nowIso`),
 * sem depender de decrementos em memória (RF-0019 CA-05).
 */
export function computeRemainingMs(session: FocusSession, nowIso: string): number {
  if (session.status === "ended") {
    return 0;
  }
  if (session.status === "paused") {
    return Math.max(0, Math.min(session.cycleDurationMs, session.pausedRemainingMs ?? 0));
  }
  if (!session.cycleEndsAt) {
    return 0;
  }
  const diff = Date.parse(session.cycleEndsAt) - Date.parse(nowIso);
  if (Number.isNaN(diff)) {
    return 0;
  }
  return Math.max(0, Math.min(session.cycleDurationMs, diff));
}

export function isCycleCompleted(session: FocusSession, nowIso: string): boolean {
  return session.status === "running" && computeRemainingMs(session, nowIso) === 0;
}

/** Proporção concluída (`0..1`) do ciclo atual. */
export function computePhaseProgress(session: FocusSession, nowIso: string): number {
  if (session.status === "ended" || session.cycleDurationMs <= 0) {
    return 0;
  }
  const remaining = computeRemainingMs(session, nowIso);
  const elapsed = Math.max(0, Math.min(session.cycleDurationMs, session.cycleDurationMs - remaining));
  return elapsed / session.cycleDurationMs;
}

/**
 * Estágio de evolução visual do planeta durante o foco (RN-0006):
 * - `0` fora de uma sessão ativa (`null` ou `ended`, CA-03);
 * - `1` ao iniciar a sessão (`0%..24%`, CA-01);
 * - `2`, `3` e `4` conforme a sessão avança (`25%`, `50%` e `75%+`, CA-02).
 */
export function computePlanetFocusStage(session: FocusSession | null, nowIso: string): PlanetFocusStage {
  if (!session || session.status === "ended") {
    return 0;
  }
  const ratio = computePhaseProgress(session, nowIso);
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

/** Tempo decorrido apenas no ciclo atual quando ele é de foco. */
function currentFocusCycleElapsedMs(session: FocusSession, nowIso: string): number {
  if (session.phase !== "focus" || session.status === "ended") {
    return 0;
  }
  const remaining = computeRemainingMs(session, nowIso);
  return Math.max(0, Math.min(session.cycleDurationMs, session.cycleDurationMs - remaining));
}

/** Total acumulado de milissegundos efetivamente focados na sessão até `nowIso`. */
export function computeTotalFocusedMs(session: FocusSession, nowIso: string): number {
  if (session.status === "ended") {
    return session.accumulatedFocusMs;
  }
  return session.accumulatedFocusMs + currentFocusCycleElapsedMs(session, nowIso);
}

/** Minutos inteiros efetivamente focados (sem adicionar minutos fictícios, padrão F2 passo 7). */
export function computeTotalFocusedMinutes(session: FocusSession, nowIso: string): number {
  return Math.floor(computeTotalFocusedMs(session, nowIso) / MS_PER_MINUTE);
}

export function createInitialFocusSession(params: {
  readonly id: string;
  readonly target: FocusTarget;
  readonly focusDurationMinutes: FocusDuration;
  readonly nowIso: string;
}): FocusSession {
  const durationMs = phaseDurationMs("focus", params.focusDurationMinutes);
  return Object.freeze({
    id: params.id,
    targetKind: params.target.kind,
    targetId: params.target.id,
    targetTitle: params.target.title,
    focusDurationMinutes: params.focusDurationMinutes,
    phase: "focus",
    status: "running",
    completedFocusCycles: 0,
    cycleDurationMs: durationMs,
    cycleStartedAt: params.nowIso,
    cycleEndsAt: addMillisecondsPreserveOffset(params.nowIso, durationMs),
    pausedRemainingMs: null,
    accumulatedFocusMs: 0,
    startedAt: params.nowIso,
    endedAt: null,
    updatedAt: params.nowIso,
  });
}

export function pauseFocusSession(session: FocusSession, nowIso: string): FocusSession {
  if (session.status !== "running") {
    return session;
  }
  const remaining = computeRemainingMs(session, nowIso);
  return Object.freeze({
    ...session,
    status: "paused",
    cycleEndsAt: null,
    pausedRemainingMs: remaining,
    updatedAt: nowIso,
  });
}

export function resumeFocusSession(session: FocusSession, nowIso: string): FocusSession {
  if (session.status !== "paused") {
    return session;
  }
  const remaining = Math.max(0, session.pausedRemainingMs ?? session.cycleDurationMs);
  return Object.freeze({
    ...session,
    status: "running",
    cycleEndsAt: addMillisecondsPreserveOffset(nowIso, remaining),
    pausedRemainingMs: null,
    updatedAt: nowIso,
  });
}

/**
 * Conclui o ciclo atual e inicia imediatamente a próxima fase (pausa curta, pausa longa ou novo foco).
 */
export function advanceFocusSessionPhase(session: FocusSession, nowIso: string): FocusSession {
  if (session.status === "ended") {
    return session;
  }
  const elapsedFocus = currentFocusCycleElapsedMs(session, nowIso);
  const completedFocusCycles =
    session.phase === "focus" ? session.completedFocusCycles + 1 : session.completedFocusCycles;
  const nextPhase = nextPhaseAfter(session.phase, completedFocusCycles);
  const nextDurationMs = phaseDurationMs(nextPhase, session.focusDurationMinutes);

  return Object.freeze({
    ...session,
    phase: nextPhase,
    status: "running",
    completedFocusCycles,
    cycleDurationMs: nextDurationMs,
    cycleStartedAt: nowIso,
    cycleEndsAt: addMillisecondsPreserveOffset(nowIso, nextDurationMs),
    pausedRemainingMs: null,
    accumulatedFocusMs: session.accumulatedFocusMs + elapsedFocus,
    updatedAt: nowIso,
  });
}

/**
 * Encerra a sessão consolidando apenas os milissegundos efetivamente focados até `nowIso` (EC-0007).
 */
export function endFocusSession(session: FocusSession, nowIso: string): FocusSession {
  if (session.status === "ended") {
    return session;
  }
  const totalFocusedMs = computeTotalFocusedMs(session, nowIso);
  return Object.freeze({
    ...session,
    status: "ended",
    cycleEndsAt: null,
    pausedRemainingMs: null,
    accumulatedFocusMs: totalFocusedMs,
    endedAt: nowIso,
    updatedAt: nowIso,
  });
}
