import { container, createAppContainer } from "@/di/container";
import { DatabaseProvider } from "@/infra/database/databaseProvider";
import { MemoryCategoryDataSource } from "@/infra/datasources/memoryCategoryDataSource";
import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryStarDataSource } from "@/infra/datasources/memoryStarDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { TaskActivityDataSource } from "@/infra/datasources/taskActivityDataSource";
import { LocalDate } from "@/model/entities/localDate";
import type { IClockService } from "@/model/services/iClockService";
import { FakeNotificationService } from "../../tests/fixtures/fakeNotificationService";

const fixedClock: IClockService = {
  now: () => "2026-11-14T10:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-14"),
};

const memoryDataSources = () => {
  const tasks = new MemoryTaskDataSource();
  const routines = new MemoryRoutineDataSource(tasks);
  return {
    dailyActivity: new MemoryDailyActivityDataSource(),
    stars: new MemoryStarDataSource(),
    tasks,
    routines,
    categories: new MemoryCategoryDataSource(tasks, routines),
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
      stars: { total: 1, earnedToday: true },
    });
  });

  it("issue #212: tarefas e rotinas só aceitam categorias existentes, e excluir uma categoria limpa as duas sem apagá-las", async () => {
    const isolated = createAppContainer({ dataSources: memoryDataSources(), services: { clock: fixedClock } });
    const { categories, tasks, routines } = isolated.useCases;

    const physics = await categories.createCategory({ name: "Física", icon: "science" });
    const task = await tasks.createTask({ title: "Lista de mecânica", category: physics.id });
    const routine = await routines.createRoutine({ title: "Física", icon: physics.id, days: [1], tasks: [] });
    await expect(tasks.createTask({ title: "Outra", category: "inexistente" })).rejects.toThrow(
      "Categoria de tarefa inválida.",
    );
    await expect(routines.createRoutine({ title: "Outra", icon: "inexistente", days: [1], tasks: [] })).rejects.toThrow(
      "Ícone de rotina inválido.",
    );

    await categories.deleteCategory(physics.id);

    expect((await tasks.getTask(task.id)).category).toBeUndefined();
    expect((await routines.getRoutine(routine.id))?.routine.icon).toBe("general");
    expect((await categories.listCategories()).map((category) => category.id)).not.toContain(physics.id);
  });

  it("issue #188: sem dados, o perfil do app começa sem nome e com as métricas zeradas", async () => {
    const isolated = createAppContainer({ dataSources: memoryDataSources(), services: { clock: fixedClock } });

    expect(await isolated.useCases.profile.getProfile()).toEqual({
      id: "local-student",
      name: "",
      streakDays: 0,
      achievementsCount: 0,
      studyHours: 0,
    });
  });

  it("issue #249: o Perfil mostra a mesma sequência da Tela Inicial depois de concluir uma tarefa", async () => {
    const isolated = createAppContainer({ dataSources: memoryDataSources(), services: { clock: fixedClock } });
    const { tasks, home, profile } = isolated.useCases;

    const task = await tasks.createTask({ title: "Revisar Geometria" });
    await tasks.toggleTaskCompletion(task.id);

    const homeStreak = (await home.loadHome()).streak.currentDays;
    expect(homeStreak).toBe(1);
    expect((await profile.getProfile()).streakDays).toBe(homeStreak);
  });

  it("o container e seus registros ficam congelados", () => {
    expect(Object.isFrozen(container)).toBe(true);
    expect(Object.isFrozen(container.dataSources)).toBe(true);
    expect(Object.isFrozen(container.services)).toBe(true);
    expect(Object.isFrozen(container.useCases)).toBe(true);
  });

  it("issue #211: o caso de uso de tarefas usa o serviço de notificações injetado no container", async () => {
    const notifications = new FakeNotificationService("granted");
    const isolated = createAppContainer({
      dataSources: memoryDataSources(),
      services: { clock: fixedClock, notifications },
    });

    const created = await isolated.useCases.tasks.createTask({
      title: "Revisar Geometria",
      startDate: "14/11/2026",
      startTime: "15:00",
    });

    expect(await notifications.listScheduled()).toEqual([
      expect.objectContaining({
        id: `task-reminder:${created.id}`,
        triggerAt: "2026-11-14T15:00:00-03:00",
      }),
    ]);
  });
});
