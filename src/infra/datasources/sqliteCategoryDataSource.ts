import type { DatabaseProvider } from "@/infra/database/databaseProvider";
import { toDataSourceError } from "@/infra/database/persistenceError";
import { isCategoryIconId, type Category } from "@/model/entities/category";
import type { ICategoryDataSource } from "@/model/datasources/iCategoryDataSource";

type CategoryRow = {
  id: string;
  name: string | null;
  icon: string;
  is_default: number;
  created_at: string;
  updated_at: string;
};

const SELECT_COLUMNS = "id, name, icon, is_default, created_at, updated_at";

/** As padrão primeiro, depois as criadas, na ordem de criação (RN-0010). Não depende de `created_at`, cujo fuso varia. */
const ORDER = "ORDER BY is_default DESC, rowid ASC";

const mapRowToCategory = (row: CategoryRow): Category =>
  Object.freeze({
    id: row.id,
    name: row.name ?? undefined,
    icon: isCategoryIconId(row.icon) ? row.icon : "tag",
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

/** Categorias de estudo no SQLite do aparelho (ADR-0001, categorias.md). */
export class SqliteCategoryDataSource implements ICategoryDataSource {
  constructor(private readonly db: DatabaseProvider) {}

  async listAll(): Promise<Category[]> {
    try {
      const executor = await this.db.get();
      const rows = await executor.all<CategoryRow>(`SELECT ${SELECT_COLUMNS} FROM categories ${ORDER}`);
      return rows.map(mapRowToCategory);
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const executor = await this.db.get();
      const rows = await executor.all<CategoryRow>(`SELECT ${SELECT_COLUMNS} FROM categories WHERE id = ?`, [id]);
      return rows[0] ? mapRowToCategory(rows[0]) : null;
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async findByNameKey(nameKey: string): Promise<Category | null> {
    try {
      const executor = await this.db.get();
      const rows = await executor.all<CategoryRow>(`SELECT ${SELECT_COLUMNS} FROM categories WHERE name_key = ?`, [
        nameKey,
      ]);
      return rows[0] ? mapRowToCategory(rows[0]) : null;
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async create(category: Category, nameKey: string): Promise<void> {
    try {
      const executor = await this.db.get();
      await executor.run(
        "INSERT INTO categories (id, name, name_key, icon, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          category.id,
          category.name ?? null,
          nameKey,
          category.icon,
          category.isDefault ? 1 : 0,
          category.createdAt,
          category.updatedAt,
        ],
      );
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async update(category: Category, nameKey: string | null): Promise<void> {
    try {
      const executor = await this.db.get();
      await executor.run("UPDATE categories SET name = ?, name_key = ?, icon = ?, updated_at = ? WHERE id = ?", [
        category.name ?? null,
        nameKey,
        category.icon,
        category.updatedAt,
        category.id,
      ]);
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async delete(id: string, changedAt: string): Promise<void> {
    try {
      const executor = await this.db.get();
      // RN-0009: as três alterações valem juntas ou não valem. As rotinas excluídas também voltam ao ícone geral.
      await executor.runInTransaction([
        { sql: "UPDATE tasks SET category = NULL, updated_at = ? WHERE category = ?", params: [changedAt, id] },
        { sql: "UPDATE routines SET icon = 'general', updated_at = ? WHERE icon = ?", params: [changedAt, id] },
        { sql: "DELETE FROM categories WHERE id = ?", params: [id] },
      ]);
    } catch (error) {
      throw toDataSourceError(error);
    }
  }
}
