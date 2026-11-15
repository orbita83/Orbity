import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseProvider } from "@/infra/database/database-provider";
import { describeDailyActivityRepositoryContract } from "@/infra/repositories/daily-activity-repository.contract";
import { SqliteDailyActivityRepository } from "@/infra/repositories/sqlite-daily-activity-repository";
import { LocalDate } from "@/model/entities/local-date";
import { DomainError } from "@/model/errors/domain-error";
import { BetterSqliteExecutor } from "../../../tests/fixtures/better-sqlite-executor";

describeDailyActivityRepositoryContract("SqliteDailyActivityRepository", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "orbity-db-"));
  const file = path.join(directory, "orbity.db");
  const opened: BetterSqliteExecutor[] = [];
  const open = () => {
    const executor = new BetterSqliteExecutor(file);
    opened.push(executor);
    return new SqliteDailyActivityRepository(new DatabaseProvider(async () => executor));
  };

  return {
    repository: open(),
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

describe("SqliteDailyActivityRepository (falhas)", () => {
  it("converte o erro do driver em PERSISTENCE_FAILURE", async () => {
    const executor = new BetterSqliteExecutor();
    const repository = new SqliteDailyActivityRepository(new DatabaseProvider(async () => executor));
    await repository.listDays();
    executor.database.exec("DROP TABLE daily_activity");

    await expect(repository.listDays()).rejects.toMatchObject({
      code: "PERSISTENCE_FAILURE",
      retryable: true,
    });
    await expect(
      repository.recordDay(LocalDate.parse("2026-11-14"), "2026-11-14T10:00:00-03:00"),
    ).rejects.toBeInstanceOf(DomainError);
    executor.close();
  });
});
