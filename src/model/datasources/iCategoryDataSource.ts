import type { Category } from "@/model/entities/category";

/**
 * Contrato de persistência das categorias de estudo (categorias.md, issue #212).
 * A chave de nome (`nameKey`) é calculada pelo caso de uso; o DataSource só garante que ela é única.
 */
export interface ICategoryDataSource {
  /** Lista as categorias, as padrão primeiro e depois as criadas, por criação (RN-0010). */
  listAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  /** Procura a categoria que já usa esse nome comparável, se houver (RN-0008). */
  findByNameKey(nameKey: string): Promise<Category | null>;
  create(category: Category, nameKey: string): Promise<void>;
  /** `nameKey` é `null` enquanto a categoria padrão ainda não tem nome próprio. */
  update(category: Category, nameKey: string | null): Promise<void>;
  /**
   * Exclui a categoria e, de forma atômica, deixa as tarefas dela sem categoria e devolve ao ícone
   * geral as rotinas dela, inclusive as já excluídas (RN-0009). Id inexistente não gera erro.
   */
  delete(id: string, changedAt: string): Promise<void>;
}
