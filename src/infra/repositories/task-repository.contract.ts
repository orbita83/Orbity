import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import type { ITaskRepository } from "@/model/repositories/i-task-repository";

/** Suíte compartilhada por InMemoryTaskRepository e SqliteTaskRepository. */
export function runTaskRepositoryContractTests(createRepository: () => Promise<ITaskRepository>): void {
  describe("contrato ITaskRepository", () => {
    it("começa vazio", async () => {
      const repo = await createRepository();
      expect(await repo.listAll()).toEqual([]);
      expect(await repo.findById("inexistente")).toBeNull();
    });

    it("cria, busca por id e lista da tarefa mais recente para a mais antiga", async () => {
      const repo = await createRepository();
      const older = createTaskFixture({
        id: "t1",
        title: "Primeira",
        createdAt: "2026-11-14T08:00:00-03:00",
        updatedAt: "2026-11-14T08:00:00-03:00",
      });
      const newer = createTaskFixture({
        id: "t2",
        title: "Segunda",
        description: undefined,
        category: "programacao",
        createdAt: "2026-11-15T09:00:00-03:00",
        updatedAt: "2026-11-15T09:00:00-03:00",
      });

      await repo.create(older);
      await repo.create(newer);

      expect(await repo.findById("t1")).toEqual(older);
      expect((await repo.listAll()).map((item) => item.id)).toEqual(["t2", "t1"]);
    });

    it("desempata pela ordem inversa de inserção quando createdAt é idêntico", async () => {
      const repo = await createRepository();
      const first = createTaskFixture({ id: "t1", createdAt: "2026-11-15T10:00:00-03:00" });
      const second = createTaskFixture({ id: "t2", createdAt: "2026-11-15T10:00:00-03:00" });

      await repo.create(first);
      await repo.create(second);

      expect((await repo.listAll()).map((item) => item.id)).toEqual(["t2", "t1"]);
    });

    it("atualiza uma tarefa existente e preserva os demais campos", async () => {
      const repo = await createRepository();
      const initial = createTaskFixture({ id: "t1", completed: false, pinned: false });
      await repo.create(initial);

      const updated = createTaskFixture({
        ...initial,
        completed: true,
        pinned: true,
        updatedAt: "2026-11-15T12:00:00-03:00",
      });
      await repo.update(updated);

      expect(await repo.findById("t1")).toEqual(updated);
    });

    it("atualiza várias tarefas em lote e ignora listas vazias", async () => {
      const repo = await createRepository();
      const first = createTaskFixture({ id: "t1", pinned: false });
      const second = createTaskFixture({ id: "t2", pinned: false });
      await repo.create(first);
      await repo.create(second);

      await repo.updateMany([]);
      await repo.updateMany([
        { ...first, pinned: true, updatedAt: "2026-11-15T13:00:00-03:00" },
        { ...second, pinned: true, updatedAt: "2026-11-15T13:00:00-03:00" },
      ]);

      const stored = await repo.listAll();
      expect(stored.every((task) => task.pinned)).toBe(true);
    });

    it("exclui várias tarefas pelo id e ignora listas vazias", async () => {
      const repo = await createRepository();
      const first = createTaskFixture({ id: "t1" });
      const second = createTaskFixture({ id: "t2" });
      const third = createTaskFixture({ id: "t3" });
      await repo.create(first);
      await repo.create(second);
      await repo.create(third);

      await repo.deleteMany([]);
      await repo.deleteMany(["t1", "t3"]);

      expect((await repo.listAll()).map((task) => task.id)).toEqual(["t2"]);
      expect(await repo.findById("t1")).toBeNull();
    });

    it("rotinas.md R1: guarda o vínculo com a rotina e lista as tarefas dela pela posição", async () => {
      const repo = await createRepository();
      const standalone = createTaskFixture({ id: "avulsa" });
      const second = createTaskFixture({ id: "r2", routineId: "routine-1", position: 1 });
      const first = createTaskFixture({ id: "r1", routineId: "routine-1", position: 0 });
      const other = createTaskFixture({ id: "x1", routineId: "routine-2", position: 0 });
      for (const task of [standalone, second, first, other]) {
        await repo.create(task);
      }

      expect((await repo.listByRoutine("routine-1")).map((task) => task.id)).toEqual(["r1", "r2"]);
      expect(await repo.findById("avulsa")).toEqual(standalone);
      expect(await repo.findById("r1")).toEqual(first);

      await repo.updateMany([
        { ...first, position: 1 },
        { ...second, position: 0 },
      ]);
      expect((await repo.listByRoutine("routine-1")).map((task) => task.id)).toEqual(["r2", "r1"]);
    });
  });
}
