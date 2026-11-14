import { HOME_COPY, PUNITIVE_TERMS, formatCopy, streakUnit } from "@/view/home-copy";

describe("textos da Tela Inicial", () => {
  it("RNF-0002 e D22: nenhum texto usa termo punitivo", () => {
    for (const text of Object.values(HOME_COPY)) {
      for (const term of PUNITIVE_TERMS) {
        expect(text.toLocaleLowerCase("pt-BR")).not.toContain(term);
      }
    }
  });

  it("formata os marcadores", () => {
    expect(formatCopy("focus.duration", { n: 15 })).toBe("15 minutos");
    expect(formatCopy("progress.value", { completed: 3, total: 30 })).toBe("3 de 30 atividades concluídas");
  });

  it("usa singular só para 1 dia", () => {
    expect(streakUnit(1)).toBe("dia de sequência");
    expect(streakUnit(0)).toBe("dias de sequência");
    expect(streakUnit(12)).toBe("dias de sequência");
  });
});
