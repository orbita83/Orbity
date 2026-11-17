import type { Routine } from "@/model/entities/routine";

const DEFAULT_ROUTINE: Routine = Object.freeze({
  id: "routine-1",
  title: "Matemática",
  description: "Minha rotina diária de estudos de matemática.",
  icon: "calculate",
  days: Object.freeze([1, 2, 3, 4, 5] as const),
  createdAt: "2026-11-15T08:00:00-03:00",
  updatedAt: "2026-11-15T08:00:00-03:00",
});

/** Cria uma rotina congelada para testes de domínio, casos de uso e infraestrutura. */
export function createRoutineFixture(overrides: Partial<Routine> = {}): Routine {
  return Object.freeze({ ...DEFAULT_ROUTINE, ...overrides });
}
