import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { LocalDate } from "@/model/entities/local-date";
import type { IRoutineRepository } from "@/model/repositories/i-routine-repository";
import type { ITaskRepository } from "@/model/repositories/i-task-repository";

export type RoutineRepositoryHarness = {
  routines: IRoutineRepository;
  tasks: ITaskRepository;
};

const MONDAY = LocalDate.parse("2026-11-16");
const TUESDAY = LocalDate.parse("2026-11-17");
const AT = "2026-11-16T08:00:00-03:00";

const routineTasks = () => [
  createTaskFixture({ id: "t1", title: "Revisar", routineId: "routine-1", position: 0 }),
  createTaskFixture({ id: "t2", title: "Resolver", routineId: "routine-1", position: 1 }),
];

/** Suíte única que toda implementação de IRoutineRepository deve passar (rotinas.md). */
export function runRoutineRepositoryContractTests(createHarness: () => Promise<RoutineRepositoryHarness>): void {
  describe("contrato IRoutineRepository", () => {
    it("começa sem rotinas", async () => {
      const { routines } = await createHarness();
      expect(await routines.listActive()).toEqual([]);
      expect(await routines.findById("routine-1")).toBeNull();
    });

    it("RF-0007: cria a rotina com as tarefas dela e lista da mais antiga para a mais nova", async () => {
      const { routines, tasks } = await createHarness();
      const first = createRoutineFixture();
      const second = createRoutineFixture({
        id: "routine-2",
        title: "Inglês",
        description: undefined,
        icon: "translate",
        days: [1, 3, 5],
        createdAt: "2026-11-16T09:00:00-03:00",
      });

      await routines.create(first, routineTasks());
      await routines.create(second, []);

      expect(await routines.listActive()).toEqual([first, second]);
      expect(await routines.findById("routine-2")).toEqual(second);
      expect((await tasks.listByRoutine("routine-1")).map((task) => task.id)).toEqual(["t1", "t2"]);
    });

    it("R7: excluir esconde a rotina, e restaurar a devolve", async () => {
      const { routines } = await createHarness();
      const routine = createRoutineFixture();
      await routines.create(routine, []);

      await routines.markDeleted(routine.id, AT);
      expect(await routines.listActive()).toEqual([]);
      expect(await routines.findById(routine.id)).toBeNull();

      await routines.restore(routine.id);
      expect(await routines.findById(routine.id)).toEqual(routine);
    });

    it("RN-0004 e EC-0005: concluir marca as tarefas do dia sem duplicar o que já estava marcado", async () => {
      const { routines } = await createHarness();
      await routines.create(createRoutineFixture(), routineTasks());

      await routines.setTaskCheck("routine-1", "t1", MONDAY, true);
      await routines.completeOccurrence("routine-1", MONDAY, ["t1", "t2"], AT);
      await routines.completeOccurrence("routine-1", MONDAY, ["t1", "t2"], AT);

      expect(await routines.listCompletedOn(MONDAY)).toEqual(["routine-1"]);
      expect((await routines.listTaskChecks("routine-1", MONDAY)).sort()).toEqual(["t1", "t2"]);
    });

    it("R2: a ocorrência e as marcações valem só para o dia", async () => {
      const { routines } = await createHarness();
      await routines.create(createRoutineFixture(), routineTasks());
      await routines.completeOccurrence("routine-1", MONDAY, ["t1", "t2"], AT);

      expect(await routines.listCompletedOn(TUESDAY)).toEqual([]);
      expect(await routines.listTaskChecks("routine-1", TUESDAY)).toEqual([]);
    });

    it("R3: desmarcar uma tarefa mantém a ocorrência concluída", async () => {
      const { routines } = await createHarness();
      await routines.create(createRoutineFixture(), routineTasks());
      await routines.completeOccurrence("routine-1", MONDAY, ["t1", "t2"], AT);

      await routines.setTaskCheck("routine-1", "t2", MONDAY, false);

      expect(await routines.listTaskChecks("routine-1", MONDAY)).toEqual(["t1"]);
      expect(await routines.listCompletedOn(MONDAY)).toEqual(["routine-1"]);
    });

    it("R4: reabrir desfaz a ocorrência e as marcações só daquele dia", async () => {
      const { routines } = await createHarness();
      await routines.create(createRoutineFixture(), routineTasks());
      await routines.completeOccurrence("routine-1", MONDAY, ["t1", "t2"], AT);
      await routines.completeOccurrence("routine-1", TUESDAY, ["t1"], AT);

      await routines.reopenOccurrence("routine-1", MONDAY);

      expect(await routines.listCompletedOn(MONDAY)).toEqual([]);
      expect(await routines.listTaskChecks("routine-1", MONDAY)).toEqual([]);
      expect(await routines.listCompletedOn(TUESDAY)).toEqual(["routine-1"]);
      expect(await routines.listTaskChecks("routine-1", TUESDAY)).toEqual(["t1"]);
    });
  });
}
