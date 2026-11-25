import type { Category, CategoryIconId } from "../model/entities/category";
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

/** Rótulos acessíveis em pt-BR para os 14 ícones disponíveis na escolha de categoria (issue #213). */
export const CATEGORY_ICON_LABELS: Readonly<Record<CategoryIconId, string>> = {
  mathematics: "Cálculo",
  reading: "Livro",
  languages: "Idiomas",
  science: "Ciências",
  programming: "Programação",
  music: "Música",
  tag: "Etiqueta",
  star: "Estrela",
  rocket: "Foguete",
  bolt: "Raio",
  sparkle: "Brilho",
  document: "Documento",
  assignment: "Atividade",
  shapes: "Formas",
};

/**
 * Resolve o rótulo e o símbolo de uma categoria a partir da lista carregada do DataSource,
 * com fallback para os rótulos e ícones das categorias padrão (issue #213).
 */
export function resolveCategoryDisplay(
  categoryId: string,
  categories?: readonly Pick<Category, "id" | "name" | "icon">[],
): { readonly label: string; readonly symbol: MaterialSymbolName } {
  const found = categories?.find((item) => item.id === categoryId);
  if (found) {
    return {
      label: getCategoryLabel(found.id, found.name),
      symbol: getCategorySymbol(found.icon),
    };
  }
  return {
    label: getCategoryLabel(categoryId),
    symbol: getCategorySymbol(categoryId),
  };
}

/**
 * Textos da tela Categorias (Perfil → Categorias, RF-0020, UC-0015, FL-0015, issue #213).
 * Todos os textos mantêm tom acolhedor e não punitivo (design-system/01-principios.md).
 */
export const CATEGORIES_COPY = {
  title: "Categorias",
  backLabel: "Voltar ao perfil",
  subtitle: "Organize suas matérias e temas de estudo do seu jeito.",
  new: "Nova categoria",
  loading: "Carregando suas categorias…",
  "empty.title": "Nenhuma categoria por enquanto",
  "empty.message": "Crie categorias para organizar suas tarefas e rotinas de estudo.",
  "error.load": "Não foi possível carregar suas categorias agora. Tente de novo em instantes.",
  "error.save": "Não foi possível salvar agora. Nada do que você fez antes se perdeu.",
  "error.retry": "Tentar novamente",
  "card.defaultBadge": "Padrão",
  "card.customBadge": "Personalizada",
  "card.edit": "Editar categoria {name}",
  "card.delete": "Excluir categoria {name}",
  "form.createTitle": "Nova categoria",
  "form.editTitle": "Editar categoria",
  "form.close": "Fechar formulário de categoria",
  "form.closeHint": "Fecha sem salvar",
  "form.name": "Nome da categoria",
  "form.name.placeholder": "Ex.: Física",
  "form.name.helper": "Até 24 caracteres.",
  "form.name.required": "Informe o nome da categoria.",
  "form.icon": "Ícone da categoria",
  "form.save": "Salvar categoria",
  "form.saving": "Salvando...",
  "form.cancel": "Cancelar",
  "delete.title": "Excluir a categoria {name}?",
  "delete.message":
    "As tarefas associadas ficam sem categoria e as rotinas voltam ao ícone Geral. Nenhuma tarefa ou rotina será apagada.",
  "delete.cancel": "Manter categoria",
  "delete.confirm": "Excluir categoria",
} as const;

export type CategoriesCopyKey = keyof typeof CATEGORIES_COPY;

export function formatCategoriesCopy(
  key: CategoriesCopyKey,
  values: Record<string, string | number> = {},
): string {
  return CATEGORIES_COPY[key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}
