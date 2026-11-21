import { DatabaseProvider } from "@/infra/database/databaseProvider";
import { runRoutineDataSourceContractTests } from "@/infra/datasources/routineDataSource.contract";
import { SqliteRoutineDataSource } from "@/infra/datasources/sqliteRoutineDataSource";
import { SqliteTaskDataSource } from "@/infra/datasources/sqliteTaskDataSource";
import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { DataSourceError } from "@/model/errors";
import { BetterSqliteExecutor } from "../../../tests/fixtures/better-sqlite-executor";

describe("SqliteRoutineDataSource", () => {
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
    return { executor, routines: new SqliteRoutineDataSource(provider), tasks: new SqliteTaskDataSource(provider) };
  };

  runRoutineDataSourceContractTests(async () => {
    const { routines, tasks } = open();
    return { routines, tasks };
  });

  it("criar é atômico: se uma tarefa falha, a rotina também não fica", async () => {
    const { routines, tasks } = open();
    const duplicated = createTaskFixture({ id: "t1", routineId: "routine-1", position: 0 });

    await expect(routines.create(createRoutineFixture(), [duplicated, duplicated])).rejects.toBeInstanceOf(DataSourceError);
    expect(await routines.listActive()).toEqual([]);
    expect(await tasks.listByRoutine("routine-1")).toEqual([]);
  });

  it("converte o erro do driver em DataSourceError", async () => {
    const { executor, routines } = open();
    await routines.listActive();
    executor.database.exec("DROP TABLE routines");

    await expect(routines.listActive()).rejects.toBeInstanceOf(DataSourceError);
  });
});
