import { createPersistence } from "@/DI/persistence.web";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { TaskActivityCatalog } from "@/infra/repositories/task-activity-catalog";

describe("createPersistence (web)", () => {
  it("D8: na web, os repositórios de atividade e tarefas ficam em memória", () => {
    const persistence = createPersistence();
    expect(persistence.dailyActivity).toBeInstanceOf(InMemoryDailyActivityRepository);
    expect(persistence.tasks).toBeInstanceOf(InMemoryTaskRepository);
    expect(persistence.activityCatalog).toBeInstanceOf(TaskActivityCatalog);
  });
});
