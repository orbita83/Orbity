import { createCategoryFixture } from "@/model/__fixtures__/category.fixture";
import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { DEFAULT_CATEGORY_IDS } from "@/model/entities/category";
import type { ICategoryDataSource } from "@/model/datasources/iCategoryDataSource";
import type { IRoutineDataSource } from "@/model/datasources/iRoutineDataSource";
import type { ITaskDataSource } from "@/model/datasources/iTaskDataSource";

export type CategoryDataSourceHarness = {
  dataSource: ICategoryDataSource;
  /** Tarefas e rotinas do mesmo armazenamento: a exclusão de categoria mexe nelas (RN-0009). */
  tasks: ITaskDataSource;
  routines: IRoutineDataSource;
  reopen?: () => Promise<ICategoryDataSource>;
  cleanup?: () => void;
};

const CHANGED_AT = "2026-11-20T10:00:00-03:00";

/** Suíte de contrato que toda implementação de ICategoryDataSource deve cumprir (issue #212). */
export function describeCategoryDataSourceContract(
  name: string,
  factory: () => Promise<CategoryDataSourceHarness>,
): void {
  describe(`${name} (contrato ICategoryDataSource)`, () => {
    let harness: CategoryDataSourceHarness;

    beforeEach(async () => {
      harness = await factory();
    });

    afterEach(() => {
      harness.cleanup?.();
    });

    it("começa com as seis categorias padrão, na ordem, sem nome próprio e com o ícone do próprio id", async () => {
      const categories = await harness.dataSource.listAll();

      expect(categories.map((category) => category.id)).toEqual([...DEFAULT_CATEGORY_IDS]);
      for (const category of categories) {
        expect(category.name).toBeUndefined();
        expect(category.icon).toBe(category.id);
        expect(category.isDefault).toBe(true);
      }
    });

    it("encontra categoria por id e devolve null quando ela não existe", async () => {
      expect((await harness.dataSource.findById("music"))?.id).toBe("music");
      expect(await harness.dataSource.findById("inexistente")).toBeNull();
    });

    it("cria categoria e a lista depois das padrão, na ordem de criação", async () => {
      await harness.dataSource.create(createCategoryFixture({ id: "c-1", name: "Física" }), "fisica");
      await harness.dataSource.create(createCategoryFixture({ id: "c-2", name: "Química" }), "quimica");

      const ids = (await harness.dataSource.listAll()).map((category) => category.id);

      expect(ids).toEqual([...DEFAULT_CATEGORY_IDS, "c-1", "c-2"]);
      expect(await harness.dataSource.findById("c-1")).toEqual(createCategoryFixture({ id: "c-1", name: "Física" }));
    });

    it("procura categoria pela chave de nome", async () => {
      await harness.dataSource.create(createCategoryFixture({ id: "c-1", name: "Física" }), "fisica");

      expect((await harness.dataSource.findByNameKey("fisica"))?.id).toBe("c-1");
      expect(await harness.dataSource.findByNameKey("quimica")).toBeNull();
    });

    it("renomeia e troca o ícone mantendo a posição na lista e a chave de nome atualizada", async () => {
      await harness.dataSource.create(createCategoryFixture({ id: "c-1", name: "Física" }), "fisica");
      await harness.dataSource.create(createCategoryFixture({ id: "c-2", name: "Química" }), "quimica");

      await harness.dataSource.update(
        createCategoryFixture({ id: "c-1", name: "Física 1", icon: "bolt", updatedAt: CHANGED_AT }),
        "fisica 1",
      );

      const updated = await harness.dataSource.findById("c-1");
      expect(updated).toEqual(
        createCategoryFixture({ id: "c-1", name: "Física 1", icon: "bolt", updatedAt: CHANGED_AT }),
      );
      expect(await harness.dataSource.findByNameKey("fisica")).toBeNull();
      expect((await harness.dataSource.findByNameKey("fisica 1"))?.id).toBe("c-1");
      expect((await harness.dataSource.listAll()).slice(-2).map((category) => category.id)).toEqual(["c-1", "c-2"]);
    });

    it("renomeia uma categoria padrão e a mantém como padrão", async () => {
      const music = await harness.dataSource.findById("music");
      await harness.dataSource.update({ ...music!, name: "Violão", updatedAt: CHANGED_AT }, "violao");

      const renamed = await harness.dataSource.findById("music");
      expect(renamed).toMatchObject({ id: "music", name: "Violão", isDefault: true });
      expect((await harness.dataSource.listAll()).map((category) => category.id)).toEqual([...DEFAULT_CATEGORY_IDS]);
    });

    it("aceita voltar uma categoria padrão ao nome original (chave nula)", async () => {
      const music = await harness.dataSource.findById("music");
      await harness.dataSource.update({ ...music!, name: "Violão" }, "violao");
      await harness.dataSource.update({ ...music!, name: undefined }, null);

      expect((await harness.dataSource.findById("music"))?.name).toBeUndefined();
      expect(await harness.dataSource.findByNameKey("violao")).toBeNull();
    });

    it("excluir remove a categoria e deixa as tarefas dela sem categoria, sem apagar nenhuma tarefa", async () => {
      await harness.tasks.create(createTaskFixture({ id: "t-1", category: "music" }));
      await harness.tasks.create(createTaskFixture({ id: "t-2", category: "music" }));
      await harness.tasks.create(createTaskFixture({ id: "t-3", category: "reading" }));
      await harness.tasks.create(createTaskFixture({ id: "t-4", category: undefined }));

      await harness.dataSource.delete("music", CHANGED_AT);

      expect(await harness.dataSource.findById("music")).toBeNull();
      const tasks = await harness.tasks.listAll();
      expect(tasks).toHaveLength(4);
      expect(tasks.find((task) => task.id === "t-1")).toMatchObject({ category: undefined, updatedAt: CHANGED_AT });
      expect(tasks.find((task) => task.id === "t-2")?.category).toBeUndefined();
      expect(tasks.find((task) => task.id === "t-3")).toMatchObject({
        category: "reading",
        updatedAt: createTaskFixture().updatedAt,
      });
      expect(tasks.find((task) => task.id === "t-4")?.category).toBeUndefined();
    });

    it("excluir devolve ao ícone geral as rotinas da categoria, ativas e excluídas, sem apagar nenhuma", async () => {
      await harness.routines.create(createRoutineFixture({ id: "r-1", icon: "music" }), []);
      await harness.routines.create(createRoutineFixture({ id: "r-2", icon: "music" }), []);
      await harness.routines.create(createRoutineFixture({ id: "r-3", icon: "reading" }), []);
      await harness.routines.markDeleted("r-2", CHANGED_AT);

      await harness.dataSource.delete("music", CHANGED_AT);

      expect(await harness.routines.findById("r-1")).toMatchObject({ icon: "general", updatedAt: CHANGED_AT });
      expect(await harness.routines.findById("r-3")).toMatchObject({ icon: "reading" });
      await harness.routines.restore("r-2");
      expect(await harness.routines.findById("r-2")).toMatchObject({ icon: "general" });
      expect(await harness.routines.listActive()).toHaveLength(3);
    });

    it("excluir categoria criada pelo estudante também limpa as referências", async () => {
      await harness.dataSource.create(createCategoryFixture({ id: "c-1", name: "Física" }), "fisica");
      await harness.tasks.create(createTaskFixture({ id: "t-1", category: "c-1" }));
      await harness.routines.create(createRoutineFixture({ id: "r-1", icon: "c-1" }), []);

      await harness.dataSource.delete("c-1", CHANGED_AT);

      expect((await harness.tasks.findById("t-1"))?.category).toBeUndefined();
      expect((await harness.routines.findById("r-1"))?.icon).toBe("general");
      expect(await harness.dataSource.findByNameKey("fisica")).toBeNull();
    });

    it("excluir um id inexistente não gera erro nem altera nada", async () => {
      await harness.tasks.create(createTaskFixture({ id: "t-1", category: "music" }));

      await expect(harness.dataSource.delete("inexistente", CHANGED_AT)).resolves.toBeUndefined();

      expect(await harness.dataSource.listAll()).toHaveLength(DEFAULT_CATEGORY_IDS.length);
      expect((await harness.tasks.findById("t-1"))?.category).toBe("music");
    });

    it("libera o nome de uma categoria excluída para outra", async () => {
      await harness.dataSource.create(createCategoryFixture({ id: "c-1", name: "Física" }), "fisica");
      await harness.dataSource.delete("c-1", CHANGED_AT);

      await expect(
        harness.dataSource.create(createCategoryFixture({ id: "c-2", name: "Física" }), "fisica"),
      ).resolves.toBeUndefined();
    });

    it("devolve categorias congeladas", async () => {
      const [first] = await harness.dataSource.listAll();
      expect(Object.isFrozen(first)).toBe(true);
    });

    it("mantém as categorias ao reabrir o armazenamento", async () => {
      if (!harness.reopen) return;
      await harness.dataSource.create(createCategoryFixture({ id: "c-1", name: "Física" }), "fisica");
      await harness.dataSource.delete("languages", CHANGED_AT);

      const reopened = await harness.reopen();

      const ids = (await reopened.listAll()).map((category) => category.id);
      expect(ids).toEqual(["mathematics", "reading", "science", "programming", "music", "c-1"]);
      expect((await reopened.findByNameKey("fisica"))?.id).toBe("c-1");
    });
  });
}
