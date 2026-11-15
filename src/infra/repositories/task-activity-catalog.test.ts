import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { TaskActivityCatalog } from "@/infra/repositories/task-activity-catalog";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";

describe("TaskActivityCatalog", () => {
  it("informa zero metas quando não há tarefas cadastradas", async () => {
    const catalog = new TaskActivityCatalog(new InMemoryTaskRepository());

    expect(await catalog.hasFocusTargets()).toBe(false);
    expect(await catalog.getProgressCounts()).toEqual({ completed: 0, total: 0 });
  });

  it("conta tarefas concluídas, total e existência de metas para a Home", async () => {
    const repo = new InMemoryTaskRepository([
      createTaskFixture({ id: "t1", completed: true }),
      createTaskFixture({ id: "t2", completed: false }),
      createTaskFixture({ id: "t3", completed: true }),
    ]);
    const catalog = new TaskActivityCatalog(repo);

    expect(await catalog.hasFocusTargets()).toBe(true);
    expect(await catalog.getProgressCounts()).toEqual({ completed: 2, total: 3 });
  });
});
