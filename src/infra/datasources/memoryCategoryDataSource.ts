import { DEFAULT_CATEGORY_IDS, type Category } from "@/model/entities/category";
import type { ICategoryDataSource } from "@/model/datasources/iCategoryDataSource";
import type { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import type { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";

type StoredCategory = { readonly order: number; readonly category: Category; readonly nameKey: string | null };

/** Instante das categorias padrão na memória; só serve de valor inicial, a ordem vem do contador. */
const SEED_INSTANT = "2026-01-01T00:00:00Z";

/**
 * Mesma semântica do SQLite, em memória, já com as seis categorias padrão da migração v6.
 * Recebe os DataSources de tarefas e rotinas (opcionais) para limpar as referências na exclusão (RN-0009).
 */
export class MemoryCategoryDataSource implements ICategoryDataSource {
  private readonly items = new Map<string, StoredCategory>();
  private sequence = 0;

  constructor(
    private readonly tasks?: MemoryTaskDataSource,
    private readonly routines?: MemoryRoutineDataSource,
  ) {
    for (const id of DEFAULT_CATEGORY_IDS) {
      this.sequence += 1;
      this.items.set(id, {
        order: this.sequence,
        nameKey: null,
        category: Object.freeze({ id, icon: id, isDefault: true, createdAt: SEED_INSTANT, updatedAt: SEED_INSTANT }),
      });
    }
  }

  async listAll(): Promise<Category[]> {
    return [...this.items.values()]
      .sort((a, b) => Number(b.category.isDefault) - Number(a.category.isDefault) || a.order - b.order)
      .map((entry) => entry.category);
  }

  async findById(id: string): Promise<Category | null> {
    return this.items.get(id)?.category ?? null;
  }

  async findByNameKey(nameKey: string): Promise<Category | null> {
    for (const entry of this.items.values()) {
      if (entry.nameKey === nameKey) {
        return entry.category;
      }
    }
    return null;
  }

  async create(category: Category, nameKey: string): Promise<void> {
    this.sequence += 1;
    this.items.set(category.id, { order: this.sequence, nameKey, category: Object.freeze({ ...category }) });
  }

  async update(category: Category, nameKey: string | null): Promise<void> {
    const existing = this.items.get(category.id);
    if (!existing) {
      return;
    }
    this.items.set(category.id, { order: existing.order, nameKey, category: Object.freeze({ ...category }) });
  }

  async delete(id: string, changedAt: string): Promise<void> {
    if (!this.items.has(id)) {
      return;
    }
    this.tasks?.clearCategory(id, changedAt);
    this.routines?.resetIcon(id, changedAt);
    this.items.delete(id);
  }
}
