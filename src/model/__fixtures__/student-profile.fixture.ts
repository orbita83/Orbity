import type { StudentProfile } from "../entities/student-profile";

/**
 * Fixture padrão imutável de perfil de estudante para testes.
 */
export const mockStudentProfile: Readonly<StudentProfile> = Object.freeze({
  id: "student-1",
  name: "Alex Silva",
  streakDays: 12,
  achievementsCount: 5,
  studyHours: 42,
});

/**
 * Fábrica de fixtures de perfil de estudante com capacidade de personalização.
 */
export function createStudentProfileFixture(
  overrides?: Partial<StudentProfile>,
): StudentProfile {
  return Object.freeze({
    ...mockStudentProfile,
    ...overrides,
  });
}
