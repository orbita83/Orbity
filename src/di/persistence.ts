import { DatabaseProvider } from "@/infra/database/database-provider";
import { ExpoSqlExecutor } from "@/infra/database/expo-sql-executor";
import { SqliteDailyActivityDataSource } from "@/infra/datasources/sqlite-daily-activity-datasource";
import { SqliteRoutineDataSource } from "@/infra/datasources/sqlite-routine-datasource";
import { SqliteTaskDataSource } from "@/infra/datasources/sqlite-task-datasource";
import { TaskActivityDataSource } from "@/infra/datasources/task-activity-datasource";
import type { IActivityDataSource } from "@/model/datasources/i-activity-datasource";
import type { IDailyActivityDataSource } from "@/model/datasources/i-daily-activity-datasource";
import type { IRoutineDataSource } from "@/model/datasources/i-routine-datasource";
import type { ITaskDataSource } from "@/model/datasources/i-task-datasource";

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
