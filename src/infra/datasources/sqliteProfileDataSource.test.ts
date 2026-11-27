import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseProvider } from "@/infra/database/databaseProvider";
import { describeProfileDataSourceContract } from "@/infra/datasources/profileDataSource.contract";
import { SqliteProfileDataSource } from "@/infra/datasources/sqliteProfileDataSource";
import { DataSourceError } from "@/model/errors";
import { NodeSqliteExecutor } from "../../../tests/fixtures/node-sqlite-executor";

describeProfileDataSourceContract("SqliteProfileDataSource", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "orbity-profile-db-"));
  const file = path.join(directory, "orbity.db");
  const opened: NodeSqliteExecutor[] = [];
  const open = () => {
    const executor = new NodeSqliteExecutor(file);
    opened.push(executor);
    return new SqliteProfileDataSource(new DatabaseProvider(async () => executor));
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

describe("SqliteProfileDataSource (falhas)", () => {
  it("converte erro técnico do SQLite em DataSourceError", async () => {
    const executor = new NodeSqliteExecutor();
    const dataSource = new SqliteProfileDataSource(new DatabaseProvider(async () => executor));
    await dataSource.getProfile();
    executor.database.exec("DROP TABLE student_profile");

    await expect(dataSource.getProfile()).rejects.toBeInstanceOf(DataSourceError);
    await expect(dataSource.updateName("Ana")).rejects.toBeInstanceOf(DataSourceError);
    executor.close();
  });
});
