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
