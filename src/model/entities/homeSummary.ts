import type { FocusDuration } from "@/model/entities/focusDuration";
import type { FocusPhase, FocusSessionStatus } from "@/model/entities/focusSession";
import type { Progress } from "@/model/entities/progress";
import type { StreakSnapshot } from "@/model/entities/streak";

export type ActiveFocusSummary = {
  readonly id: string;
  readonly targetTitle: string;
  readonly phase: FocusPhase;
  readonly status: Exclude<FocusSessionStatus, "ended">;
};

export type LastFocusSessionSummary = {
  readonly targetTitle: string;
  readonly focusedMinutes: number;
  readonly completedCycles: number;
  readonly endedAt: string;
};

export type FocusAvailability = {
  canStart: boolean;
  reason: "no-targets" | null;
  durations: readonly FocusDuration[];
  defaultDuration: FocusDuration;
  activeSession?: ActiveFocusSummary | null;
  lastSession?: LastFocusSessionSummary | null;
};

export type HomeStarsSummary = {
  /** Total acumulado de estrelas na constelação (RF-0017 CA-03, RN-0003). */
  readonly total: number;
  /** Indica se a estrela de aumento de sequência de hoje já foi conquistada. */
  readonly earnedToday: boolean;
};

export type HomeSummary = {
  streak: StreakSnapshot;
  progress: Progress;
  focus: FocusAvailability;
  stars?: HomeStarsSummary;
};
