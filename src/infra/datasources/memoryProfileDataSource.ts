import type { StudentProfile } from "@/model/entities/studentProfile";
import { DataSourceError } from "@/model/errors";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";

/**
 * Perfil de quem ainda não informou o nome: nome vazio e métricas zeradas, sem valores fictícios.
 * Cabe à View decidir como apresentar o nome vazio.
 */
export const initialStudentProfile: Readonly<StudentProfile> = Object.freeze({
  id: "local-student",
  name: "",
  streakDays: 0,
  achievementsCount: 0,
  studyHours: 0,
});

/**
 * Adapter concreto em memória para o DataSource de perfil do estudante.
 * Utilizado para desenvolvimento e execução antes da introdução de banco definitivo.
 */
export class MemoryProfileDataSource implements IProfileDataSource {
  private currentProfile: StudentProfile;

  constructor(initialProfile: StudentProfile = initialStudentProfile) {
    this.currentProfile = { ...initialProfile };
  }

  async getProfile(): Promise<StudentProfile> {
    try {
      return { ...this.currentProfile };
    } catch {
      throw new DataSourceError("Não foi possível consultar os dados do perfil em memória.");
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
      throw new DataSourceError("Não foi possível atualizar o nome do perfil em memória.");
    }
  }
}
