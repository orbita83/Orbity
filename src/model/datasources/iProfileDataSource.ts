import type { StudentIdentity } from "../entities/studentProfile";

/**
 * Contrato puro de domínio para a identificação do estudante (id e nome).
 * As métricas do perfil não passam por aqui: o caso de uso as calcula.
 */
export interface IProfileDataSource {
  /**
   * Obtém a identificação atual do estudante.
   */
  getProfile(): Promise<StudentIdentity>;

  /**
   * Atualiza o nome do estudante e retorna a identificação atualizada.
   *
   * @param name Novo nome do estudante já validado pelas regras de negócio.
   */
  updateName(name: string): Promise<StudentIdentity>;
}
