import type {
  Category,
  ChangeCategoryIconInput,
  CreateCategoryInput,
  RenameCategoryInput,
} from "@/model/entities/category";
import { ValidationError } from "@/model/errors";
import type { ICategoryDataSource } from "@/model/datasources/iCategoryDataSource";
import type { IClockService } from "@/model/services/iClockService";
import type { ICategoryUseCases } from "@/usecase/iCategoryUseCases";
import {
  toCategoryNameKey,
  validateCategoryIcon,
  validateCategoryName,
  validateCreateCategoryInput,
} from "@/usecase/categoryInputValidation";

const defaultGenerateId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `category-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const NOT_FOUND = "Categoria não encontrada.";
const DUPLICATE_NAME = "Já existe uma categoria com esse nome.";

/** Regras de aplicação do gerenciamento de categorias (categorias.md, RF-0020). */
export class CategoryUseCases implements ICategoryUseCases {
  constructor(
    private readonly categoryDataSource: ICategoryDataSource,
    private readonly clock: IClockService,
    private readonly generateId: () => string = defaultGenerateId,
  ) {}

  listCategories(): Promise<Category[]> {
    return this.categoryDataSource.listAll();
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const normalized = validateCreateCategoryInput(input);
    if (await this.categoryDataSource.findByNameKey(normalized.nameKey)) {
      throw new ValidationError(DUPLICATE_NAME, "name");
    }

    const now = this.clock.now();
    const category: Category = Object.freeze({
      id: this.generateId(),
      name: normalized.name,
      icon: normalized.icon,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    });
    await this.categoryDataSource.create(category, normalized.nameKey);
    return category;
  }

  async renameCategory(input: RenameCategoryInput): Promise<Category> {
    const name = validateCategoryName(input.name);
    const existing = await this.requireCategory(input.id);

    const nameKey = toCategoryNameKey(name);
    const sameName = await this.categoryDataSource.findByNameKey(nameKey);
    if (sameName && sameName.id !== existing.id) {
      throw new ValidationError(DUPLICATE_NAME, "name");
    }

    const updated: Category = Object.freeze({ ...existing, name, updatedAt: this.clock.now() });
    await this.categoryDataSource.update(updated, nameKey);
    return updated;
  }

  async changeCategoryIcon(input: ChangeCategoryIconInput): Promise<Category> {
    const icon = validateCategoryIcon(input.icon);
    const existing = await this.requireCategory(input.id);

    const updated: Category = Object.freeze({ ...existing, icon, updatedAt: this.clock.now() });
    await this.categoryDataSource.update(updated, existing.name ? toCategoryNameKey(existing.name) : null);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.requireCategory(id);
    await this.categoryDataSource.delete(id, this.clock.now());
  }

  private async requireCategory(id: string): Promise<Category> {
    const category = await this.categoryDataSource.findById(id);
    if (!category) {
      throw new ValidationError(NOT_FOUND);
    }
    return category;
  }
}
