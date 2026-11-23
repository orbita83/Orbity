import type { FocusDuration } from "@/model/entities/focusDuration";
import type { Progress } from "@/model/entities/progress";
import type { StreakSnapshot } from "@/model/entities/streak";

export type FocusAvailability = {
  canStart: boolean;
  reason: "no-targets" | null;
  durations: readonly FocusDuration[];
  defaultDuration: FocusDuration;
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
