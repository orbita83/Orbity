import type { FocusDuration } from "@/model/entities/focus-duration";
import type { Progress } from "@/model/entities/progress";
import type { StreakSnapshot } from "@/model/entities/streak";

export type FocusAvailability = {
  canStart: boolean;
  reason: "no-targets" | null;
  durations: readonly FocusDuration[];
  defaultDuration: FocusDuration;
};

export type HomeSummary = {
  streak: StreakSnapshot;
  progress: Progress;
  focus: FocusAvailability;
};
