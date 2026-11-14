import { DatabaseProvider } from "@/infra/database/database-provider";
import { ExpoSqlExecutor } from "@/infra/database/expo-sql-executor";
import { SqliteDailyActivityRepository } from "@/infra/repositories/sqlite-daily-activity-repository";
import type { IDailyActivityRepository } from "@/model/repositories/i-daily-activity-repository";

export type Persistence = { dailyActivity: IDailyActivityRepository };

/**
 * Android/iOS: dados no SQLite do aparelho (ADR-0001). O banco só abre no primeiro uso.
 * Na web, o Metro escolhe `persistence.web.ts` (D8). Só o `container.ts` importa este módulo.
 */
export function createPersistence(): Persistence {
  const provider = new DatabaseProvider(() => ExpoSqlExecutor.open("orbity.db"));
  return { dailyActivity: new SqliteDailyActivityRepository(provider) };
}
