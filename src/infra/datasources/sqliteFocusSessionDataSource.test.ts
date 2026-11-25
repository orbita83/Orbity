import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseProvider } from "@/infra/database/databaseProvider";
import { describeFocusSessionDataSourceContract } from "@/infra/datasources/focusSessionDataSource.contract";
import { SqliteFocusSessionDataSource } from "@/infra/datasources/sqliteFocusSessionDataSource";
import { createFocusSessionFixture } from "@/model/__fixtures__/focusSession.fixture";
import { DataSourceError } from "@/model/errors";
import { NodeSqliteExecutor } from "../../../tests/fixtures/node-sqlite-executor";

describeFocusSessionDataSourceContract("SqliteFocusSessionDataSource", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "orbity-focus-db-"));
  const file = path.join(directory, "orbity.db");
  const opened: NodeSqliteExecutor[] = [];
  const open = () => {
    const executor = new NodeSqliteExecutor(file);
    opened.push(executor);
    return new SqliteFocusSessionDataSource(new DatabaseProvider(async () => executor));
  };

  return {
    dataSource: open(),
    reopen: async () => {
      opened.forEach((executor) => {
        if (executor.database.isOpen) executor.close();
      });
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

describe("SqliteFocusSessionDataSource (falhas)", () => {
  it("converte erro técnico do SQLite em DataSourceError", async () => {
    const executor = new NodeSqliteExecutor();
    const dataSource = new SqliteFocusSessionDataSource(new DatabaseProvider(async () => executor));
    await dataSource.getActive();
    executor.database.exec("DROP TABLE focus_sessions");

    await expect(dataSource.getActive()).rejects.toBeInstanceOf(DataSourceError);
    await expect(dataSource.getLatestEnded()).rejects.toBeInstanceOf(DataSourceError);
    await expect(dataSource.save(createFocusSessionFixture())).rejects.toBeInstanceOf(DataSourceError);
    await expect(dataSource.endActiveByTarget("standalone-task", "t1", "2026-11-25T14:00:00-03:00")).rejects.toBeInstanceOf(
      DataSourceError,
    );
    executor.close();
  });
});
