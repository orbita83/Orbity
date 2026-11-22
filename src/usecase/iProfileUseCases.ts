import type { StudentProfile } from "@/model/entities/studentProfile";

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
