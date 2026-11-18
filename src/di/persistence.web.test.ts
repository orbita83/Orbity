import { createPersistence } from "@/di/persistence.web";
import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { TaskActivityDataSource } from "@/infra/datasources/taskActivityDataSource";

describe("createPersistence (web)", () => {
  it("D8: na web, os DataSources de atividade, tarefas e rotinas ficam em memória", () => {
    const persistence = createPersistence();
    expect(persistence.dailyActivity).toBeInstanceOf(MemoryDailyActivityDataSource);
    expect(persistence.tasks).toBeInstanceOf(MemoryTaskDataSource);
    expect(persistence.routines).toBeInstanceOf(MemoryRoutineDataSource);
    expect(persistence.activities).toBeInstanceOf(TaskActivityDataSource);
  });
});
