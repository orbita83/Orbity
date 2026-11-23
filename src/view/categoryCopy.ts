import type { CategoryIconId } from "../model/entities/category";
import type { TaskCategoryId } from "../model/entities/task";
import type { MaterialSymbolName } from "./components/MaterialSymbol";

/**
 * Rótulo e ícone de cada categoria de estudo (tarefas.md, T3). O domínio guarda só o id; a forma
 * de mostrar cada um fica aqui, na apresentação (issue #159).
 */
export const TASK_CATEGORY_LABELS: Readonly<Record<TaskCategoryId, string>> = {
  mathematics: "Matemática",
  reading: "Leitura",
  languages: "Idiomas",
  science: "Ciências",
  programming: "Programação",
  music: "Música",
};

export const TASK_CATEGORY_SYMBOLS: Readonly<Record<TaskCategoryId, MaterialSymbolName>> = {
  mathematics: "calculate",
  reading: "menu_book",
  languages: "translate",
  science: "science",
  programming: "code",
  music: "music_note",
};

/** Ícone de "Sem categoria" no formulário de tarefa. */
export const NO_CATEGORY_SYMBOL: MaterialSymbolName = "label";

/**
 * Símbolo de cada ícone que o estudante pode escolher para uma categoria (categorias.md, D6).
 * Os seis primeiros coincidem com os ids das categorias padrão.
 */
export const CATEGORY_ICON_SYMBOLS: Readonly<Record<CategoryIconId, MaterialSymbolName>> = {
  mathematics: "calculate",
  reading: "menu_book",
  languages: "translate",
  science: "science",
  programming: "code",
  music: "music_note",
  tag: "label",
  star: "star",
  rocket: "rocket_launch",
  bolt: "bolt",
  sparkle: "auto_awesome",
  document: "description",
  assignment: "assignment",
  shapes: "category",
};

/** Rótulo da categoria: o nome dado pelo estudante ou, nas padrão sem nome próprio, o rótulo original. */
export function getCategoryLabel(id: string, name?: string): string {
  return name ?? TASK_CATEGORY_LABELS[id] ?? "Categoria";
}

/** Símbolo de um ícone de categoria; um ícone desconhecido usa o de "Sem categoria", em vez de quebrar a tela. */
export function getCategorySymbol(icon: string): MaterialSymbolName {
  return (CATEGORY_ICON_SYMBOLS as Readonly<Record<string, MaterialSymbolName | undefined>>)[icon] ?? NO_CATEGORY_SYMBOL;
}
