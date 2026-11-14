import { mockStudentProfile } from "@/model/__fixtures__/student-profile.fixture";
import type { StudentProfile } from "@/model/entities/student-profile";
import { DomainError } from "@/model/errors/domain-error";
import type { IProfileRepository } from "@/model/repositories/profile-repository";

/**
 * Adapter concreto em memória para o repositório de perfil do estudante.
 * Utilizado para desenvolvimento e execução antes da introdução de banco definitivo.
 */
export class InMemoryProfileRepository implements IProfileRepository {
  private currentProfile: StudentProfile;

  constructor(initialProfile?: StudentProfile) {
    this.currentProfile = initialProfile
      ? { ...initialProfile }
      : { ...mockStudentProfile };
  }

  async getProfile(): Promise<StudentProfile> {
    try {
      return { ...this.currentProfile };
    } catch {
      throw new DomainError(
        "Não foi possível consultar os dados do perfil em memória.",
        "PROFILE_READ_ERROR",
      );
    }
  }

  async updateName(name: string): Promise<StudentProfile> {
    try {
      this.currentProfile = {
        ...this.currentProfile,
        name,
      };
      return { ...this.currentProfile };
    } catch {
      throw new DomainError(
        "Não foi possível atualizar o nome do perfil em memória.",
        "PROFILE_WRITE_ERROR",
      );
    }
  }
}
