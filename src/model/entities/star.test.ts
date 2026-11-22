import { LocalDate } from "@/model/entities/localDate";
import { createStreakStar, streakStarEventKey } from "@/model/entities/star";

describe("Star (RF-0017, RN-0003)", () => {
  it("gera chave de evento determinística por data local para aumento de sequência", () => {
    const date = LocalDate.parse("2026-11-22");
    expect(streakStarEventKey(date)).toBe("streak:2026-11-22");
  });

  it("cria entidade Star congelada com id determinístico para aumento de sequência", () => {
    const date = LocalDate.parse("2026-11-22");
    const star = createStreakStar(date, "2026-11-22T10:00:00-03:00");

    expect(Object.isFrozen(star)).toBe(true);
    expect(star).toEqual({
      id: "star-streak-2026-11-22",
      sourceType: "streak",
      eventKey: "streak:2026-11-22",
      earnedDate: date,
      createdAt: "2026-11-22T10:00:00-03:00",
    });
  });
});
