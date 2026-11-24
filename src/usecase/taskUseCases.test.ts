import { MemoryCategoryDataSource } from "@/infra/datasources/memoryCategoryDataSource";
import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { MemoryStarDataSource } from "@/infra/datasources/memoryStarDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { createCategoryFixture } from "@/model/__fixtures__/category.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { LocalDate } from "@/model/entities/localDate";
import { ValidationError } from "@/model/errors";
import type { IClockService } from "@/model/services/iClockService";
import { TASK_REMINDER_NOTIFICATION_TITLE, TaskUseCases } from "@/usecase/taskUseCases";
import { FakeNotificationService } from "../../tests/fixtures/fakeNotificationService";

const createClock = (nowIso = "2026-11-15T09:30:00-03:00", localDate = "2026-11-15"): IClockService => ({
  now: () => nowIso,
  todayLocal: () => LocalDate.parse(localDate),
});

describe("TaskUseCases", () => {
  it("cria tarefa com campos normalizados e persiste no DataSource", async () => {
    const taskRepo = new MemoryTaskDataSource();
    const activityRepo = new MemoryDailyActivityDataSource();
    let seq = 0;
    const useCases = new TaskUseCases(taskRepo, activityRepo, createClock(), () => `t-${++seq}`);

    const created = await useCases.createTask({
      title: "  Revisar SOLID  ",
      description: "   ",
      startDate: "16/11/2026",
      startTime: "10:00",
      endDate: "16/11/2026",
      endTime: "11:00",
      category: "programming",
    });

    expect(created).toEqual({
      id: "t-1",
      title: "Revisar SOLID",
      description: undefined,
      startDate: "16/11/2026",
      startTime: "10:00",
      endDate: "16/11/2026",
      endTime: "11:00",
      category: "programming",
      completed: false,
      pinned: false,
      createdAt: "2026-11-15T09:30:00-03:00",
      updatedAt: "2026-11-15T09:30:00-03:00",
    });
    expect(await useCases.listTasks()).toEqual([created]);
  });

  it("rotinas.md R1: a aba Tarefas não lista as tarefas de rotina", async () => {
    const taskRepo = new MemoryTaskDataSource([
      createTaskFixture({ id: "avulsa" }),
      createTaskFixture({ id: "da-rotina", routineId: "routine-1", position: 0 }),
    ]);
    const useCases = new TaskUseCases(taskRepo, new MemoryDailyActivityDataSource(), createClock());

    expect((await useCases.listTasks()).map((task) => task.id)).toEqual(["avulsa"]);
  });

  it("rejeita criação com título vazio ou datas inválidas sem gravar nada", async () => {
    const taskRepo = new MemoryTaskDataSource();
    const useCases = new TaskUseCases(taskRepo, new MemoryDailyActivityDataSource(), createClock());

    await expect(useCases.createTask({ title: "  " })).rejects.toMatchObject({
      name: "ValidationError",
      field: "title",
    });
    await expect(useCases.createTask({ title: "Estudar", startDate: "31/02/2026" })).rejects.toThrow(ValidationError);
    expect(await taskRepo.listAll()).toEqual([]);
  });

  it("getTask busca a tarefa avulsa pelo id e recusa id inexistente ou tarefa de rotina", async () => {
    const avulsa = createTaskFixture({ id: "avulsa" });
    const taskRepo = new MemoryTaskDataSource([
      avulsa,
      createTaskFixture({ id: "da-rotina", routineId: "routine-1", position: 0 }),
    ]);
    const useCases = new TaskUseCases(taskRepo, new MemoryDailyActivityDataSource(), createClock());

    expect(await useCases.getTask("avulsa")).toEqual(avulsa);
    await expect(useCases.getTask("da-rotina")).rejects.toThrow(ValidationError);
    await expect(useCases.getTask("nao-existe")).rejects.toThrow(ValidationError);
  });

  it("todayLocal devolve a data local do relógio injetado", () => {
    const useCases = new TaskUseCases(
      new MemoryTaskDataSource(),
      new MemoryDailyActivityDataSource(),
      createClock("2026-11-20T23:30:00-03:00", "2026-11-20"),
    );

    expect(useCases.todayLocal().toString()).toBe("2026-11-20");
  });

  it("concluir tarefa registra o dia local na sequência e concede estrela; reabrir preserva ambos (RF-0017, RN-0003)", async () => {
    const initial = createTaskFixture({ id: "t1", completed: false });
    const taskRepo = new MemoryTaskDataSource([initial]);
    const activityRepo = new MemoryDailyActivityDataSource();
    const starRepo = new MemoryStarDataSource();
    const useCases = new TaskUseCases(
      taskRepo,
      activityRepo,
      createClock("2026-11-15T18:00:00-03:00", "2026-11-15"),
      undefined,
      starRepo,
    );

    const completed = await useCases.toggleTaskCompletion("t1");
    expect(completed.completed).toBe(true);
    expect((await activityRepo.listDays()).map(String)).toEqual(["2026-11-15"]);
    expect((await starRepo.listAll()).map((star) => star.eventKey)).toEqual(["streak:2026-11-15"]);

    const reopened = await useCases.toggleTaskCompletion("t1");
    expect(reopened.completed).toBe(false);
    expect((await activityRepo.listDays()).map(String)).toEqual(["2026-11-15"]);
    expect(await starRepo.countAll()).toBe(1);
  });

  it("togglePinTasks fixa quando há pelo menos uma não fixada e desafixa quando todas já estão fixadas", async () => {
    const a = createTaskFixture({ id: "a", pinned: false });
    const b = createTaskFixture({ id: "b", pinned: true });
    const c = createTaskFixture({ id: "c", pinned: false });
    const taskRepo = new MemoryTaskDataSource([a, b, c]);
    const useCases = new TaskUseCases(taskRepo, new MemoryDailyActivityDataSource(), createClock());

    await useCases.togglePinTasks(["a", "b"]);
    expect((await taskRepo.findById("a"))?.pinned).toBe(true);
    expect((await taskRepo.findById("b"))?.pinned).toBe(true);
    expect((await taskRepo.findById("c"))?.pinned).toBe(false);

    await useCases.togglePinTasks(["a", "b"]);
    expect((await taskRepo.findById("a"))?.pinned).toBe(false);
    expect((await taskRepo.findById("b"))?.pinned).toBe(false);
  });

  it("atualiza campos e exclui tarefas selecionadas em lote", async () => {
    const a = createTaskFixture({ id: "a", title: "Antiga" });
    const b = createTaskFixture({ id: "b", title: "Outra" });
    const taskRepo = new MemoryTaskDataSource([a, b]);
    const useCases = new TaskUseCases(taskRepo, new MemoryDailyActivityDataSource(), createClock());

    const updated = await useCases.updateTask({ id: "a", title: "Atualizada", category: null });
    expect(updated.title).toBe("Atualizada");
    expect(updated.category).toBeUndefined();
    await expect(useCases.updateTask({ id: "a", title: "   " })).rejects.toMatchObject({
      name: "ValidationError",
      field: "title",
    });

    await useCases.deleteTasks(["b"]);
    expect((await useCases.listTasks()).map((task) => task.id)).toEqual(["a"]);
  });

  it("aceita e normaliza datas e horários digitados sem formatação na criação e edição", async () => {
    const taskRepo = new MemoryTaskDataSource();
    const useCases = new TaskUseCases(taskRepo, new MemoryDailyActivityDataSource(), createClock(), () => "t-digits");

    const created = await useCases.createTask({
      title: "Revisar física",
      startDate: "16112026",
      startTime: "830",
      endDate: "5/12/2026",
      endTime: "9:5",
    });

    expect(created).toMatchObject({
      startDate: "16/11/2026",
      startTime: "08:30",
      endDate: "05/12/2026",
      endTime: "09:05",
    });

    const updated = await useCases.updateTask({
      id: "t-digits",
      startDate: "17-11-2026",
      startTime: "08h45",
    });

    expect(updated).toMatchObject({
      startDate: "17/11/2026",
      startTime: "08:45",
      endDate: "05/12/2026",
      endTime: "09:05",
    });
  });
});

describe("TaskUseCases com categorias persistidas (issue #212)", () => {
  const setup = () => {
    const taskRepo = new MemoryTaskDataSource();
    const categories = new MemoryCategoryDataSource(taskRepo);
    let seq = 0;
    const useCases = new TaskUseCases(
      taskRepo,
      new MemoryDailyActivityDataSource(),
      createClock(),
      () => `t-${++seq}`,
      undefined,
      categories,
    );
    return { useCases, categories, taskRepo };
  };

  it("aceita categoria criada pelo estudante ao criar e ao editar a tarefa", async () => {
    const { useCases, categories } = setup();
    await categories.create(createCategoryFixture({ id: "c-1", name: "Física" }), "fisica");

    const created = await useCases.createTask({ title: "Lista de mecânica", category: "c-1" });
    const updated = await useCases.updateTask({ id: created.id, category: "music" });

    expect(created.category).toBe("c-1");
    expect(updated.category).toBe("music");
  });

  it("recusa categoria que não existe ao criar e ao editar, sem alterar a tarefa", async () => {
    const { useCases, taskRepo } = setup();
    const created = await useCases.createTask({ title: "Estudar", category: "music" });

    await expect(useCases.createTask({ title: "Outra", category: "inexistente" })).rejects.toThrow(
      "Categoria de tarefa inválida.",
    );
    await expect(useCases.updateTask({ id: created.id, category: "inexistente" })).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(await taskRepo.listAll()).toHaveLength(1);
    expect((await taskRepo.findById(created.id))?.category).toBe("music");
  });

  it("recusa uma categoria padrão que o estudante já excluiu", async () => {
    const { useCases, categories } = setup();
    await categories.delete("music", "2026-11-15T09:30:00-03:00");

    await expect(useCases.createTask({ title: "Violão", category: "music" })).rejects.toThrow(
      "Categoria de tarefa inválida.",
    );
  });

  it("permite remover a categoria da tarefa com null mesmo sem categorias disponíveis", async () => {
    const { useCases } = setup();
    const created = await useCases.createTask({ title: "Estudar", category: "music" });

    await expect(useCases.updateTask({ id: created.id, category: null })).resolves.toMatchObject({
      category: undefined,
    });
  });
});

describe("TaskUseCases — lembretes de tarefas agendadas (RF-0021, RN-0011, issue #211)", () => {
  const setupWithNotifications = (
    nowIso = "2026-11-15T09:00:00-03:00",
    initialPermission: "granted" | "denied" | "undetermined" = "undetermined",
    requestedPermission: "granted" | "denied" | "undetermined" = "granted",
  ) => {
    let currentNowIso = nowIso;
    const clock: IClockService = {
      now: () => currentNowIso,
      todayLocal: () => LocalDate.parse(currentNowIso.slice(0, 10)),
    };
    const taskRepo = new MemoryTaskDataSource();
    const activityRepo = new MemoryDailyActivityDataSource();
    const notifications = new FakeNotificationService(initialPermission, requestedPermission);
    let seq = 0;
    const useCases = new TaskUseCases(
      taskRepo,
      activityRepo,
      clock,
      () => `t-${++seq}`,
      undefined,
      undefined,
      notifications,
    );
    return {
      useCases,
      taskRepo,
      notifications,
      setNow: (nextIso: string) => {
        currentNowIso = nextIso;
      },
    };
  };

  it("agenda ao criar com início futuro, reagenda ao editar data/hora/título e cancela ao remover horário", async () => {
    const { useCases, notifications } = setupWithNotifications();

    const created = await useCases.createTask({
      title: "Estudar Álgebra",
      startDate: "15/11/2026",
      startTime: "14:00",
    });

    expect(await notifications.listScheduled()).toEqual([
      {
        id: `task-reminder:${created.id}`,
        title: TASK_REMINDER_NOTIFICATION_TITLE,
        body: 'Sua tarefa "Estudar Álgebra" começa agora. Bons estudos!',
        triggerAt: "2026-11-15T14:00:00-03:00",
        data: { route: "/tasks", taskId: created.id },
      },
    ]);

    await useCases.updateTask({
      id: created.id,
      title: "Revisar Álgebra Linear",
      startTime: "16:30",
    });

    expect(await notifications.listScheduled()).toEqual([
      {
        id: `task-reminder:${created.id}`,
        title: TASK_REMINDER_NOTIFICATION_TITLE,
        body: 'Sua tarefa "Revisar Álgebra Linear" começa agora. Bons estudos!',
        triggerAt: "2026-11-15T16:30:00-03:00",
        data: { route: "/tasks", taskId: created.id },
      },
    ]);

    await useCases.updateTask({ id: created.id, startDate: null, startTime: null });
    expect(await notifications.listScheduled()).toEqual([]);
  });

  it("cancela ao concluir, reagenda ao reabrir se ainda for futuro e não reagenda se o horário já passou", async () => {
    const { useCases, notifications, setNow } = setupWithNotifications("2026-11-15T09:00:00-03:00");

    const created = await useCases.createTask({
      title: "Praticar algoritmos",
      startDate: "15/11/2026",
      startTime: "14:00",
    });
    expect(await notifications.listScheduled()).toHaveLength(1);

    await useCases.toggleTaskCompletion(created.id);
    expect(await notifications.listScheduled()).toEqual([]);

    // Reabre ainda antes das 14:00 -> reagenda
    await useCases.toggleTaskCompletion(created.id);
    expect(await notifications.listScheduled()).toHaveLength(1);

    // Conclui novamente e tenta reabrir depois das 14:00 -> não agenda
    await useCases.toggleTaskCompletion(created.id);
    expect(await notifications.listScheduled()).toEqual([]);
    setNow("2026-11-15T15:00:00-03:00");
    await useCases.toggleTaskCompletion(created.id);
    expect(await notifications.listScheduled()).toEqual([]);
  });

  it("não agenda para tarefa sem horário, no passado ou vinculada a uma rotina, e cancela ao excluir", async () => {
    const { useCases, taskRepo, notifications } = setupWithNotifications("2026-11-15T09:00:00-03:00");

    await useCases.createTask({ title: "Sem horário" });
    await useCases.createTask({ title: "Já passou", startDate: "15/11/2026", startTime: "08:30" });
    await taskRepo.create(
      createTaskFixture({
        id: "routine-task",
        title: "Tarefa da rotina",
        startDate: "15/11/2026",
        startTime: "18:00",
        routineId: "routine-1",
        position: 0,
      }),
    );
    expect(await notifications.listScheduled()).toEqual([]);

    const future = await useCases.createTask({
      title: "Futura",
      startDate: "15/11/2026",
      startTime: "19:00",
    });
    expect(await notifications.listScheduled()).toHaveLength(1);

    await useCases.deleteTasks([future.id]);
    expect(await notifications.listScheduled()).toEqual([]);
  });

  it("reconcilia lembretes ao abrir: remove órfãos de tarefa, preserva outros escopos e agenda tarefas abertas futuras", async () => {
    const { useCases, taskRepo, notifications } = setupWithNotifications("2026-11-15T09:00:00-03:00", "granted");

    await taskRepo.create(
      createTaskFixture({
        id: "open-future",
        title: "Leitura",
        startDate: "15/11/2026",
        startTime: "17:00",
        completed: false,
      }),
    );
    await notifications.schedule({
      id: "task-reminder:orfa",
      title: "Antiga",
      body: "Antiga",
      triggerAt: "2026-11-15T12:00:00-03:00",
    });
    await notifications.schedule({
      id: "focus-cycle-end",
      title: "Ciclo concluído",
      body: "Pausa",
      triggerAt: "2026-11-15T09:25:00-03:00",
    });

    await useCases.reconcileScheduledReminders();

    expect((await notifications.listScheduled()).map((item) => item.id).sort()).toEqual([
      "focus-cycle-end",
      "task-reminder:open-future",
    ]);
  });

  it("salva a tarefa normalmente quando a permissão é negada e propaga o toque na notificação da aba Tarefas", async () => {
    const { useCases, taskRepo, notifications } = setupWithNotifications("2026-11-15T09:00:00-03:00", "denied", "denied");

    const created = await useCases.createTask({
      title: "Revisar História",
      startDate: "15/11/2026",
      startTime: "18:00",
    });

    expect(await taskRepo.findById(created.id)).toBeTruthy();
    expect(await notifications.listScheduled()).toEqual([]);
    expect(await useCases.ensureReminderPermission()).toBe("denied");

    const pressedIds: (string | undefined)[] = [];
    const unsubscribe = useCases.onTaskReminderPress((taskId) => pressedIds.push(taskId));
    notifications.emitNotificationResponse({ route: "/tasks", taskId: created.id });
    notifications.emitNotificationResponse({ route: "/other" });
    unsubscribe();
    notifications.emitNotificationResponse({ route: "/tasks", taskId: "ignored" });

    expect(pressedIds).toEqual([created.id]);
  });
});
