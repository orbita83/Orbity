import type { ActivitySource } from "@/model/entities/activity-source";
import { calculateStreak, type StreakSnapshot } from "@/model/entities/streak";
import { ValidationError } from "@/model/errors/domain-error";
import type { IDailyActivityRepository } from "@/model/repositories/i-daily-activity-repository";
import type { IClockService } from "@/model/services/i-clock-service";
import type { IStreakUseCases } from "@/usecase/i-streak-use-cases";

export class StreakUseCases implements IStreakUseCases {
  constructor(
    private readonly dailyActivity: IDailyActivityRepository,
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
