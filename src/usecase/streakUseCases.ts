import type { ActivitySource } from "@/model/entities/activitySource";
import { createStreakStar, type Star } from "@/model/entities/star";
import { calculateStreak, type StreakSnapshot } from "@/model/entities/streak";
import { ValidationError } from "@/model/errors";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IStarDataSource } from "@/model/datasources/iStarDataSource";
import type { IClockService } from "@/model/services/iClockService";
import type { IStreakUseCases } from "@/usecase/iStreakUseCases";

export class StreakUseCases implements IStreakUseCases {
  constructor(
    private readonly dailyActivity: IDailyActivityDataSource,
    private readonly clock: IClockService,
    private readonly starDataSource?: IStarDataSource,
  ) {}

  async recordActivity(source: ActivitySource): Promise<void> {
    if (source.id.trim() === "") {
      throw new ValidationError("A atividade concluída precisa de um identificador.");
    }
    const today = this.clock.todayLocal();
    const now = this.clock.now();
    await this.dailyActivity.recordDay(today, now);
    await this.starDataSource?.awardIfNew(createStreakStar(today, now));
  }

  async getStreak(): Promise<StreakSnapshot> {
    return calculateStreak(await this.dailyActivity.listDays(), this.clock.todayLocal());
  }

  async listStars(): Promise<Star[]> {
    if (this.starDataSource) {
      return this.starDataSource.listAll();
    }
    const days = await this.dailyActivity.listDays();
    const now = this.clock.now();
    return days.map((day) => createStreakStar(day, now));
  }

  async getStarCount(): Promise<number> {
    if (this.starDataSource) {
      return this.starDataSource.countAll();
    }
    return (await this.dailyActivity.listDays()).length;
  }
}
