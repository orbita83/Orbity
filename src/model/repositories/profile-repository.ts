import type { StudentProfile } from "../entities/student-profile";

/**
 * Contrato puro de domínio para operações de persistência e consulta do perfil do estudante.
 */
export interface IProfileRepository {
  /**
   * Obtém o perfil atual do estudante.
   */
  getProfile(): Promise<StudentProfile>;

  /**
   * Atualiza o nome do estudante e retorna o perfil atualizado.
   *
   * @param name Novo nome do estudante já validado pelas regras de negócio.
   */
  updateName(name: string): Promise<StudentProfile>;
}
