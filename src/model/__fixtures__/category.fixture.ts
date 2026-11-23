import type { Category } from "@/model/entities/category";

const DEFAULT_CATEGORY: Category = Object.freeze({
  id: "category-1",
  name: "Física",
  icon: "science",
  isDefault: false,
  createdAt: "2026-11-15T08:00:00-03:00",
  updatedAt: "2026-11-15T08:00:00-03:00",
});

/** Cria uma categoria congelada para testes de domínio, casos de uso e infraestrutura. */
export function createCategoryFixture(overrides: Partial<Category> = {}): Category {
  return Object.freeze({ ...DEFAULT_CATEGORY, ...overrides });
}
