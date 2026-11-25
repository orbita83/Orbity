/**
 * Entidade de domínio que representa o perfil do estudante no Orbity.
 * Não possui dependências de bibliotecas externas ou frameworks.
 */
export interface StudentProfile {
  readonly id: string;
  readonly name: string;
  readonly streakDays: number;
  readonly achievementsCount: number;
  readonly studyHours: number;
}

/**
 * Parte do perfil guardada pelo DataSource: só a identificação do estudante.
 * As métricas não são guardadas: o caso de uso as calcula a partir dos dados reais do app.
 */
export type StudentIdentity = Pick<StudentProfile, "id" | "name">;
