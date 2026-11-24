import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseProvider } from "@/infra/database/databaseProvider";
import { SqliteStarDataSource } from "@/infra/datasources/sqliteStarDataSource";
import { describeStarDataSourceContract } from "@/infra/datasources/starDataSource.contract";
import { LocalDate } from "@/model/entities/localDate";
import { createStreakStar } from "@/model/entities/star";
import { DataSourceError } from "@/model/errors";
import { NodeSqliteExecutor } from "../../../tests/fixtures/node-sqlite-executor";

describeStarDataSourceContract("SqliteStarDataSource", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "orbity-stars-db-"));
  const file = path.join(directory, "orbity.db");
  const opened: NodeSqliteExecutor[] = [];
  const open = () => {
    const executor = new NodeSqliteExecutor(file);
    opened.push(executor);
    return new SqliteStarDataSource(new DatabaseProvider(async () => executor));
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

describe("SqliteStarDataSource (falhas)", () => {
  it("converte erro técnico do SQLite em DataSourceError", async () => {
    const executor = new NodeSqliteExecutor();
    const dataSource = new SqliteStarDataSource(new DatabaseProvider(async () => executor));
    await dataSource.listAll();
    executor.database.exec("DROP TABLE stars");

    await expect(dataSource.listAll()).rejects.toBeInstanceOf(DataSourceError);
    await expect(dataSource.countAll()).rejects.toBeInstanceOf(DataSourceError);
    await expect(
      dataSource.awardIfNew(createStreakStar(LocalDate.parse("2026-11-16"), "2026-11-16T08:00:00-03:00")),
    ).rejects.toBeInstanceOf(DataSourceError);
    executor.close();
  });
});
