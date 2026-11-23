import { CATEGORY_ICON_IDS } from "@/model/entities/category";
import {
  CATEGORY_ICON_SYMBOLS,
  NO_CATEGORY_SYMBOL,
  TASK_CATEGORY_LABELS,
  TASK_CATEGORY_SYMBOLS,
  getCategoryLabel,
  getCategorySymbol,
} from "@/view/categoryCopy";
import { getRoutineIconSymbol } from "@/view/routinesCopy";

describe("categoryCopy", () => {
  it("tem um símbolo para cada ícone que o estudante pode escolher", () => {
    expect(Object.keys(CATEGORY_ICON_SYMBOLS).sort()).toEqual([...CATEGORY_ICON_IDS].sort());
  });

  it("mantém, nas categorias padrão, o símbolo que elas já tinham", () => {
    for (const [id, symbol] of Object.entries(TASK_CATEGORY_SYMBOLS)) {
      expect(getCategorySymbol(id)).toBe(symbol);
    }
  });

  describe("getCategoryLabel", () => {
    it("usa o nome dado pelo estudante quando existe", () => {
      expect(getCategoryLabel("music", "Violão")).toBe("Violão");
    });

    it("usa o rótulo original da categoria padrão sem nome próprio", () => {
      expect(getCategoryLabel("music")).toBe(TASK_CATEGORY_LABELS.music);
    });

    it("não quebra com uma categoria desconhecida e sem nome", () => {
      expect(getCategoryLabel("desconhecida")).toBe("Categoria");
    });
  });

  describe("getCategorySymbol", () => {
    it("usa o símbolo de 'Sem categoria' para um ícone desconhecido", () => {
      expect(getCategorySymbol("desconhecido")).toBe(NO_CATEGORY_SYMBOL);
    });
  });

  describe("getRoutineIconSymbol", () => {
    it("mantém o símbolo do ícone geral e o das categorias", () => {
      expect(getRoutineIconSymbol("general")).toBe("track_changes");
      expect(getRoutineIconSymbol("music")).toBe("music_note");
    });

    it("mostra o ícone geral quando o ícone não é conhecido", () => {
      expect(getRoutineIconSymbol("desconhecido")).toBe("track_changes");
    });
  });
});
