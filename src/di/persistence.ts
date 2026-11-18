import { DatabaseProvider } from "@/infra/database/databaseProvider";
import { ExpoSqlExecutor } from "@/infra/database/expoSqlExecutor";
import { SqliteDailyActivityDataSource } from "@/infra/datasources/sqliteDailyActivityDataSource";
import { SqliteRoutineDataSource } from "@/infra/datasources/sqliteRoutineDataSource";
import { SqliteTaskDataSource } from "@/infra/datasources/sqliteTaskDataSource";
import { TaskActivityDataSource } from "@/infra/datasources/taskActivityDataSource";
import type { IActivityDataSource } from "@/model/datasources/iActivityDataSource";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IRoutineDataSource } from "@/model/datasources/iRoutineDataSource";
import type { ITaskDataSource } from "@/model/datasources/iTaskDataSource";

export type Persistence = {
  dailyActivity: IDailyActivityDataSource;
  tasks: ITaskDataSource;
  routines: IRoutineDataSource;
  activities: IActivityDataSource;
};

/**
 * Android/iOS: dados no SQLite do aparelho (ADR-0001). O banco só abre no primeiro uso.
 * Na web, o Metro escolhe `persistence.web.ts` (D8). Só o `container.ts` importa este módulo.
 */
export function createPersistence(): Persistence {
  const provider = new DatabaseProvider(() => ExpoSqlExecutor.open("orbity.db"));
  const tasks = new SqliteTaskDataSource(provider);
  const routines = new SqliteRoutineDataSource(provider);
  return {
    dailyActivity: new SqliteDailyActivityDataSource(provider),
    tasks,
    routines,
    activities: new TaskActivityDataSource(tasks, routines),
  };
}
