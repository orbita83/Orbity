import { container, createAppContainer } from "@/DI/container";
import { DatabaseProvider } from "@/infra/database/database-provider";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { TaskActivityCatalog } from "@/infra/repositories/task-activity-catalog";
import { LocalDate } from "@/model/entities/local-date";
import type { IClockService } from "@/model/services/i-clock-service";

const fixedClock: IClockService = {
  now: () => "2026-11-14T10:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-14"),
};

describe("container da aplicação", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("importar o container não abre o banco", () => {
    const get = jest.spyOn(DatabaseProvider.prototype, "get");

    jest.isolateModules(() => {
      // Import dinâmico de propósito: o módulo precisa ser carregado depois do spy.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@/DI/container");
    });

    expect(get).not.toHaveBeenCalled();
  });

  it("o caso de uso da sequência usa o repositório passado em overrides", async () => {
    const dailyActivity = new InMemoryDailyActivityRepository();
    const tasks = new InMemoryTaskRepository();
    const isolated = createAppContainer({
      repositories: { dailyActivity, tasks, activityCatalog: new TaskActivityCatalog(tasks) },
      services: { clock: fixedClock },
    });

    await isolated.useCases.streak.recordActivity({ kind: "routine", id: "r1" });

    expect((await dailyActivity.listDays()).map(String)).toEqual(["2026-11-14"]);
    expect((await isolated.useCases.home.loadHome()).streak.currentDays).toBe(1);
  });

  it("concluir uma tarefa no container reflete no progresso, nas metas e na sequência da Home", async () => {
    const dailyActivity = new InMemoryDailyActivityRepository();
    const tasks = new InMemoryTaskRepository();
    const isolated = createAppContainer({
      repositories: { dailyActivity, tasks, activityCatalog: new TaskActivityCatalog(tasks) },
      services: { clock: fixedClock },
    });

    const created = await isolated.useCases.tasks.createTask({ title: "Estudar estrutura de dados" });
    expect(await isolated.useCases.home.loadHome()).toMatchObject({
      focus: { canStart: true },
      progress: { completed: 0, total: 1 },
      streak: { currentDays: 0 },
    });

    await isolated.useCases.tasks.toggleTaskCompletion(created.id);

    expect(await isolated.useCases.home.loadHome()).toMatchObject({
      focus: { canStart: true },
      progress: { completed: 1, total: 1 },
      streak: { currentDays: 1 },
    });
  });

  it("o container e seus registros ficam congelados", () => {
    expect(Object.isFrozen(container)).toBe(true);
    expect(Object.isFrozen(container.repositories)).toBe(true);
    expect(Object.isFrozen(container.services)).toBe(true);
    expect(Object.isFrozen(container.useCases)).toBe(true);
  });
});
