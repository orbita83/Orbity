import { DatabaseProvider } from "@/infra/database/database-provider";
import { runRoutineRepositoryContractTests } from "@/infra/repositories/routine-repository.contract";
import { SqliteRoutineRepository } from "@/infra/repositories/sqlite-routine-repository";
import { SqliteTaskRepository } from "@/infra/repositories/sqlite-task-repository";
import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { DomainError } from "@/model/errors/domain-error";
import { BetterSqliteExecutor } from "../../../tests/fixtures/better-sqlite-executor";

describe("SqliteRoutineRepository", () => {
  const openExecutors: BetterSqliteExecutor[] = [];

  afterEach(() => {
    while (openExecutors.length > 0) {
      openExecutors.pop()?.close();
    }
  });

  const open = () => {
    const executor = new BetterSqliteExecutor();
    openExecutors.push(executor);
    const provider = new DatabaseProvider(async () => executor);
    return { executor, routines: new SqliteRoutineRepository(provider), tasks: new SqliteTaskRepository(provider) };
  };

  runRoutineRepositoryContractTests(async () => {
    const { routines, tasks } = open();
    return { routines, tasks };
  });

  it("criar é atômico: se uma tarefa falha, a rotina também não fica", async () => {
    const { routines, tasks } = open();
    const duplicated = createTaskFixture({ id: "t1", routineId: "routine-1", position: 0 });

    await expect(routines.create(createRoutineFixture(), [duplicated, duplicated])).rejects.toMatchObject({
      code: "PERSISTENCE_FAILURE",
    });
    expect(await routines.listActive()).toEqual([]);
    expect(await tasks.listByRoutine("routine-1")).toEqual([]);
  });

  it("converte o erro do driver em DomainError", async () => {
    const { executor, routines } = open();
    await routines.listActive();
    executor.database.exec("DROP TABLE routines");

    await expect(routines.listActive()).rejects.toBeInstanceOf(DomainError);
  });
});
