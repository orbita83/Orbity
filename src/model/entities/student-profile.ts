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
