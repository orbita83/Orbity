import {
  CATEGORY_NAME_MAX_LENGTH,
  isCategoryIconId,
  type CategoryIconId,
  type CreateCategoryInput,
  type NormalizedCreateCategoryInput,
} from "@/model/entities/category";
import { ValidationError } from "@/model/errors";

/** Tira os espaços das pontas e reduz os repetidos no meio a um só (RN-0008). */
export function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Nome comparável: sem maiúsculas, minúsculas nem acentos. Duas categorias com a mesma chave
 * têm o mesmo nome para o estudante (RN-0008).
 */
export function toCategoryNameKey(name: string): string {
  return normalizeCategoryName(name)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Valida o nome e devolve a versão normalizada, que é a que se guarda (RN-0008). */
export function validateCategoryName(name: string): string {
  const normalized = normalizeCategoryName(name);
  if (normalized.length === 0) {
    throw new ValidationError("Informe o nome da categoria.", "name");
  }
  if (normalized.length > CATEGORY_NAME_MAX_LENGTH) {
    throw new ValidationError(`O nome da categoria pode ter até ${CATEGORY_NAME_MAX_LENGTH} caracteres.`, "name");
  }
  return normalized;
}

export function validateCategoryIcon(icon: string): CategoryIconId {
  if (!isCategoryIconId(icon)) {
    throw new ValidationError("Ícone de categoria inválido.", "icon");
  }
  return icon;
}

/** Valida e normaliza a entrada de criação de categoria (RF-0020). */
export function validateCreateCategoryInput(input: CreateCategoryInput): NormalizedCreateCategoryInput {
  const name = validateCategoryName(input.name);
  const icon = validateCategoryIcon(input.icon);
  return { name, nameKey: toCategoryNameKey(name), icon };
}
