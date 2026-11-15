import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import type { Persistence } from "./persistence";

/** Web: dados só em memória, perdidos ao recarregar (D8). Mantém o `expo-sqlite` fora do bundle web. */
export function createPersistence(): Persistence {
  return { dailyActivity: new InMemoryDailyActivityRepository() };
}
