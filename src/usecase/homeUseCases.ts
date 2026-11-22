import { DEFAULT_FOCUS_DURATION, FOCUS_DURATIONS } from "@/model/entities/focusDuration";
import type { HomeSummary } from "@/model/entities/homeSummary";
import { createProgress } from "@/model/entities/progress";
import { calculateStreak } from "@/model/entities/streak";
import type { IActivityDataSource } from "@/model/datasources/iActivityDataSource";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IStarDataSource } from "@/model/datasources/iStarDataSource";
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
    private readonly stars?: IStarDataSource,
  ) {}

  subscribeDayChange(listener: DayChangeListener): () => void {
    return this.dayChangeService ? this.dayChangeService.subscribe(listener) : () => undefined;
  }

  async loadHome(): Promise<HomeSummary> {
    const today = this.clock.todayLocal();
    const [days, counts, hasFocusTargets, starList] = await Promise.all([
      this.dailyActivity.listDays(),
      this.activities.getProgressCounts(today),
      this.activities.hasFocusTargets(),
      this.stars?.listAll(),
    ]);
    const streak = calculateStreak(days, today);
    const starsSummary = starList
      ? {
          total: starList.length,
          earnedToday: starList.some((star) => star.sourceType === "streak" && star.earnedDate.equals(today)),
        }
      : {
          total: days.length,
          earnedToday: days.some((day) => day.equals(today)),
        };

    return {
      streak,
      progress: createProgress(counts.completed, counts.total),
      focus: {
        canStart: hasFocusTargets,
        reason: hasFocusTargets ? null : "no-targets",
        durations: FOCUS_DURATIONS,
        defaultDuration: DEFAULT_FOCUS_DURATION,
      },
      stars: starsSummary,
    };
  }
}
