import { createPersistence } from "@/DI/persistence.web";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryRoutineRepository } from "@/infra/repositories/in-memory-routine-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { TaskActivityCatalog } from "@/infra/repositories/task-activity-catalog";

describe("createPersistence (web)", () => {
  it("D8: na web, os repositórios de atividade, tarefas e rotinas ficam em memória", () => {
    const persistence = createPersistence();
    expect(persistence.dailyActivity).toBeInstanceOf(InMemoryDailyActivityRepository);
    expect(persistence.tasks).toBeInstanceOf(InMemoryTaskRepository);
    expect(persistence.routines).toBeInstanceOf(InMemoryRoutineRepository);
    expect(persistence.activityCatalog).toBeInstanceOf(TaskActivityCatalog);
  });
});
