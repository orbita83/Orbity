import type { StudentProfile } from "@/model/entities/student-profile";
import { ValidationError } from "@/model/errors/domain-error";
import type { IProfileDataSource } from "@/model/datasources/i-profile-datasource";

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
 * Contrato público dos casos de uso de perfil do estudante.
 */
export interface IProfileUseCases {
  /**
   * Consulta o perfil consolidado do estudante.
   */
  getProfile(): Promise<StudentProfile>;

  /**
   * Atualiza o nome do estudante após aplicar as validações de negócio.
   *
   * @param name Nome fornecido pelo estudante.
   * @throws {ValidationError} Caso o nome esteja vazio ou ultrapasse 60 caracteres.
   */
  updateName(name: string): Promise<StudentProfile>;
}

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
