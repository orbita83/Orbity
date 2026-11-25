import { calculateStreak } from "@/model/entities/streak";
import type { StudentIdentity, StudentProfile } from "@/model/entities/studentProfile";
import { ValidationError } from "@/model/errors";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { IClockService } from "@/model/services/iClockService";
import type { IProfileUseCases } from "@/usecase/iProfileUseCases";

/**
 * Orquestrador das regras de negócio do perfil do estudante.
 *
 * As métricas são calculadas a cada consulta, nunca guardadas no perfil:
 * - a sequência vem do registro diário, com a mesma regra da Tela Inicial (`calculateStreak`);
 * - conquistas e horas de estudo ficam em 0 até existirem as fontes reais (#216 e #217).
 *
 * Depende direto dos contratos do domínio, não de outros casos de uso (ARCHITECTURE.md §3.1).
 */
export class ProfileUseCases implements IProfileUseCases {
  private static readonly MAX_NAME_LENGTH = 60;

  constructor(
    private readonly profileDataSource: IProfileDataSource,
    private readonly dailyActivity: IDailyActivityDataSource,
    private readonly clock: IClockService,
  ) { }

  async getProfile(): Promise<StudentProfile> {
    return this.withMetrics(await this.profileDataSource.getProfile());
  }

  async updateName(name: string): Promise<StudentProfile> {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new ValidationError("O nome é obrigatório.");
    }

    if (normalizedName.length > ProfileUseCases.MAX_NAME_LENGTH) {
      throw new ValidationError("O nome deve ter no máximo 60 caracteres.");
    }

    return this.withMetrics(await this.profileDataSource.updateName(normalizedName));
  }

  private async withMetrics({ id, name }: StudentIdentity): Promise<StudentProfile> {
    const streak = calculateStreak(await this.dailyActivity.listDays(), this.clock.todayLocal());
    return {
      id,
      name,
      streakDays: streak.currentDays,
      achievementsCount: 0,
      studyHours: 0,
    };
  }
}
