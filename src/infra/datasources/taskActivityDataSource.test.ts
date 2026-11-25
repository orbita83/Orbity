import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { TaskActivityDataSource } from "@/infra/datasources/taskActivityDataSource";
import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { LocalDate } from "@/model/entities/localDate";
import type { Task } from "@/model/entities/task";

/** Segunda-feira: a rotina padrão da fixture (segunda a sexta) é de hoje. */
const monday = LocalDate.parse("2026-11-16");

const activitiesWith = (tasks: Task[] = []) => {
  const taskDataSource = new MemoryTaskDataSource(tasks);
  const routineDataSource = new MemoryRoutineDataSource(taskDataSource);
  return { activities: new TaskActivityDataSource(taskDataSource, routineDataSource), routineDataSource };
};

describe("TaskActivityDataSource", () => {
  it("informa zero metas quando não há tarefas cadastradas", async () => {
    const { activities } = activitiesWith();

    expect(await activities.hasFocusTargets()).toBe(false);
    expect(await activities.getProgressCounts(monday)).toEqual({ completed: 0, total: 0 });
  });

  it("conta tarefas concluídas, total e existência de metas para a Home", async () => {
    const { activities } = activitiesWith([
      createTaskFixture({ id: "t1", completed: true }),
      createTaskFixture({ id: "t2", completed: false }),
      createTaskFixture({ id: "t3", completed: true }),
    ]);

    expect(await activities.hasFocusTargets()).toBe(true);
    expect(await activities.getProgressCounts(monday)).toEqual({ completed: 2, total: 3 });
  });

  it("rotinas.md R10: o progresso não conta as tarefas de rotina", async () => {
    const { activities } = activitiesWith([
      createTaskFixture({ id: "t1", completed: true }),
      createTaskFixture({ id: "r1", completed: true, routineId: "routine-1", position: 0 }),
    ]);

    expect(await activities.getProgressCounts(monday)).toEqual({ completed: 1, total: 1 });
  });
  it("RN-0007 (#138): cada rotina de hoje conta como uma unidade, concluída pela ocorrência do dia", async () => {
    const { activities, routineDataSource } = activitiesWith([
      createTaskFixture({ id: "t1", completed: true }),
      createTaskFixture({ id: "t2", completed: false }),
      createTaskFixture({ id: "r1", completed: false, routineId: "routine-1", position: 0 }),
    ]);
    await routineDataSource.create(createRoutineFixture({ id: "routine-1" }), []);
    await routineDataSource.create(createRoutineFixture({ id: "routine-2" }), []);
    await routineDataSource.create(createRoutineFixture({ id: "weekend", days: [0, 6] }), []);

    expect(await activities.getProgressCounts(monday)).toEqual({ completed: 1, total: 4 });

    await routineDataSource.completeOccurrence("routine-1", monday, ["r1"], "2026-11-16T09:00:00-03:00");
    expect(await activities.getProgressCounts(monday)).toEqual({ completed: 2, total: 4 });
  });

  it("RN-0007 (#138): a conclusão de outro dia e as rotinas excluídas não contam", async () => {
    const { activities, routineDataSource } = activitiesWith();
    await routineDataSource.create(createRoutineFixture({ id: "routine-1" }), []);
    await routineDataSource.create(createRoutineFixture({ id: "routine-2" }), []);
    await routineDataSource.completeOccurrence("routine-1", LocalDate.parse("2026-11-13"), [], "2026-11-13T09:00:00-03:00");
    await routineDataSource.markDeleted("routine-2", "2026-11-16T08:00:00-03:00");

    expect(await activities.getProgressCounts(monday)).toEqual({ completed: 0, total: 1 });
  });

  it("RN-0001: uma rotina libera o Modo Foco, e uma rotina excluída não", async () => {
    const { activities, routineDataSource } = activitiesWith();
    await routineDataSource.create(createRoutineFixture(), []);
    expect(await activities.hasFocusTargets()).toBe(true);

    await routineDataSource.markDeleted("routine-1", "2026-11-16T08:00:00-03:00");
    expect(await activities.hasFocusTargets()).toBe(false);
  });

  it("issue #217: listFocusTargets lista tarefas avulsas (pendentes primeiro) e rotinas ativas, ignorando tarefas de rotina", async () => {
    const { activities, routineDataSource } = activitiesWith([
      createTaskFixture({ id: "t-done", title: "Concluída", completed: true }),
      createTaskFixture({ id: "t-open", title: "Pendente", completed: false }),
      createTaskFixture({ id: "r-sub", title: "Subtarefa", routineId: "routine-1", position: 0 }),
    ]);
    await routineDataSource.create(createRoutineFixture({ id: "routine-1", title: "Matemática" }), []);

    expect(await activities.listFocusTargets()).toEqual([
      { kind: "standalone-task", id: "t-open", title: "Pendente" },
      { kind: "standalone-task", id: "t-done", title: "Concluída" },
      { kind: "routine", id: "routine-1", title: "Matemática" },
    ]);
  });
});
