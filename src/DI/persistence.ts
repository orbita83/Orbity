import { DatabaseProvider } from "@/infra/database/database-provider";
import { ExpoSqlExecutor } from "@/infra/database/expo-sql-executor";
import { SqliteDailyActivityRepository } from "@/infra/repositories/sqlite-daily-activity-repository";
import { SqliteRoutineRepository } from "@/infra/repositories/sqlite-routine-repository";
import { SqliteTaskRepository } from "@/infra/repositories/sqlite-task-repository";
import { TaskActivityCatalog } from "@/infra/repositories/task-activity-catalog";
import type { IActivityCatalog } from "@/model/repositories/i-activity-catalog";
import type { IDailyActivityRepository } from "@/model/repositories/i-daily-activity-repository";
import type { IRoutineRepository } from "@/model/repositories/i-routine-repository";
import type { ITaskRepository } from "@/model/repositories/i-task-repository";

export type Persistence = {
  dailyActivity: IDailyActivityRepository;
  tasks: ITaskRepository;
  routines: IRoutineRepository;
  activityCatalog: IActivityCatalog;
};

/**
 * Android/iOS: dados no SQLite do aparelho (ADR-0001). O banco só abre no primeiro uso.
 * Na web, o Metro escolhe `persistence.web.ts` (D8). Só o `container.ts` importa este módulo.
 */
export function createPersistence(): Persistence {
  const provider = new DatabaseProvider(() => ExpoSqlExecutor.open("orbity.db"));
  const tasks = new SqliteTaskRepository(provider);
  const routines = new SqliteRoutineRepository(provider);
  return {
    dailyActivity: new SqliteDailyActivityRepository(provider),
    tasks,
    routines,
    activityCatalog: new TaskActivityCatalog(tasks, routines),
  };
}
