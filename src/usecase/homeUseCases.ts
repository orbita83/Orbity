import { DEFAULT_FOCUS_DURATION, FOCUS_DURATIONS } from "@/model/entities/focusDuration";
import type { HomeSummary } from "@/model/entities/homeSummary";
import { createProgress } from "@/model/entities/progress";
import { calculateStreak } from "@/model/entities/streak";
import type { IActivityDataSource } from "@/model/datasources/iActivityDataSource";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IClockService } from "@/model/services/iClockService";
import type { DayChangeListener, IDayChangeService } from "@/model/services/iDayChangeService";
import type { IHomeUseCases } from "@/usecase/iHomeUseCases";

/** Depende direto dos contratos do domínio, não de outros casos de uso (ARCHITECTURE.md §3.1). */
export class HomeUseCases implements IHomeUseCases {
  constructor(
    private readonly dailyActivity: IDailyActivityDataSource,
    private readonly activities: IActivityDataSource,
    private readonly clock: IClockService,
    private readonly dayChangeService?: IDayChangeService,
  ) {}

  subscribeDayChange(listener: DayChangeListener): () => void {
    return this.dayChangeService ? this.dayChangeService.subscribe(listener) : () => undefined;
  }

  async loadHome(): Promise<HomeSummary> {
    const [days, counts, hasFocusTargets] = await Promise.all([
      this.dailyActivity.listDays(),
      this.activities.getProgressCounts(this.clock.todayLocal()),
      this.activities.hasFocusTargets(),
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
