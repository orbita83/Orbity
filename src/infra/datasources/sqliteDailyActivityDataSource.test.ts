import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseProvider } from "@/infra/database/databaseProvider";
import { describeDailyActivityDataSourceContract } from "@/infra/datasources/dailyActivityDataSource.contract";
import { SqliteDailyActivityDataSource } from "@/infra/datasources/sqliteDailyActivityDataSource";
import { LocalDate } from "@/model/entities/localDate";
import { DataSourceError } from "@/model/errors";
import { NodeSqliteExecutor } from "../../../tests/fixtures/node-sqlite-executor";

describeDailyActivityDataSourceContract("SqliteDailyActivityDataSource", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "orbity-db-"));
  const file = path.join(directory, "orbity.db");
  const opened: NodeSqliteExecutor[] = [];
  const open = () => {
    const executor = new NodeSqliteExecutor(file);
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
        if (executor.database.isOpen) executor.close();
      });
      fs.rmSync(directory, { recursive: true, force: true });
    },
  };
});

describe("SqliteDailyActivityDataSource (falhas)", () => {
  it("converte o erro do driver em DataSourceError", async () => {
    const executor = new NodeSqliteExecutor();
    const dataSource = new SqliteDailyActivityDataSource(new DatabaseProvider(async () => executor));
    await dataSource.listDays();
    executor.database.exec("DROP TABLE daily_activity");

    await expect(dataSource.listDays()).rejects.toBeInstanceOf(DataSourceError);
    await expect(
      dataSource.recordDay(LocalDate.parse("2026-11-14"), "2026-11-14T10:00:00-03:00"),
    ).rejects.toBeInstanceOf(DataSourceError);
    executor.close();
  });
});
