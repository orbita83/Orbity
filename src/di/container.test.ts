import { container, createAppContainer } from "@/di/container";
import { DatabaseProvider } from "@/infra/database/database-provider";
import { MemoryDailyActivityDataSource } from "@/infra/datasources/memory-daily-activity-datasource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memory-routine-datasource";
import { MemoryTaskDataSource } from "@/infra/datasources/memory-task-datasource";
import { TaskActivityDataSource } from "@/infra/datasources/task-activity-datasource";
import { LocalDate } from "@/model/entities/local-date";
import type { IClockService } from "@/model/services/i-clock-service";

const fixedClock: IClockService = {
  now: () => "2026-11-14T10:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-14"),
};

const memoryDataSources = () => {
  const tasks = new MemoryTaskDataSource();
  const routines = new MemoryRoutineDataSource(tasks);
  return {
    dailyActivity: new MemoryDailyActivityDataSource(),
    tasks,
    routines,
    activities: new TaskActivityDataSource(tasks, routines),
  };
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
      require("@/di/container");
    });

    expect(get).not.toHaveBeenCalled();
  });

  it("o caso de uso da sequência usa o DataSource passado em overrides", async () => {
    const dataSources = memoryDataSources();
    const { dailyActivity } = dataSources;
    const isolated = createAppContainer({ dataSources, services: { clock: fixedClock } });

    await isolated.useCases.streak.recordActivity({ kind: "routine", id: "r1" });

    expect((await dailyActivity.listDays()).map(String)).toEqual(["2026-11-14"]);
    expect((await isolated.useCases.home.loadHome()).streak.currentDays).toBe(1);
  });

  it("rotinas.md: concluir uma rotina no container libera o foco e sobe a sequência e conta no progresso como uma unidade (RN-0007)", async () => {
    const monday: IClockService = {
      now: () => "2026-11-16T10:00:00-03:00",
      todayLocal: () => LocalDate.parse("2026-11-16"),
    };
    const isolated = createAppContainer({ dataSources: memoryDataSources(), services: { clock: monday } });

    const routine = await isolated.useCases.routines.createRoutine({ title: "Matemática", days: [1], tasks: ["Revisar"] });
    expect(await isolated.useCases.home.loadHome()).toMatchObject({
      focus: { canStart: true },
      progress: { completed: 0, total: 1 },
      streak: { currentDays: 0 },
    });
    expect(await isolated.useCases.tasks.listTasks()).toEqual([]);

    await isolated.useCases.routines.completeOccurrence(routine.id);

    expect(await isolated.useCases.home.loadHome()).toMatchObject({
      progress: { completed: 1, total: 1 },
      streak: { currentDays: 1 },
    });
  });

  it("concluir uma tarefa no container reflete no progresso, nas metas e na sequência da Home", async () => {
    const isolated = createAppContainer({ dataSources: memoryDataSources(), services: { clock: fixedClock } });

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
    expect(Object.isFrozen(container.dataSources)).toBe(true);
    expect(Object.isFrozen(container.services)).toBe(true);
    expect(Object.isFrozen(container.useCases)).toBe(true);
  });
});
