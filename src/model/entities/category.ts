/**
 * Categorias de estudo como dados do domínio (categorias.md, issue #212). O domínio guarda só ids,
 * o nome que o estudante deu e o id do ícone; o rótulo das padrão e o glifo de cada ícone ficam na
 * apresentação (issue #159).
 */
export type CategoryId = string;

/** Categorias padrão, na ordem em que a migração as cria (RN-0010). Os ids vêm da versão 0.1.0. */
export const DEFAULT_CATEGORY_IDS = ["mathematics", "reading", "languages", "science", "programming", "music"] as const;
export type DefaultCategoryId = (typeof DEFAULT_CATEGORY_IDS)[number];

export function isDefaultCategoryId(value: string): value is DefaultCategoryId {
  return (DEFAULT_CATEGORY_IDS as readonly string[]).includes(value);
}

/** Ícones que o estudante pode escolher para uma categoria (categorias.md, D6). */
export const CATEGORY_ICON_IDS = [
  "mathematics",
  "reading",
  "languages",
  "science",
  "programming",
  "music",
  "tag",
  "star",
  "rocket",
  "bolt",
  "sparkle",
  "document",
  "assignment",
  "shapes",
] as const;
export type CategoryIconId = (typeof CATEGORY_ICON_IDS)[number];

export function isCategoryIconId(value: string): value is CategoryIconId {
  return (CATEGORY_ICON_IDS as readonly string[]).includes(value);
}

/** Tamanho máximo do nome depois do `trim` e de reduzir os espaços repetidos (RN-0008). */
export const CATEGORY_NAME_MAX_LENGTH = 24;

export type Category = {
  readonly id: CategoryId;
  /** Ausente numa categoria padrão ainda não renomeada: a apresentação usa o rótulo do copy (categorias.md, D2). */
  readonly name?: string;
  readonly icon: CategoryIconId;
  /** Só registra a origem: uma categoria padrão se edita e se exclui como as demais (RN-0010). */
  readonly isDefault: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateCategoryInput = {
  readonly name: string;
  readonly icon: string;
};

export type RenameCategoryInput = {
  readonly id: string;
  readonly name: string;
};

export type ChangeCategoryIconInput = {
  readonly id: string;
  readonly icon: string;
};

export type NormalizedCreateCategoryInput = {
  readonly name: string;
  /** Nome comparável (sem maiúsculas nem acentos), usado só para impedir nomes repetidos (RN-0008). */
  readonly nameKey: string;
  readonly icon: CategoryIconId;
};
