import { DatabaseProvider } from "@/infra/database/databaseProvider";
import { ExpoSqlExecutor } from "@/infra/database/expoSqlExecutor";
import { SqliteCategoryDataSource } from "@/infra/datasources/sqliteCategoryDataSource";
import { SqliteDailyActivityDataSource } from "@/infra/datasources/sqliteDailyActivityDataSource";
import { SqliteFocusSessionDataSource } from "@/infra/datasources/sqliteFocusSessionDataSource";
import { SqliteRoutineDataSource } from "@/infra/datasources/sqliteRoutineDataSource";
import { SqliteStarDataSource } from "@/infra/datasources/sqliteStarDataSource";
import { SqliteTaskDataSource } from "@/infra/datasources/sqliteTaskDataSource";
import { TaskActivityDataSource } from "@/infra/datasources/taskActivityDataSource";
import type { IActivityDataSource } from "@/model/datasources/iActivityDataSource";
import type { ICategoryDataSource } from "@/model/datasources/iCategoryDataSource";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IFocusSessionDataSource } from "@/model/datasources/iFocusSessionDataSource";
import type { IRoutineDataSource } from "@/model/datasources/iRoutineDataSource";
import type { IStarDataSource } from "@/model/datasources/iStarDataSource";
import type { ITaskDataSource } from "@/model/datasources/iTaskDataSource";

export type Persistence = {
  dailyActivity: IDailyActivityDataSource;
  stars: IStarDataSource;
  tasks: ITaskDataSource;
  routines: IRoutineDataSource;
  categories: ICategoryDataSource;
  focusSessions: IFocusSessionDataSource;
  activities: IActivityDataSource;
};

/**
 * Android/iOS: dados no SQLite do aparelho (ADR-0001). O banco só abre no primeiro uso.
 * Só o `container.ts` importa este módulo.
 */
export function createPersistence(): Persistence {
  const provider = new DatabaseProvider(() => ExpoSqlExecutor.open("orbity.db"));
  const tasks = new SqliteTaskDataSource(provider);
  const routines = new SqliteRoutineDataSource(provider);
  return {
    dailyActivity: new SqliteDailyActivityDataSource(provider),
    stars: new SqliteStarDataSource(provider),
    tasks,
    routines,
    categories: new SqliteCategoryDataSource(provider),
    focusSessions: new SqliteFocusSessionDataSource(provider),
    activities: new TaskActivityDataSource(tasks, routines),
  };
}
