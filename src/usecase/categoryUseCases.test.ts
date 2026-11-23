import { MemoryCategoryDataSource } from "@/infra/datasources/memoryCategoryDataSource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { DEFAULT_CATEGORY_IDS } from "@/model/entities/category";
import { LocalDate } from "@/model/entities/localDate";
import { DataSourceError, ValidationError } from "@/model/errors";
import type { ICategoryDataSource } from "@/model/datasources/iCategoryDataSource";
import type { IClockService } from "@/model/services/iClockService";
import { CategoryUseCases } from "@/usecase/categoryUseCases";

const NOW = "2026-11-15T09:30:00-03:00";

const createClock = (nowIso = NOW): IClockService => ({
  now: () => nowIso,
  todayLocal: () => LocalDate.parse("2026-11-15"),
});

function createUseCases(dataSource?: ICategoryDataSource) {
  const tasks = new MemoryTaskDataSource();
  const routines = new MemoryRoutineDataSource(tasks);
  const categories = dataSource ?? new MemoryCategoryDataSource(tasks, routines);
  let sequence = 0;
  const useCases = new CategoryUseCases(categories, createClock(), () => `c-${++sequence}`);
  return { useCases, categories, tasks, routines };
}

describe("CategoryUseCases.listCategories", () => {
  it("lista as seis categorias padrão num banco novo", async () => {
    const { useCases } = createUseCases();

    const categories = await useCases.listCategories();

    expect(categories.map((category) => category.id)).toEqual([...DEFAULT_CATEGORY_IDS]);
  });
});

describe("CategoryUseCases.createCategory", () => {
  it("cria a categoria com id gerado, nome normalizado, datas do relógio e sem marcar como padrão", async () => {
    const { useCases } = createUseCases();

    const category = await useCases.createCategory({ name: "  Física   moderna ", icon: "science" });

    expect(category).toEqual({
      id: "c-1",
      name: "Física moderna",
      icon: "science",
      isDefault: false,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(Object.isFrozen(category)).toBe(true);
    expect((await useCases.listCategories()).at(-1)).toEqual(category);
  });

  it.each([
    ["nome vazio", { name: "   ", icon: "science" }, "Informe o nome da categoria."],
    ["nome grande demais", { name: "a".repeat(25), icon: "science" }, "O nome da categoria pode ter até 24 caracteres."],
    ["ícone inválido", { name: "Física", icon: "xyz" }, "Ícone de categoria inválido."],
  ])("recusa %s e não salva nada", async (_label, input, message) => {
    const { useCases } = createUseCases();

    await expect(useCases.createCategory(input)).rejects.toThrow(message);
    await expect(useCases.createCategory(input)).rejects.toBeInstanceOf(ValidationError);
    expect(await useCases.listCategories()).toHaveLength(DEFAULT_CATEGORY_IDS.length);
  });

  it("recusa nome igual ao de outra categoria, ignorando maiúsculas e acentos", async () => {
    const { useCases } = createUseCases();
    await useCases.createCategory({ name: "Música clássica", icon: "music" });

    await expect(useCases.createCategory({ name: "  MUSICA   CLASSICA ", icon: "star" })).rejects.toThrow(
      "Já existe uma categoria com esse nome.",
    );
    expect(await useCases.listCategories()).toHaveLength(DEFAULT_CATEGORY_IDS.length + 1);
  });

  it("indica o campo do nome quando ele é repetido", async () => {
    const { useCases } = createUseCases();
    await useCases.createCategory({ name: "Física", icon: "science" });

    const error = await useCases.createCategory({ name: "física", icon: "science" }).catch((caught) => caught);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.field).toBe("name");
  });

  it("deixa criar um nome que é só o rótulo de uma padrão não renomeada (Q1 em categorias.md)", async () => {
    const { useCases } = createUseCases();

    await expect(useCases.createCategory({ name: "Matemática", icon: "mathematics" })).resolves.toMatchObject({
      name: "Matemática",
    });
  });

  it("reaproveita o nome de uma categoria excluída", async () => {
    const { useCases } = createUseCases();
    const created = await useCases.createCategory({ name: "Física", icon: "science" });
    await useCases.deleteCategory(created.id);

    await expect(useCases.createCategory({ name: "Física", icon: "science" })).resolves.toMatchObject({ id: "c-2" });
  });

  it("repassa a falha de armazenamento como DataSourceError", async () => {
    const failing: ICategoryDataSource = {
      listAll: jest.fn(),
      findById: jest.fn(),
      findByNameKey: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockRejectedValue(new DataSourceError()),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const { useCases } = createUseCases(failing);

    await expect(useCases.createCategory({ name: "Física", icon: "science" })).rejects.toBeInstanceOf(DataSourceError);
  });
});

describe("CategoryUseCases.renameCategory", () => {
  it("renomeia uma categoria criada pelo estudante e atualiza a data", async () => {
    const { useCases, categories } = createUseCases();
    const created = await useCases.createCategory({ name: "Física", icon: "science" });
    const later = new CategoryUseCases(categories, createClock("2026-11-16T10:00:00-03:00"));

    const renamed = await later.renameCategory({ id: created.id, name: "  Física  1 " });

    expect(renamed).toEqual({ ...created, name: "Física 1", updatedAt: "2026-11-16T10:00:00-03:00" });
  });

  it("renomeia uma categoria padrão, que continua sendo padrão", async () => {
    const { useCases } = createUseCases();

    const renamed = await useCases.renameCategory({ id: "music", name: "Violão" });

    expect(renamed).toMatchObject({ id: "music", name: "Violão", isDefault: true, icon: "music" });
  });

  it("permite renomear para o mesmo nome da própria categoria, mudando só a grafia", async () => {
    const { useCases } = createUseCases();
    const created = await useCases.createCategory({ name: "Fisica", icon: "science" });

    await expect(useCases.renameCategory({ id: created.id, name: "Física" })).resolves.toMatchObject({
      name: "Física",
    });
  });

  it("recusa nome já usado por outra categoria", async () => {
    const { useCases } = createUseCases();
    await useCases.createCategory({ name: "Física", icon: "science" });
    const other = await useCases.createCategory({ name: "Química", icon: "science" });

    await expect(useCases.renameCategory({ id: other.id, name: "FISICA" })).rejects.toThrow(
      "Já existe uma categoria com esse nome.",
    );
  });

  it("recusa nome inválido e categoria inexistente", async () => {
    const { useCases } = createUseCases();

    await expect(useCases.renameCategory({ id: "music", name: " " })).rejects.toThrow("Informe o nome da categoria.");
    await expect(useCases.renameCategory({ id: "music", name: "a".repeat(25) })).rejects.toThrow("até 24 caracteres");
    await expect(useCases.renameCategory({ id: "inexistente", name: "Física" })).rejects.toThrow(
      "Categoria não encontrada.",
    );
  });
});

describe("CategoryUseCases.changeCategoryIcon", () => {
  it("troca o ícone sem perder o nome e liberando o mesmo nome para a checagem de duplicidade", async () => {
    const { useCases } = createUseCases();
    const created = await useCases.createCategory({ name: "Física", icon: "science" });

    const changed = await useCases.changeCategoryIcon({ id: created.id, icon: "bolt" });

    expect(changed).toMatchObject({ id: created.id, name: "Física", icon: "bolt" });
    await expect(useCases.createCategory({ name: "física", icon: "star" })).rejects.toThrow(
      "Já existe uma categoria com esse nome.",
    );
  });

  it("troca o ícone de uma padrão sem nome próprio, mantendo o nome ausente", async () => {
    const { useCases } = createUseCases();

    const changed = await useCases.changeCategoryIcon({ id: "reading", icon: "star" });

    expect(changed.name).toBeUndefined();
    expect(changed.icon).toBe("star");
  });

  it("recusa ícone inválido e categoria inexistente", async () => {
    const { useCases } = createUseCases();

    await expect(useCases.changeCategoryIcon({ id: "music", icon: "xyz" })).rejects.toThrow(
      "Ícone de categoria inválido.",
    );
    await expect(useCases.changeCategoryIcon({ id: "inexistente", icon: "bolt" })).rejects.toThrow(
      "Categoria não encontrada.",
    );
  });
});

describe("CategoryUseCases.deleteCategory", () => {
  it("exclui a categoria, deixa as tarefas sem categoria e devolve as rotinas ao ícone geral, sem apagar nenhuma", async () => {
    const { useCases, tasks, routines } = createUseCases();
    await tasks.create(createTaskFixture({ id: "t-1", category: "music" }));
    await tasks.create(createTaskFixture({ id: "t-2", category: "reading" }));
    await routines.create(createRoutineFixture({ id: "r-1", icon: "music" }), []);

    await useCases.deleteCategory("music");

    expect((await useCases.listCategories()).map((category) => category.id)).not.toContain("music");
    expect(await tasks.listAll()).toHaveLength(2);
    expect((await tasks.findById("t-1"))?.category).toBeUndefined();
    expect((await tasks.findById("t-2"))?.category).toBe("reading");
    expect((await routines.findById("r-1"))?.icon).toBe("general");
  });

  it("permite excluir as seis categorias padrão", async () => {
    const { useCases } = createUseCases();

    for (const id of DEFAULT_CATEGORY_IDS) {
      await useCases.deleteCategory(id);
    }

    expect(await useCases.listCategories()).toEqual([]);
  });

  it("recusa categoria inexistente", async () => {
    const { useCases } = createUseCases();

    await expect(useCases.deleteCategory("inexistente")).rejects.toThrow("Categoria não encontrada.");
  });
});
