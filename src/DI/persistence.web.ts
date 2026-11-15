import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { TaskActivityCatalog } from "@/infra/repositories/task-activity-catalog";
import type { Persistence } from "./persistence";

/** Web: dados só em memória, perdidos ao recarregar (D8). Mantém o `expo-sqlite` fora do bundle web. */
export function createPersistence(): Persistence {
  const tasks = new InMemoryTaskRepository();
  return {
    dailyActivity: new InMemoryDailyActivityRepository(),
    tasks,
    activityCatalog: new TaskActivityCatalog(tasks),
  };
}
