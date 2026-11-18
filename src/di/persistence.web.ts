import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { TaskActivityDataSource } from "@/infra/datasources/taskActivityDataSource";
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
