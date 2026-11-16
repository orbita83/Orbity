import { InMemoryRoutineRepository } from "@/infra/repositories/in-memory-routine-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { TaskActivityCatalog } from "@/infra/repositories/task-activity-catalog";
import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { LocalDate } from "@/model/entities/local-date";
import type { Task } from "@/model/entities/task";

/** Segunda-feira: a rotina padrão da fixture (segunda a sexta) é de hoje. */
const monday = LocalDate.parse("2026-11-16");

const catalogWith = (tasks: Task[] = []) => {
  const taskRepository = new InMemoryTaskRepository(tasks);
  const routineRepository = new InMemoryRoutineRepository(taskRepository);
  return { catalog: new TaskActivityCatalog(taskRepository, routineRepository), routineRepository };
};

describe("TaskActivityCatalog", () => {
  it("informa zero metas quando não há tarefas cadastradas", async () => {
    const { catalog } = catalogWith();

    expect(await catalog.hasFocusTargets()).toBe(false);
    expect(await catalog.getProgressCounts(monday)).toEqual({ completed: 0, total: 0 });
  });

  it("conta tarefas concluídas, total e existência de metas para a Home", async () => {
    const { catalog } = catalogWith([
      createTaskFixture({ id: "t1", completed: true }),
      createTaskFixture({ id: "t2", completed: false }),
      createTaskFixture({ id: "t3", completed: true }),
    ]);

    expect(await catalog.hasFocusTargets()).toBe(true);
    expect(await catalog.getProgressCounts(monday)).toEqual({ completed: 2, total: 3 });
  });

  it("rotinas.md R10: o progresso não conta as tarefas de rotina", async () => {
    const { catalog } = catalogWith([
      createTaskFixture({ id: "t1", completed: true }),
      createTaskFixture({ id: "r1", completed: true, routineId: "routine-1", position: 0 }),
    ]);

    expect(await catalog.getProgressCounts(monday)).toEqual({ completed: 1, total: 1 });
  });
  it("RN-0007 (#138): cada rotina de hoje conta como uma unidade, concluída pela ocorrência do dia", async () => {
    const { catalog, routineRepository } = catalogWith([
      createTaskFixture({ id: "t1", completed: true }),
      createTaskFixture({ id: "t2", completed: false }),
      createTaskFixture({ id: "r1", completed: false, routineId: "routine-1", position: 0 }),
    ]);
    await routineRepository.create(createRoutineFixture({ id: "routine-1" }), []);
    await routineRepository.create(createRoutineFixture({ id: "routine-2" }), []);
    await routineRepository.create(createRoutineFixture({ id: "weekend", days: [0, 6] }), []);

    expect(await catalog.getProgressCounts(monday)).toEqual({ completed: 1, total: 4 });

    await routineRepository.completeOccurrence("routine-1", monday, ["r1"], "2026-11-16T09:00:00-03:00");
    expect(await catalog.getProgressCounts(monday)).toEqual({ completed: 2, total: 4 });
  });

  it("RN-0007 (#138): a conclusão de outro dia e as rotinas excluídas não contam", async () => {
    const { catalog, routineRepository } = catalogWith();
    await routineRepository.create(createRoutineFixture({ id: "routine-1" }), []);
    await routineRepository.create(createRoutineFixture({ id: "routine-2" }), []);
    await routineRepository.completeOccurrence("routine-1", LocalDate.parse("2026-11-13"), [], "2026-11-13T09:00:00-03:00");
    await routineRepository.markDeleted("routine-2", "2026-11-16T08:00:00-03:00");

    expect(await catalog.getProgressCounts(monday)).toEqual({ completed: 0, total: 1 });
  });

  it("RN-0001: uma rotina libera o Modo Foco, e uma rotina excluída não", async () => {
    const { catalog, routineRepository } = catalogWith();
    await routineRepository.create(createRoutineFixture(), []);
    expect(await catalog.hasFocusTargets()).toBe(true);

    await routineRepository.markDeleted("routine-1", "2026-11-16T08:00:00-03:00");
    expect(await catalog.hasFocusTargets()).toBe(false);
  });
});
