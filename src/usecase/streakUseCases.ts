import type { ActivitySource } from "@/model/entities/activitySource";
import { calculateStreak, type StreakSnapshot } from "@/model/entities/streak";
import { ValidationError } from "@/model/errors";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IClockService } from "@/model/services/iClockService";
import type { IStreakUseCases } from "@/usecase/iStreakUseCases";

export class StreakUseCases implements IStreakUseCases {
  constructor(
    private readonly dailyActivity: IDailyActivityDataSource,
    private readonly clock: IClockService,
  ) {}

  async recordActivity(source: ActivitySource): Promise<void> {
    if (source.id.trim() === "") {
      throw new ValidationError("A atividade concluída precisa de um identificador.");
    }
    await this.dailyActivity.recordDay(this.clock.todayLocal(), this.clock.now());
  }

  async getStreak(): Promise<StreakSnapshot> {
    return calculateStreak(await this.dailyActivity.listDays(), this.clock.todayLocal());
  }
}
