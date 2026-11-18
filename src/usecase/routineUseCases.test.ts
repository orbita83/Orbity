import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { LocalDate } from "@/model/entities/localDate";
import type { RoutineDetails } from "@/model/entities/routine";
import { ValidationError } from "@/model/errors";
import type { IClockService } from "@/model/services/iClockService";
import { RoutineUseCases } from "@/usecase/routineUseCases";

const MONDAY = "2026-11-16";
const TUESDAY = "2026-11-17";
const SATURDAY = "2026-11-21";

/** Relógio controlável: o dia muda entre os passos do teste. */
const createClock = (initial = MONDAY) => {
  let day = initial;
  const clock: IClockService = {
    now: () => `${day}T08:00:00-03:00`,
    todayLocal: () => LocalDate.parse(day),
  };
  return { clock, setDay: (next: string) => (day = next) };
};

const setup = (initialDay = MONDAY) => {
  const tasks = new MemoryTaskDataSource();
  const routines = new MemoryRoutineDataSource(tasks);
  const dailyActivity = new MemoryDailyActivityDataSource();
  const { clock, setDay } = createClock(initialDay);
  let seq = 0;
  const useCases = new RoutineUseCases(routines, tasks, dailyActivity, clock, () => `id-${++seq}`);
  return { useCases, tasks, dailyActivity, setDay };
};

const createMath = (useCases: RoutineUseCases) =>
  useCases.createRoutine({
    title: "Matemática",
    icon: "calculate",
    days: [1, 2, 3, 4, 5],
    tasks: ["Revisar", "Resolver", "Anotar"],
  });

const checked = (details: RoutineDetails) => details.tasks.filter((item) => item.checkedToday).map((item) => item.task.title);
const days = async (dailyActivity: MemoryDailyActivityDataSource) => (await dailyActivity.listDays()).map(String);

describe("RoutineUseCases", () => {
  it("RF-0007 e RF-0008: cria a rotina com as tarefas em ordem e a lista com o estado de hoje", async () => {
    const { useCases, tasks } = setup();
    const routine = await createMath(useCases);

    expect(routine).toMatchObject({ id: "id-1", title: "Matemática", icon: "calculate", days: [1, 2, 3, 4, 5] });
    expect((await tasks.listByRoutine(routine.id)).map((task) => [task.title, task.position])).toEqual([
      ["Revisar", 0],
      ["Resolver", 1],
      ["Anotar", 2],
    ]);
    expect(await useCases.listRoutines()).toEqual([{ routine, taskCount: 3, activeToday: true, doneToday: false }]);
  });

  it("rejeita a criação sem nome ou sem dia, sem gravar nada", async () => {
    const { useCases } = setup();
    await expect(useCases.createRoutine({ title: " ", days: [1], tasks: [] })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCases.createRoutine({ title: "Inglês", days: [], tasks: [] })).rejects.toBeInstanceOf(ValidationError);
    expect(await useCases.listRoutines()).toEqual([]);
  });

  it("RN-0004 e RN-0002: concluir marca todas as tarefas e registra o dia na sequência", async () => {
    const { useCases, dailyActivity } = setup();
    const routine = await createMath(useCases);

    const details = await useCases.completeOccurrence(routine.id);

    expect(details.doneToday).toBe(true);
    expect(checked(details)).toEqual(["Revisar", "Resolver", "Anotar"]);
    expect(await days(dailyActivity)).toEqual([MONDAY]);
  });

  it("EC-0005: tarefas já marcadas continuam marcadas ao concluir", async () => {
    const { useCases, dailyActivity } = setup();
    const routine = await createMath(useCases);
    const [first] = (await useCases.getRoutine(routine.id))!.tasks;

    const partial = await useCases.toggleRoutineTask(routine.id, first.task.id);
    expect(checked(partial)).toEqual(["Revisar"]);
    // RN-0002 e D1: marcar uma tarefa da rotina não conta sozinha para a sequência.
    expect(await days(dailyActivity)).toEqual([]);
    expect(partial.doneToday).toBe(false);

    const details = await useCases.completeOccurrence(routine.id);
    expect(checked(details)).toEqual(["Revisar", "Resolver", "Anotar"]);
  });

  it("R3 e EC-0006: desmarcar uma tarefa depois de concluir mantém a rotina concluída", async () => {
    const { useCases } = setup();
    const routine = await createMath(useCases);
    const completed = await useCases.completeOccurrence(routine.id);

    const details = await useCases.toggleRoutineTask(routine.id, completed.tasks[1].task.id);

    expect(checked(details)).toEqual(["Revisar", "Anotar"]);
    expect(details.doneToday).toBe(true);
  });

  it("R3: marcar todas as tarefas uma a uma não conclui a rotina sozinha", async () => {
    const { useCases } = setup();
    const routine = await createMath(useCases);
    let details = (await useCases.getRoutine(routine.id))!;
    for (const item of details.tasks) {
      details = await useCases.toggleRoutineTask(routine.id, item.task.id);
    }

    expect(checked(details)).toHaveLength(3);
    expect(details.doneToday).toBe(false);
  });

  it("RF-0011 CA-05: concluir de novo no mesmo dia não faz nada", async () => {
    const { useCases, dailyActivity } = setup();
    const routine = await createMath(useCases);
    await useCases.completeOccurrence(routine.id);
    const again = await useCases.completeOccurrence(routine.id);

    expect(again.doneToday).toBe(true);
    expect(await days(dailyActivity)).toEqual([MONDAY]);
  });

  it("R4 e RF-0014 CA-04: Desmarcar todos reabre a ocorrência e o dia continua na sequência", async () => {
    const { useCases, dailyActivity } = setup();
    const routine = await createMath(useCases);
    await useCases.completeOccurrence(routine.id);

    const details = await useCases.reopenOccurrence(routine.id);

    expect(details.doneToday).toBe(false);
    expect(checked(details)).toEqual([]);
    expect(await days(dailyActivity)).toEqual([MONDAY]);
  });

  it("R2 e RF-0011 CA-04: no dia seguinte a rotina recomeça desmarcada", async () => {
    const { useCases, setDay } = setup();
    const routine = await createMath(useCases);
    await useCases.completeOccurrence(routine.id);

    setDay(TUESDAY);
    const details = (await useCases.getRoutine(routine.id))!;

    expect(details.doneToday).toBe(false);
    expect(checked(details)).toEqual([]);
  });

  it("R6 e RF-0012 CA-04: fora dos dias configurados, a rotina aparece mas não pode ser concluída", async () => {
    const { useCases, dailyActivity } = setup(SATURDAY);
    const routine = await createMath(useCases);
    const [first] = (await useCases.getRoutine(routine.id))!.tasks;

    expect((await useCases.listRoutines())[0]).toMatchObject({ activeToday: false, doneToday: false });
    await expect(useCases.completeOccurrence(routine.id)).rejects.toThrow(new ValidationError("Esta rotina não é de hoje."));
    await expect(useCases.toggleRoutineTask(routine.id, first.task.id)).rejects.toBeInstanceOf(ValidationError);
    expect(await days(dailyActivity)).toEqual([]);
  });

  it("R7: excluir esconde a rotina, e desfazer a devolve com o estado do dia", async () => {
    const { useCases, dailyActivity } = setup();
    const routine = await createMath(useCases);
    await useCases.completeOccurrence(routine.id);

    await useCases.deleteRoutine(routine.id);
    expect(await useCases.listRoutines()).toEqual([]);
    expect(await useCases.getRoutine(routine.id)).toBeNull();
    // A sequência não muda ao excluir (protótipo 3.3).
    expect(await days(dailyActivity)).toEqual([MONDAY]);

    await useCases.restoreRoutine(routine.id);
    expect((await useCases.getRoutine(routine.id))?.doneToday).toBe(true);
  });

  it("a alça sobe a tarefa uma posição, e a nova ordem fica salva", async () => {
    const { useCases } = setup(SATURDAY);
    const routine = await createMath(useCases);

    const details = await useCases.moveRoutineTaskUp(routine.id, 2);
    expect(details.tasks.map((item) => item.task.title)).toEqual(["Revisar", "Anotar", "Resolver"]);

    const unchanged = await useCases.moveRoutineTaskUp(routine.id, 0);
    expect(unchanged.tasks.map((item) => item.task.title)).toEqual(["Revisar", "Anotar", "Resolver"]);
    expect((await useCases.getRoutine(routine.id))!.tasks.map((item) => item.task.position)).toEqual([0, 1, 2]);
  });

  describe("#137: editar rotina (RF-0009, UC-0007)", () => {
    const draftsOf = (details: RoutineDetails) => details.tasks.map(({ task }) => ({ id: task.id, title: task.title }));

    it("altera os dados e as tarefas: renomeia, reordena, adiciona e remove", async () => {
      const { useCases, setDay } = setup();
      const routine = await createMath(useCases);
      const [revisar, resolver, anotar] = draftsOf((await useCases.getRoutine(routine.id))!);
      setDay(TUESDAY);

      const details = await useCases.updateRoutine({
        id: routine.id,
        title: "  Cálculo ",
        description: "Derivadas",
        icon: "science",
        days: [2, 4],
        tasks: [anotar, { ...revisar, title: "Revisar teoria" }, { title: "Listar dúvidas" }],
      });

      expect(details.routine).toMatchObject({
        title: "Cálculo",
        description: "Derivadas",
        icon: "science",
        days: [2, 4],
        createdAt: routine.createdAt,
        updatedAt: `${TUESDAY}T08:00:00-03:00`,
      });
      expect(details.tasks.map(({ task }) => [task.title, task.position])).toEqual([
        ["Anotar", 0],
        ["Revisar teoria", 1],
        ["Listar dúvidas", 2],
      ]);
      expect(details.tasks.some(({ task }) => task.id === resolver.id)).toBe(false);
      expect((await useCases.listRoutines())[0]).toMatchObject({ taskCount: 3, routine: { title: "Cálculo" } });
    });

    it("rotina concluída hoje continua concluída: a tarefa nova entra desmarcada e a sequência não muda", async () => {
      const { useCases, dailyActivity } = setup();
      const routine = await createMath(useCases);
      const before = await useCases.completeOccurrence(routine.id);
      const [revisar, resolver] = draftsOf(before);

      const details = await useCases.updateRoutine({
        id: routine.id,
        title: "Matemática",
        days: [1, 2, 3, 4, 5],
        tasks: [{ ...revisar, title: "Revisar tudo" }, resolver, { title: "Nova" }],
      });

      expect(details.doneToday).toBe(true);
      expect(checked(details)).toEqual(["Revisar tudo", "Resolver"]);
      expect(await days(dailyActivity)).toEqual([MONDAY]);
    });

    it("tirar o dia de hoje de uma rotina concluída mantém a conclusão de hoje", async () => {
      const { useCases } = setup();
      const routine = await createMath(useCases);
      const before = await useCases.completeOccurrence(routine.id);

      const details = await useCases.updateRoutine({ id: routine.id, title: "Matemática", days: [6], tasks: draftsOf(before) });

      expect(details).toMatchObject({ activeToday: false, doneToday: true });
    });

    it("pode editar fora dos dias da rotina", async () => {
      const { useCases } = setup(SATURDAY);
      const routine = await createMath(useCases);

      const details = await useCases.updateRoutine({ id: routine.id, title: "Fim de semana", days: [0, 6], tasks: [] });

      expect(details).toMatchObject({ activeToday: true, taskCount: 0 });
    });

    it("recusa nome vazio, nenhum dia, tarefa de outra rotina e rotina inexistente, sem gravar nada", async () => {
      const { useCases } = setup();
      const routine = await createMath(useCases);
      const other = await useCases.createRoutine({ title: "Inglês", days: [1], tasks: ["Ler"] });
      const [foreign] = draftsOf((await useCases.getRoutine(other.id))!);
      const base = { id: routine.id, title: "Matemática", days: [1], tasks: [] };

      await expect(useCases.updateRoutine({ ...base, title: " " })).rejects.toThrow(new ValidationError("Dê um nome para a rotina."));
      await expect(useCases.updateRoutine({ ...base, days: [] })).rejects.toThrow(new ValidationError("Escolha pelo menos um dia."));
      await expect(useCases.updateRoutine({ ...base, tasks: [foreign] })).rejects.toThrow(
        new ValidationError("Tarefa não encontrada nesta rotina."),
      );
      await expect(useCases.updateRoutine({ ...base, id: "nada" })).rejects.toThrow(new ValidationError("Rotina não encontrada."));
      expect((await useCases.getRoutine(routine.id))!.tasks).toHaveLength(3);
      expect((await useCases.getRoutine(other.id))!.tasks).toHaveLength(1);
    });
  });

  it("rotina inexistente: o detalhe é nulo e as ações avisam", async () => {
    const { useCases } = setup();
    expect(await useCases.getRoutine("nada")).toBeNull();
    await expect(useCases.completeOccurrence("nada")).rejects.toThrow(new ValidationError("Rotina não encontrada."));
  });
});
