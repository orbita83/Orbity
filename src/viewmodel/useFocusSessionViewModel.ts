import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, BackHandler, Platform } from "react-native";
import { container, resolveUseCase } from "@/di/container";
import {
  DEFAULT_FOCUS_DURATION,
  FOCUS_DURATIONS,
  type FocusDuration,
} from "@/model/entities/focusDuration";
import {
  CYCLES_BEFORE_LONG_BREAK,
  LONG_BREAK_MINUTES,
  SHORT_BREAK_MINUTES,
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
  type FocusPhase,
  type FocusSession,
  type FocusSessionStatus,
  type FocusTarget,
  type FocusTargetKind,
  type PlanetFocusStage,
} from "@/model/entities/focusSession";
import { ValidationError } from "@/model/errors";
import type { IFocusUseCases } from "@/usecase/iFocusUseCases";

export {
  CYCLES_BEFORE_LONG_BREAK,
  DEFAULT_FOCUS_DURATION,
  FOCUS_DURATIONS,
  LONG_BREAK_MINUTES,
  SHORT_BREAK_MINUTES,
  type FocusDuration,
  type FocusPhase,
  type FocusSession,
  type FocusSessionStatus,
  type FocusTarget,
  type FocusTargetKind,
  type PlanetFocusStage,
};

export type FocusErrorKey = "error.load" | "error.action";
export type FocusNoticeKey = "notice.permission";

export type FocusAnnouncementPayload =
  | {
      readonly kind: "started";
      readonly phase: FocusPhase;
      readonly minutes: number;
      readonly targetTitle: string;
    }
  | {
      readonly kind: "paused";
      readonly remainingMinutes: number;
    }
  | {
      readonly kind: "resumed";
      readonly phase: FocusPhase;
      readonly remainingMinutes: number;
    }
  | {
      readonly kind: "one-minute-left";
      readonly phase: FocusPhase;
    }
  | {
      readonly kind: "cycle-completed";
      readonly phase: FocusPhase;
    }
  | {
      readonly kind: "ended";
      readonly focusedMinutes: number;
    };

export type FocusAnnouncement = FocusAnnouncementPayload & {
  readonly seq: number;
};

export type FocusPrototypeSeed = {
  readonly prototype: true;
  readonly targets?: readonly FocusTarget[];
  readonly activeSession?: FocusSession | null;
  readonly lastEndedSession?: FocusSession | null;
  readonly streakDays?: number;
  readonly nowIso?: string;
  readonly selectedDuration?: FocusDuration;
  readonly permissionNotice?: boolean;
};

export type FocusSessionState = {
  readonly loading: boolean;
  readonly submitting: boolean;
  readonly errorKey: FocusErrorKey | null;
  readonly validationError: string | null;
  readonly permissionNoticeKey: FocusNoticeKey | null;
  readonly targets: readonly FocusTarget[];
  readonly selectedTarget: FocusTarget | null;
  readonly selectedDuration: FocusDuration;
  readonly activeSession: FocusSession | null;
  readonly lastEndedSession: FocusSession | null;
  readonly lastEndedFocusedMinutes: number | null;
  readonly streakDays: number;
  readonly remainingMs: number;
  readonly timerLabel: string;
  readonly cycleCompleted: boolean;
  readonly phaseProgress: number;
  readonly planetFocusStage: PlanetFocusStage;
  readonly currentCycleInSet: number;
  readonly totalFocusedMinutes: number;
  readonly confirmEndVisible: boolean;
  readonly announcement: FocusAnnouncement | null;
};

export type FocusSessionActions = {
  readonly reload: () => Promise<void>;
  readonly selectTarget: (target: FocusTarget) => void;
  readonly selectDuration: (duration: FocusDuration) => void;
  readonly start: () => Promise<void>;
  readonly pause: () => Promise<void>;
  readonly resume: () => Promise<void>;
  readonly advanceCycle: () => Promise<void>;
  readonly requestEnd: () => void;
  readonly cancelEnd: () => void;
  readonly confirmEnd: () => Promise<void>;
  readonly dismissPermissionNotice: () => void;
  readonly handleBack: () => void;
};

const ONE_MINUTE_MS = 60_000;
const TICK_INTERVAL_MS = 1_000;
const PROTOTYPE_DEFAULT_NOW = "2026-11-25T14:00:00-03:00";

function isPrototypeSeed(
  source: IFocusUseCases | FocusPrototypeSeed | undefined,
): source is FocusPrototypeSeed {
  return Boolean(source && "prototype" in source && source.prototype === true);
}

/** Formata milissegundos restantes como `MM:SS` arredondando segundos parciais para cima. */
export function formatTimerMmSs(remainingMs: number): string {
  const safeMs = Math.max(0, remainingMs);
  const totalSeconds = safeMs === 0 ? 0 : Math.ceil(safeMs / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function cycleMinutes(phase: FocusPhase, focusDurationMinutes: FocusDuration): number {
  if (phase === "short-break") return SHORT_BREAK_MINUTES;
  if (phase === "long-break") return LONG_BREAK_MINUTES;
  return focusDurationMinutes;
}

function computeCycleInSet(session: FocusSession | null): number {
  if (!session) return 1;
  if (session.phase === "focus") {
    return (session.completedFocusCycles % CYCLES_BEFORE_LONG_BREAK) + 1;
  }
  const completedInSet = session.completedFocusCycles % CYCLES_BEFORE_LONG_BREAK;
  return completedInSet === 0 ? CYCLES_BEFORE_LONG_BREAK : completedInSet;
}

/**
 * Estado e ações do cronômetro pomodoro do Modo Foco (RF-0019, RN-0001, RN-0006, EC-0007, issue #217).
 * O tick de 1 segundo apenas relê `useCases.now()` para recalcular o tempo restante por `cycleEndsAt`,
 * garantindo precisão mesmo após segundo plano, bloqueio de tela ou reabertura do app.
 */
export const useFocusSessionViewModel = (
  source?: IFocusUseCases | FocusPrototypeSeed,
): [FocusSessionState, FocusSessionActions] => {
  const prototypeMode = isPrototypeSeed(source);
  const injectedUseCases = prototypeMode ? undefined : source;
  const useCases = resolveUseCase(injectedUseCases, container.useCases.focus);

  const [loading, setLoading] = useState<boolean>(() => !prototypeMode);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorKey, setErrorKey] = useState<FocusErrorKey | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [permissionNoticeKey, setPermissionNoticeKey] = useState<FocusNoticeKey | null>(() =>
    prototypeMode && source.permissionNotice ? "notice.permission" : null,
  );
  const [targets, setTargets] = useState<readonly FocusTarget[]>(() =>
    prototypeMode && source.targets ? [...source.targets] : [],
  );
  const [selectedTarget, setSelectedTarget] = useState<FocusTarget | null>(() =>
    prototypeMode && source.targets && source.targets.length > 0 ? source.targets[0] : null,
  );
  const [selectedDuration, setSelectedDuration] = useState<FocusDuration>(() =>
    prototypeMode && source.selectedDuration ? source.selectedDuration : DEFAULT_FOCUS_DURATION,
  );
  const [activeSession, setActiveSession] = useState<FocusSession | null>(() =>
    prototypeMode ? (source.activeSession ?? null) : null,
  );
  const [lastEndedSession, setLastEndedSession] = useState<FocusSession | null>(() =>
    prototypeMode ? (source.lastEndedSession ?? null) : null,
  );
  const [streakDays, setStreakDays] = useState<number>(() =>
    prototypeMode ? (source.streakDays ?? 0) : 0,
  );
  const [nowIso, setNowIso] = useState<string>(() =>
    prototypeMode ? (source.nowIso ?? PROTOTYPE_DEFAULT_NOW) : useCases.now(),
  );
  const [confirmEndVisible, setConfirmEndVisible] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<FocusAnnouncement | null>(null);

  const mountedRef = useRef<boolean>(true);
  const latestRequestRef = useRef<number>(0);
  const announcementSeqRef = useRef<number>(0);
  const announcedOneMinuteCycleRef = useRef<string | null>(null);
  const announcedCompletedCycleRef = useRef<string | null>(null);

  const emitAnnouncement = useCallback(
    (payload: FocusAnnouncementPayload): void => {
      const seq = ++announcementSeqRef.current;
      setAnnouncement({ ...payload, seq });
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleBack = useCallback(() => {
    router.navigate("/");
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    if (prototypeMode) {
      return;
    }
    const request = ++latestRequestRef.current;
    const isCurrent = () => mountedRef.current && request === latestRequestRef.current;
    try {
      const snapshot = await useCases.loadSnapshot();
      if (!isCurrent()) return;
      setTargets(snapshot.targets);
      setActiveSession(snapshot.activeSession);
      setLastEndedSession(snapshot.lastEndedSession);
      setStreakDays(snapshot.streakDays);
      setNowIso(snapshot.nowIso);
      setSelectedTarget((current) => {
        if (current && snapshot.targets.some((t) => t.kind === current.kind && t.id === current.id)) {
          return current;
        }
        return snapshot.targets[0] ?? null;
      });
      setErrorKey(null);
      setLoading(false);
    } catch {
      if (!isCurrent()) return;
      setErrorKey("error.load");
      setLoading(false);
    }
  }, [prototypeMode, useCases]);

  // Recarrega ao ganhar foco e intercepta o botão voltar do Android.
  useFocusEffect(
    useCallback(() => {
      void reload();
      if (Platform.OS !== "android") return;
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        if (confirmEndVisible) {
          setConfirmEndVisible(false);
          return true;
        }
        handleBack();
        return true;
      });
      return () => subscription.remove();
    }, [confirmEndVisible, handleBack, reload]),
  );

  // Recalcula imediatamente ao retornar do segundo plano ou desbloqueio de tela (RF-0019 CA-05).
  useEffect(() => {
    if (prototypeMode) return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void reload();
      }
    });
    return () => subscription.remove();
  }, [prototypeMode, reload]);

  const remainingMs = activeSession ? computeRemainingMs(activeSession, nowIso) : selectedDuration * ONE_MINUTE_MS;
  const cycleCompleted = activeSession ? isCycleCompleted(activeSession, nowIso) : false;

  // Tick visual de 1s apenas relendo o relógio injetado; para assim que o ciclo chega a 00:00.
  useEffect(() => {
    if (prototypeMode || !activeSession || activeSession.status !== "running" || cycleCompleted) {
      return;
    }
    const timer = setInterval(() => {
      if (mountedRef.current) {
        setNowIso(useCases.now());
      }
    }, TICK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeSession, cycleCompleted, prototypeMode, useCases]);

  // Anúncios acessíveis discretos nos marcos de 1 minuto restante e fim do ciclo (nunca a cada segundo).
  useEffect(() => {
    if (!activeSession || activeSession.status !== "running") {
      return;
    }
    const cycleKey = `${activeSession.id}:${activeSession.cycleStartedAt}`;
    if (remainingMs === 0 && announcedCompletedCycleRef.current !== cycleKey) {
      announcedCompletedCycleRef.current = cycleKey;
      emitAnnouncement({ kind: "cycle-completed", phase: activeSession.phase });
      return;
    }
    if (
      activeSession.cycleDurationMs > ONE_MINUTE_MS &&
      remainingMs > 0 &&
      remainingMs <= ONE_MINUTE_MS &&
      announcedOneMinuteCycleRef.current !== cycleKey
    ) {
      announcedOneMinuteCycleRef.current = cycleKey;
      emitAnnouncement({ kind: "one-minute-left", phase: activeSession.phase });
    }
  }, [activeSession, emitAnnouncement, remainingMs]);

  const selectTarget = useCallback((target: FocusTarget) => {
    setSelectedTarget(target);
    setValidationError(null);
  }, []);

  const selectDuration = useCallback((duration: FocusDuration) => {
    setSelectedDuration(duration);
    setValidationError(null);
  }, []);

  const dismissPermissionNotice = useCallback(() => {
    setPermissionNoticeKey(null);
  }, []);

  const start = useCallback(async (): Promise<void> => {
    if (submitting) return;
    setValidationError(null);
    setErrorKey(null);

    if (prototypeMode) {
      if (!selectedTarget) return;
      const created = createInitialFocusSession({
        id: `proto-${Date.now()}`,
        target: selectedTarget,
        focusDurationMinutes: selectedDuration,
        nowIso,
      });
      setActiveSession(created);
      emitAnnouncement({
        kind: "started",
        phase: created.phase,
        minutes: selectedDuration,
        targetTitle: created.targetTitle,
      });
      return;
    }

    setSubmitting(true);
    try {
      const created = await useCases.startSession({
        targetKind: selectedTarget?.kind ?? "standalone-task",
        targetId: selectedTarget?.id ?? "",
        durationMinutes: selectedDuration,
      });
      const permission = await useCases.ensureNotificationPermission();
      if (!mountedRef.current) return;
      setNowIso(useCases.now());
      setActiveSession(created);
      setPermissionNoticeKey(permission === "granted" ? null : "notice.permission");
      setSubmitting(false);
      emitAnnouncement({
        kind: "started",
        phase: created.phase,
        minutes: created.focusDurationMinutes,
        targetTitle: created.targetTitle,
      });
    } catch (caught: unknown) {
      if (!mountedRef.current) return;
      setSubmitting(false);
      if (caught instanceof ValidationError) {
        setValidationError(caught.message);
      } else {
        setErrorKey("error.action");
      }
    }
  }, [emitAnnouncement, nowIso, prototypeMode, selectedDuration, selectedTarget, submitting, useCases]);

  const pause = useCallback(async (): Promise<void> => {
    if (submitting || !activeSession) return;
    if (prototypeMode) {
      const paused = pauseFocusSession(activeSession, nowIso);
      setActiveSession(paused);
      emitAnnouncement({
        kind: "paused",
        remainingMinutes: Math.max(1, Math.ceil(computeRemainingMs(paused, nowIso) / ONE_MINUTE_MS)),
      });
      return;
    }
    setSubmitting(true);
    setErrorKey(null);
    try {
      const paused = await useCases.pauseSession();
      if (!mountedRef.current) return;
      const currentNow = useCases.now();
      setNowIso(currentNow);
      setActiveSession(paused);
      setSubmitting(false);
      emitAnnouncement({
        kind: "paused",
        remainingMinutes: Math.max(1, Math.ceil(computeRemainingMs(paused, currentNow) / ONE_MINUTE_MS)),
      });
    } catch {
      if (!mountedRef.current) return;
      setSubmitting(false);
      setErrorKey("error.action");
    }
  }, [activeSession, emitAnnouncement, nowIso, prototypeMode, submitting, useCases]);

  const resume = useCallback(async (): Promise<void> => {
    if (submitting || !activeSession) return;
    if (prototypeMode) {
      const resumed = resumeFocusSession(activeSession, nowIso);
      setActiveSession(resumed);
      emitAnnouncement({
        kind: "resumed",
        phase: resumed.phase,
        remainingMinutes: Math.max(1, Math.ceil(computeRemainingMs(resumed, nowIso) / ONE_MINUTE_MS)),
      });
      return;
    }
    setSubmitting(true);
    setErrorKey(null);
    try {
      const resumed = await useCases.resumeSession();
      if (!mountedRef.current) return;
      const currentNow = useCases.now();
      setNowIso(currentNow);
      setActiveSession(resumed);
      setSubmitting(false);
      emitAnnouncement({
        kind: "resumed",
        phase: resumed.phase,
        remainingMinutes: Math.max(1, Math.ceil(computeRemainingMs(resumed, currentNow) / ONE_MINUTE_MS)),
      });
    } catch {
      if (!mountedRef.current) return;
      setSubmitting(false);
      setErrorKey("error.action");
    }
  }, [activeSession, emitAnnouncement, nowIso, prototypeMode, submitting, useCases]);

  const advanceCycle = useCallback(async (): Promise<void> => {
    if (submitting || !activeSession) return;
    if (prototypeMode) {
      const advanced = advanceFocusSessionPhase(activeSession, nowIso);
      setActiveSession(advanced);
      emitAnnouncement({
        kind: "started",
        phase: advanced.phase,
        minutes: cycleMinutes(advanced.phase, advanced.focusDurationMinutes),
        targetTitle: advanced.targetTitle,
      });
      return;
    }
    setSubmitting(true);
    setErrorKey(null);
    try {
      const advanced = await useCases.advanceCycle();
      if (!mountedRef.current) return;
      setNowIso(useCases.now());
      setActiveSession(advanced);
      setSubmitting(false);
      emitAnnouncement({
        kind: "started",
        phase: advanced.phase,
        minutes: cycleMinutes(advanced.phase, advanced.focusDurationMinutes),
        targetTitle: advanced.targetTitle,
      });
    } catch {
      if (!mountedRef.current) return;
      setSubmitting(false);
      setErrorKey("error.action");
    }
  }, [activeSession, emitAnnouncement, nowIso, prototypeMode, submitting, useCases]);

  const requestEnd = useCallback(() => {
    setConfirmEndVisible(true);
  }, []);

  const cancelEnd = useCallback(() => {
    setConfirmEndVisible(false);
  }, []);

  const confirmEnd = useCallback(async (): Promise<void> => {
    if (submitting) return;
    setConfirmEndVisible(false);

    if (prototypeMode) {
      if (!activeSession) return;
      const ended = endFocusSession(activeSession, nowIso);
      setActiveSession(null);
      setLastEndedSession(ended);
      emitAnnouncement({
        kind: "ended",
        focusedMinutes: computeTotalFocusedMinutes(ended, nowIso),
      });
      return;
    }

    setSubmitting(true);
    setErrorKey(null);
    try {
      const ended = await useCases.endSession();
      if (!mountedRef.current) return;
      const currentNow = useCases.now();
      setNowIso(currentNow);
      setActiveSession(null);
      if (ended) {
        setLastEndedSession(ended);
        emitAnnouncement({
          kind: "ended",
          focusedMinutes: computeTotalFocusedMinutes(ended, ended.endedAt ?? currentNow),
        });
      }
      setSubmitting(false);
    } catch {
      if (!mountedRef.current) return;
      setSubmitting(false);
      setErrorKey("error.action");
    }
  }, [activeSession, emitAnnouncement, nowIso, prototypeMode, submitting, useCases]);

  const phaseProgress = activeSession ? computePhaseProgress(activeSession, nowIso) : 0;
  const planetFocusStage = computePlanetFocusStage(activeSession, nowIso);
  const totalFocusedMinutes = activeSession ? computeTotalFocusedMinutes(activeSession, nowIso) : 0;
  const lastEndedFocusedMinutes =
    lastEndedSession && lastEndedSession.endedAt
      ? computeTotalFocusedMinutes(lastEndedSession, lastEndedSession.endedAt)
      : null;

  return [
    {
      loading,
      submitting,
      errorKey,
      validationError,
      permissionNoticeKey,
      targets,
      selectedTarget,
      selectedDuration,
      activeSession,
      lastEndedSession,
      lastEndedFocusedMinutes,
      streakDays,
      remainingMs,
      timerLabel: formatTimerMmSs(remainingMs),
      cycleCompleted,
      phaseProgress,
      planetFocusStage,
      currentCycleInSet: computeCycleInSet(activeSession),
      totalFocusedMinutes,
      confirmEndVisible,
      announcement,
    },
    {
      reload,
      selectTarget,
      selectDuration,
      start,
      pause,
      resume,
      advanceCycle,
      requestEnd,
      cancelEnd,
      confirmEnd,
      dismissPermissionNotice,
      handleBack,
    },
  ];
};
