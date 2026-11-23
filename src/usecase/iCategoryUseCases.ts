import type {
  Category,
  ChangeCategoryIconInput,
  CreateCategoryInput,
  RenameCategoryInput,
} from "@/model/entities/category";

/** Casos de uso do gerenciamento de categorias de estudo (RF-0020, UC-0015). */
export interface ICategoryUseCases {
  /** As padrão primeiro, depois as criadas pelo estudante. */
  listCategories(): Promise<Category[]>;
  /**
   * @throws {ValidationError} Com `field: "name"` ou `"icon"` quando o nome ou o ícone são inválidos,
   * ou quando já existe uma categoria com o mesmo nome (RN-0008).
   */
  createCategory(input: CreateCategoryInput): Promise<Category>;
  /**
   * @throws {ValidationError} Quando o nome é inválido ou repetido (RN-0008) ou a categoria não existe.
   */
  renameCategory(input: RenameCategoryInput): Promise<Category>;
  /** @throws {ValidationError} Quando o ícone é inválido ou a categoria não existe. */
  changeCategoryIcon(input: ChangeCategoryIconInput): Promise<Category>;
  /**
   * Exclui a categoria. As tarefas dela ficam sem categoria e as rotinas voltam ao ícone geral,
   * sem que nenhuma seja apagada (RN-0009).
   *
   * @throws {ValidationError} Quando a categoria não existe.
   */
  deleteCategory(id: string): Promise<void>;
}
