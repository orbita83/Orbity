import { CATEGORY_ICON_IDS, CATEGORY_NAME_MAX_LENGTH } from "@/model/entities/category";
import { ValidationError } from "@/model/errors";
import {
  normalizeCategoryName,
  toCategoryNameKey,
  validateCategoryIcon,
  validateCategoryName,
  validateCreateCategoryInput,
} from "@/usecase/categoryInputValidation";

describe("normalizeCategoryName", () => {
  it("tira os espaços das pontas e reduz os repetidos no meio", () => {
    expect(normalizeCategoryName("  Física   moderna \t")).toBe("Física moderna");
  });
});

describe("toCategoryNameKey", () => {
  it("ignora maiúsculas, minúsculas e acentos", () => {
    expect(toCategoryNameKey("Música")).toBe("musica");
    expect(toCategoryNameKey("  MUSICA  ")).toBe("musica");
    expect(toCategoryNameKey("Programação  Web")).toBe("programacao web");
  });

  it("não confunde nomes diferentes", () => {
    expect(toCategoryNameKey("Física")).not.toBe(toCategoryNameKey("Química"));
  });
});

describe("validateCategoryName", () => {
  it("devolve o nome normalizado, com a grafia digitada", () => {
    expect(validateCategoryName("  Física   moderna ")).toBe("Física moderna");
  });

  it.each(["", "   ", "\t\n"])("recusa nome vazio ou só com espaços (%j)", (name) => {
    expect(() => validateCategoryName(name)).toThrow(ValidationError);
    expect(() => validateCategoryName(name)).toThrow("Informe o nome da categoria.");
  });

  it("aceita exatamente o tamanho máximo e recusa um caractere a mais", () => {
    const limit = "a".repeat(CATEGORY_NAME_MAX_LENGTH);

    expect(validateCategoryName(limit)).toBe(limit);
    expect(() => validateCategoryName(`${limit}a`)).toThrow("O nome da categoria pode ter até 24 caracteres.");
  });

  it("conta o tamanho depois de normalizar os espaços", () => {
    const name = `  ${"a".repeat(CATEGORY_NAME_MAX_LENGTH - 3)}   bb  `;

    expect(validateCategoryName(name)).toHaveLength(CATEGORY_NAME_MAX_LENGTH);
  });

  it("indica o campo do nome no erro", () => {
    expect.assertions(1);
    try {
      validateCategoryName("");
    } catch (error) {
      expect((error as ValidationError).field).toBe("name");
    }
  });
});

describe("validateCategoryIcon", () => {
  it.each([...CATEGORY_ICON_IDS])("aceita o ícone %s", (icon) => {
    expect(validateCategoryIcon(icon)).toBe(icon);
  });

  it.each(["", "calculate", "desconhecido", "MUSIC"])("recusa o ícone %j", (icon) => {
    expect(() => validateCategoryIcon(icon)).toThrow("Ícone de categoria inválido.");
  });
});

describe("validateCreateCategoryInput", () => {
  it("normaliza o nome e calcula a chave de comparação", () => {
    expect(validateCreateCategoryInput({ name: "  Música  clássica ", icon: "music" })).toEqual({
      name: "Música clássica",
      nameKey: "musica classica",
      icon: "music",
    });
  });

  it("recusa ícone inválido mesmo com nome válido", () => {
    expect(() => validateCreateCategoryInput({ name: "Física", icon: "xyz" })).toThrow(ValidationError);
  });
});
