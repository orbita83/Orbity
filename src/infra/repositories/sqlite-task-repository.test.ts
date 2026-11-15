import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseProvider } from "@/infra/database/database-provider";
import type { ISqlExecutor } from "@/infra/database/i-sql-executor";
import { SqliteTaskRepository } from "@/infra/repositories/sqlite-task-repository";
import { runTaskRepositoryContractTests } from "@/infra/repositories/task-repository.contract";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { BetterSqliteExecutor } from "../../../tests/fixtures/better-sqlite-executor";

describe("SqliteTaskRepository", () => {
  const openExecutors: BetterSqliteExecutor[] = [];

  afterEach(() => {
    while (openExecutors.length > 0) {
      openExecutors.pop()?.close();
    }
  });

  runTaskRepositoryContractTests(async () => {
    const executor = new BetterSqliteExecutor();
    openExecutors.push(executor);
    return new SqliteTaskRepository(new DatabaseProvider(async () => executor));
  });

  it("persiste as tarefas quando o banco em arquivo é fechado e reaberto", async () => {
    const dir = mkdtempSync(join(tmpdir(), "orbity-tasks-sqlite-"));
    const dbPath = join(dir, "orbity.db");
    const task = createTaskFixture({ id: "t-persist", title: "Revisar algoritmos", pinned: true });

    try {
      const firstExecutor = new BetterSqliteExecutor(dbPath);
      const firstRepo = new SqliteTaskRepository(new DatabaseProvider(async () => firstExecutor));
      await firstRepo.create(task);
      firstExecutor.close();

      const secondExecutor = new BetterSqliteExecutor(dbPath);
      openExecutors.push(secondExecutor);
      const secondRepo = new SqliteTaskRepository(new DatabaseProvider(async () => secondExecutor));

      expect(await secondRepo.listAll()).toEqual([task]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("converte falha técnica do driver em DomainError PERSISTENCE_FAILURE", async () => {
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
    const repo = new SqliteTaskRepository({ get: async () => failingExecutor } as unknown as DatabaseProvider);

    await expect(repo.listAll()).rejects.toMatchObject({ code: "PERSISTENCE_FAILURE", retryable: true });
    await expect(repo.create(createTaskFixture())).rejects.toMatchObject({
      code: "PERSISTENCE_FAILURE",
      retryable: true,
    });
  });
});
