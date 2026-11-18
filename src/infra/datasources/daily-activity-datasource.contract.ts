import { LocalDate } from "@/model/entities/local-date";
import type { IDailyActivityDataSource } from "@/model/datasources/i-daily-activity-datasource";

export type DailyActivityDataSourceHarness = {
  dataSource: IDailyActivityDataSource;
  /** Fecha e reabre o armazenamento (só para implementações que persistem). */
  reopen?: () => Promise<IDailyActivityDataSource>;
  cleanup?: () => void;
};

const RECORDED_AT = "2026-11-14T10:00:00-03:00";

/** Suíte única que toda implementação de IDailyActivityDataSource deve passar (D15). */
export function describeDailyActivityDataSourceContract(
  name: string,
  factory: () => Promise<DailyActivityDataSourceHarness>,
): void {
  describe(`${name} (contrato IDailyActivityDataSource)`, () => {
    let harness: DailyActivityDataSourceHarness;

    beforeEach(async () => {
      harness = await factory();
    });

    afterEach(() => {
      harness.cleanup?.();
    });

    it("começa sem dias registrados", async () => {
      expect(await harness.dataSource.listDays()).toEqual([]);
    });

    it("RF-0015 CA-03: registrar o mesmo dia duas vezes guarda um dia só", async () => {
      const today = LocalDate.parse("2026-11-14");
      await harness.dataSource.recordDay(today, RECORDED_AT);
      await harness.dataSource.recordDay(today, "2026-11-14T22:00:00-03:00");

      const days = await harness.dataSource.listDays();
      expect(days.map(String)).toEqual(["2026-11-14"]);
    });

    it("lista do dia mais recente para o mais antigo", async () => {
      for (const value of ["2026-11-12", "2026-11-14", "2026-11-13"]) {
        await harness.dataSource.recordDay(LocalDate.parse(value), RECORDED_AT);
      }
      const days = await harness.dataSource.listDays();
      expect(days.map(String)).toEqual(["2026-11-14", "2026-11-13", "2026-11-12"]);
    });

    it("G3: os dias continuam depois de fechar e reabrir", async () => {
      if (!harness.reopen) {
        return;
      }
      await harness.dataSource.recordDay(LocalDate.parse("2026-11-14"), RECORDED_AT);
      const reopened = await harness.reopen();
      expect((await reopened.listDays()).map(String)).toEqual(["2026-11-14"]);
    });
  });
}
