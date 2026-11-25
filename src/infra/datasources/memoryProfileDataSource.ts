import type { StudentIdentity } from "@/model/entities/studentProfile";
import { DataSourceError } from "@/model/errors";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";

/**
 * Identificação de quem ainda não informou o nome. Cabe à View decidir como apresentar o nome vazio.
 */
export const initialStudentIdentity: Readonly<StudentIdentity> = Object.freeze({
  id: "local-student",
  name: "",
});

/**
 * Adapter concreto em memória para a identificação do estudante.
 * Utilizado para desenvolvimento e execução antes da introdução de banco definitivo.
 */
export class MemoryProfileDataSource implements IProfileDataSource {
  private currentIdentity: StudentIdentity;

  constructor({ id, name }: StudentIdentity = initialStudentIdentity) {
    // Guarda só id e nome, mesmo que receba um objeto com mais campos.
    this.currentIdentity = { id, name };
  }

  async getProfile(): Promise<StudentIdentity> {
    try {
      return { ...this.currentIdentity };
    } catch {
      throw new DataSourceError("Não foi possível consultar os dados do perfil em memória.");
    }
  }

  async updateName(name: string): Promise<StudentIdentity> {
    try {
      this.currentIdentity = {
        ...this.currentIdentity,
        name,
      };
      return { ...this.currentIdentity };
    } catch {
      throw new DataSourceError("Não foi possível atualizar o nome do perfil em memória.");
    }
  }
}
