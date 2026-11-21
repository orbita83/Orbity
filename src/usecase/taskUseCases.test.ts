import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { LocalDate } from "@/model/entities/localDate";
import { ValidationError } from "@/model/errors";
import type { IClockService } from "@/model/services/iClockService";
import { TaskUseCases } from "@/usecase/taskUseCases";

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

    await expect(useCases.createTask({ title: "  " })).rejects.toThrow(ValidationError);
    await expect(useCases.createTask({ title: "Estudar", startDate: "31/02/2026" })).rejects.toThrow(ValidationError);
    expect(await taskRepo.listAll()).toEqual([]);
  });

  it("concluir tarefa registra o dia local na sequência e reabrir preserva o dia registrado", async () => {
    const initial = createTaskFixture({ id: "t1", completed: false });
    const taskRepo = new MemoryTaskDataSource([initial]);
    const activityRepo = new MemoryDailyActivityDataSource();
    const useCases = new TaskUseCases(taskRepo, activityRepo, createClock("2026-11-15T18:00:00-03:00", "2026-11-15"));

    const completed = await useCases.toggleTaskCompletion("t1");
    expect(completed.completed).toBe(true);
    expect((await activityRepo.listDays()).map(String)).toEqual(["2026-11-15"]);

    const reopened = await useCases.toggleTaskCompletion("t1");
    expect(reopened.completed).toBe(false);
    expect((await activityRepo.listDays()).map(String)).toEqual(["2026-11-15"]);
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
