import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseProvider } from "@/infra/database/databaseProvider";
import type { ISqlExecutor } from "@/infra/database/iSqlExecutor";
import { SqliteTaskDataSource } from "@/infra/datasources/sqliteTaskDataSource";
import { runTaskDataSourceContractTests } from "@/infra/datasources/taskDataSource.contract";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { DataSourceError } from "@/model/errors";
import { BetterSqliteExecutor } from "../../../tests/fixtures/better-sqlite-executor";

describe("SqliteTaskDataSource", () => {
  const openExecutors: BetterSqliteExecutor[] = [];

  afterEach(() => {
    while (openExecutors.length > 0) {
      openExecutors.pop()?.close();
    }
  });

  runTaskDataSourceContractTests(async () => {
    const executor = new BetterSqliteExecutor();
    openExecutors.push(executor);
    return new SqliteTaskDataSource(new DatabaseProvider(async () => executor));
  });

  it("persiste as tarefas quando o banco em arquivo é fechado e reaberto", async () => {
    const dir = mkdtempSync(join(tmpdir(), "orbity-tasks-sqlite-"));
    const dbPath = join(dir, "orbity.db");
    const task = createTaskFixture({ id: "t-persist", title: "Revisar algoritmos", pinned: true });

    const fileExecutors: BetterSqliteExecutor[] = [];

    try {
      const firstExecutor = new BetterSqliteExecutor(dbPath);
      fileExecutors.push(firstExecutor);
      const firstRepo = new SqliteTaskDataSource(new DatabaseProvider(async () => firstExecutor));
      await firstRepo.create(task);
      firstExecutor.close();

      const secondExecutor = new BetterSqliteExecutor(dbPath);
      fileExecutors.push(secondExecutor);
      const secondRepo = new SqliteTaskDataSource(new DatabaseProvider(async () => secondExecutor));

      expect(await secondRepo.listAll()).toEqual([task]);
    } finally {
      // No Windows, um arquivo de banco ainda aberto não pode ser apagado (EBUSY): fecha antes de remover.
      fileExecutors.forEach((executor) => {
        if (executor.database.open) executor.close();
      });
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("converte falha técnica do driver em DataSourceError", async () => {
    const failingExecutor: ISqlExecutor = {
      all: async () => {
        throw new Error("SQLITE_BUSY");
      },
      run: async () => {
        throw new Error("SQLITE_READONLY");
      },
      runInTransaction: async () => {
        throw new Error("SQLITE_IOERR");
      },
    };
    const repo = new SqliteTaskDataSource({ get: async () => failingExecutor } as unknown as DatabaseProvider);

    await expect(repo.listAll()).rejects.toBeInstanceOf(DataSourceError);
    await expect(repo.create(createTaskFixture())).rejects.toBeInstanceOf(DataSourceError);
  });
});
