import { DEFAULT_FOCUS_DURATION, FOCUS_DURATIONS } from "@/model/entities/focus-duration";
import type { HomeSummary } from "@/model/entities/home-summary";
import { createProgress } from "@/model/entities/progress";
import { calculateStreak } from "@/model/entities/streak";
import type { IActivityCatalog } from "@/model/repositories/i-activity-catalog";
import type { IDailyActivityRepository } from "@/model/repositories/i-daily-activity-repository";
import type { IClockService } from "@/model/services/i-clock-service";
import type { IHomeUseCases } from "@/usecase/i-home-use-cases";

/** Depende direto dos contratos do domínio, não de outros casos de uso (ARCHITECTURE.md §3.1). */
export class HomeUseCases implements IHomeUseCases {
  constructor(
    private readonly dailyActivity: IDailyActivityRepository,
    private readonly activityCatalog: IActivityCatalog,
    private readonly clock: IClockService,
  ) {}

  async loadHome(): Promise<HomeSummary> {
    const [days, counts, hasFocusTargets] = await Promise.all([
      this.dailyActivity.listDays(),
      this.activityCatalog.getProgressCounts(),
      this.activityCatalog.hasFocusTargets(),
    ]);
    return {
      streak: calculateStreak(days, this.clock.todayLocal()),
      progress: createProgress(counts.completed, counts.total),
      focus: {
        canStart: hasFocusTargets,
        reason: hasFocusTargets ? null : "no-targets",
        durations: FOCUS_DURATIONS,
        defaultDuration: DEFAULT_FOCUS_DURATION,
      },
    };
  }
}
