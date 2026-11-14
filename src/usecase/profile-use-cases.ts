import type { StudentProfile } from "@/model/entities/student-profile";
import { ValidationError } from "@/model/errors/domain-error";
import type { IProfileRepository } from "@/model/repositories/profile-repository";

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

  constructor(private readonly profileRepository: IProfileRepository) {}

  async getProfile(): Promise<StudentProfile> {
    return this.profileRepository.getProfile();
  }

  async updateName(name: string): Promise<StudentProfile> {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new ValidationError("O nome é obrigatório.");
    }

    if (normalizedName.length > ProfileUseCases.MAX_NAME_LENGTH) {
      throw new ValidationError("O nome deve ter no máximo 60 caracteres.");
    }

    return this.profileRepository.updateName(normalizedName);
  }
}
