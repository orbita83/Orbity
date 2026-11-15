import { LocalDate } from "@/model/entities/local-date";
import type { IDailyActivityRepository } from "@/model/repositories/i-daily-activity-repository";

export type DailyActivityRepositoryHarness = {
  repository: IDailyActivityRepository;
  /** Fecha e reabre o armazenamento (só para implementações que persistem). */
  reopen?: () => Promise<IDailyActivityRepository>;
  cleanup?: () => void;
};

const RECORDED_AT = "2026-11-14T10:00:00-03:00";

/** Suíte única que toda implementação de IDailyActivityRepository deve passar (D15). */
export function describeDailyActivityRepositoryContract(
  name: string,
  factory: () => Promise<DailyActivityRepositoryHarness>,
): void {
  describe(`${name} (contrato IDailyActivityRepository)`, () => {
    let harness: DailyActivityRepositoryHarness;

    beforeEach(async () => {
      harness = await factory();
    });

    afterEach(() => {
      harness.cleanup?.();
    });

    it("começa sem dias registrados", async () => {
      expect(await harness.repository.listDays()).toEqual([]);
    });

    it("RF-0015 CA-03: registrar o mesmo dia duas vezes guarda um dia só", async () => {
      const today = LocalDate.parse("2026-11-14");
      await harness.repository.recordDay(today, RECORDED_AT);
      await harness.repository.recordDay(today, "2026-11-14T22:00:00-03:00");

      const days = await harness.repository.listDays();
      expect(days.map(String)).toEqual(["2026-11-14"]);
    });

    it("lista do dia mais recente para o mais antigo", async () => {
      for (const value of ["2026-11-12", "2026-11-14", "2026-11-13"]) {
        await harness.repository.recordDay(LocalDate.parse(value), RECORDED_AT);
      }
      const days = await harness.repository.listDays();
      expect(days.map(String)).toEqual(["2026-11-14", "2026-11-13", "2026-11-12"]);
    });

    it("G3: os dias continuam depois de fechar e reabrir", async () => {
      if (!harness.reopen) {
        return;
      }
      await harness.repository.recordDay(LocalDate.parse("2026-11-14"), RECORDED_AT);
      const reopened = await harness.reopen();
      expect((await reopened.listDays()).map(String)).toEqual(["2026-11-14"]);
    });
  });
}
