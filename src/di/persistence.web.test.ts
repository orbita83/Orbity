import { createPersistence } from "@/di/persistence.web";
import { MemoryDailyActivityDataSource } from "@/infra/datasources/memory-daily-activity-datasource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memory-routine-datasource";
import { MemoryTaskDataSource } from "@/infra/datasources/memory-task-datasource";
import { TaskActivityDataSource } from "@/infra/datasources/task-activity-datasource";

describe("createPersistence (web)", () => {
  it("D8: na web, os DataSources de atividade, tarefas e rotinas ficam em memória", () => {
    const persistence = createPersistence();
    expect(persistence.dailyActivity).toBeInstanceOf(MemoryDailyActivityDataSource);
    expect(persistence.tasks).toBeInstanceOf(MemoryTaskDataSource);
    expect(persistence.routines).toBeInstanceOf(MemoryRoutineDataSource);
    expect(persistence.activities).toBeInstanceOf(TaskActivityDataSource);
  });
});
