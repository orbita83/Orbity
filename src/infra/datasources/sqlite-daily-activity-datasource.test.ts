import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseProvider } from "@/infra/database/database-provider";
import { describeDailyActivityDataSourceContract } from "@/infra/datasources/daily-activity-datasource.contract";
import { SqliteDailyActivityDataSource } from "@/infra/datasources/sqlite-daily-activity-datasource";
import { LocalDate } from "@/model/entities/local-date";
import { DomainError } from "@/model/errors/domain-error";
import { BetterSqliteExecutor } from "../../../tests/fixtures/better-sqlite-executor";

describeDailyActivityDataSourceContract("SqliteDailyActivityDataSource", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "orbity-db-"));
  const file = path.join(directory, "orbity.db");
  const opened: BetterSqliteExecutor[] = [];
  const open = () => {
    const executor = new BetterSqliteExecutor(file);
    opened.push(executor);
    return new SqliteDailyActivityDataSource(new DatabaseProvider(async () => executor));
  };

  return {
    dataSource: open(),
    reopen: async () => {
      opened.forEach((executor) => executor.close());
      return open();
    },
    cleanup: () => {
      opened.forEach((executor) => {
        if (executor.database.open) executor.close();
      });
      fs.rmSync(directory, { recursive: true, force: true });
    },
  };
});

describe("SqliteDailyActivityDataSource (falhas)", () => {
  it("converte o erro do driver em PERSISTENCE_FAILURE", async () => {
    const executor = new BetterSqliteExecutor();
    const dataSource = new SqliteDailyActivityDataSource(new DatabaseProvider(async () => executor));
    await dataSource.listDays();
    executor.database.exec("DROP TABLE daily_activity");

    await expect(dataSource.listDays()).rejects.toMatchObject({
      code: "PERSISTENCE_FAILURE",
      retryable: true,
    });
    await expect(
      dataSource.recordDay(LocalDate.parse("2026-11-14"), "2026-11-14T10:00:00-03:00"),
    ).rejects.toBeInstanceOf(DomainError);
    executor.close();
  });
});
