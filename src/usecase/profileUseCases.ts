import type { StudentProfile } from "@/model/entities/studentProfile";
import { ValidationError } from "@/model/errors";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { IProfileUseCases } from "@/usecase/iProfileUseCases";

const normalizeMetric = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.trunc(value)
    : 0;

const normalizeProfile = (profile: StudentProfile): StudentProfile => ({
  ...profile,
  streakDays: normalizeMetric(profile.streakDays),
  achievementsCount: normalizeMetric(profile.achievementsCount),
  studyHours: normalizeMetric(profile.studyHours),
});

/**
 * Orquestrador das regras de negócio do perfil do estudante.
 */
export class ProfileUseCases implements IProfileUseCases {
  private static readonly MAX_NAME_LENGTH = 60;

  constructor(private readonly profileDataSource: IProfileDataSource) { }

  async getProfile(): Promise<StudentProfile> {
    return normalizeProfile(await this.profileDataSource.getProfile());
  }

  async updateName(name: string): Promise<StudentProfile> {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new ValidationError("O nome é obrigatório.");
    }

    if (normalizedName.length > ProfileUseCases.MAX_NAME_LENGTH) {
      throw new ValidationError("O nome deve ter no máximo 60 caracteres.");
    }

    return normalizeProfile(await this.profileDataSource.updateName(normalizedName));
  }
}
