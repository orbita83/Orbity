import { LocalDate } from "@/model/entities/localDate";
import { createStreakStar, type Star } from "@/model/entities/star";
import type { IStarDataSource } from "@/model/datasources/iStarDataSource";

export type StarDataSourceHarness = {
  dataSource: IStarDataSource;
  reopen?: () => Promise<IStarDataSource>;
  cleanup?: () => void;
};

/** Suíte de contrato que toda implementação de IStarDataSource deve cumprir (issue #214). */
export function describeStarDataSourceContract(
  name: string,
  factory: () => Promise<StarDataSourceHarness>,
): void {
  describe(`${name} (contrato IStarDataSource)`, () => {
    let harness: StarDataSourceHarness;

    beforeEach(async () => {
      harness = await factory();
    });

    afterEach(() => {
      harness.cleanup?.();
    });

    it("começa sem estrelas registradas", async () => {
      expect(await harness.dataSource.listAll()).toEqual([]);
      expect(await harness.dataSource.countAll()).toBe(0);
    });

    it("RF-0017 CA-04: conceder a mesma estrela duas vezes é idempotente por eventKey", async () => {
      const day = LocalDate.parse("2026-11-16");
      const first = createStreakStar(day, "2026-11-16T08:00:00-03:00");
      const duplicate = createStreakStar(day, "2026-11-16T21:00:00-03:00", "other-id");

      expect(await harness.dataSource.awardIfNew(first)).toBe(true);
      expect(await harness.dataSource.awardIfNew(duplicate)).toBe(false);

      expect(await harness.dataSource.countAll()).toBe(1);
      expect(await harness.dataSource.listAll()).toEqual([first]);
    });

    it("lista em ordem cronológica crescente e aceita estrelas de sequência e conquista", async () => {
      const s2 = createStreakStar(LocalDate.parse("2026-11-17"), "2026-11-17T09:00:00-03:00");
      const s1 = createStreakStar(LocalDate.parse("2026-11-16"), "2026-11-16T09:00:00-03:00");
      const achievementStar: Star = {
        id: "star-ach-1",
        sourceType: "achievement",
        eventKey: "achievement:first-step",
        earnedDate: LocalDate.parse("2026-11-16"),
        createdAt: "2026-11-16T10:00:00-03:00",
      };

      await harness.dataSource.awardIfNew(s2);
      await harness.dataSource.awardIfNew(achievementStar);
      await harness.dataSource.awardIfNew(s1);

      expect((await harness.dataSource.listAll()).map((star) => star.eventKey)).toEqual([
        "streak:2026-11-16",
        "achievement:first-step",
        "streak:2026-11-17",
      ]);
      expect(await harness.dataSource.countAll()).toBe(3);
    });

    it("RF-0017 CA-03: as estrelas permanecem salvas depois de fechar e reabrir", async () => {
      if (!harness.reopen) return;
      const star = createStreakStar(LocalDate.parse("2026-11-16"), "2026-11-16T08:00:00-03:00");
      await harness.dataSource.awardIfNew(star);

      const reopened = await harness.reopen();
      expect(await reopened.countAll()).toBe(1);
      expect(await reopened.listAll()).toEqual([star]);
    });
  });
}
