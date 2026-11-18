import { MemoryDailyActivityDataSource } from "@/infra/datasources/memory-daily-activity-datasource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memory-routine-datasource";
import { MemoryTaskDataSource } from "@/infra/datasources/memory-task-datasource";
import { TaskActivityDataSource } from "@/infra/datasources/task-activity-datasource";
import type { Persistence } from "./persistence";

/** Web: dados só em memória, perdidos ao recarregar (D8). Mantém o `expo-sqlite` fora do bundle web. */
export function createPersistence(): Persistence {
  const tasks = new MemoryTaskDataSource();
  const routines = new MemoryRoutineDataSource(tasks);
  return {
    dailyActivity: new MemoryDailyActivityDataSource(),
    tasks,
    routines,
    activities: new TaskActivityDataSource(tasks, routines),
  };
}
