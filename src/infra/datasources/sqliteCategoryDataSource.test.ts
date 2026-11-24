import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseProvider } from "@/infra/database/databaseProvider";
import { describeCategoryDataSourceContract } from "@/infra/datasources/categoryDataSource.contract";
import { SqliteCategoryDataSource } from "@/infra/datasources/sqliteCategoryDataSource";
import { SqliteRoutineDataSource } from "@/infra/datasources/sqliteRoutineDataSource";
import { SqliteTaskDataSource } from "@/infra/datasources/sqliteTaskDataSource";
import { createCategoryFixture } from "@/model/__fixtures__/category.fixture";
import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { DataSourceError } from "@/model/errors";
import { NodeSqliteExecutor } from "../../../tests/fixtures/node-sqlite-executor";

describeCategoryDataSourceContract("SqliteCategoryDataSource", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "orbity-categories-db-"));
  const file = path.join(directory, "orbity.db");
  const opened: NodeSqliteExecutor[] = [];
  const open = () => {
    const executor = new NodeSqliteExecutor(file);
    opened.push(executor);
    const provider = new DatabaseProvider(async () => executor);
    return {
      dataSource: new SqliteCategoryDataSource(provider),
      tasks: new SqliteTaskDataSource(provider),
      routines: new SqliteRoutineDataSource(provider),
    };
  };
  const first = open();

  return {
    ...first,
    reopen: async () => {
      opened.forEach((executor) => executor.close());
      return open().dataSource;
    },
    cleanup: () => {
      opened.forEach((executor) => {
        if (executor.database.isOpen) executor.close();
      });
      fs.rmSync(directory, { recursive: true, force: true });
    },
  };
});

describe("SqliteCategoryDataSource (SQLite)", () => {
  const createStore = () => {
    const executor = new NodeSqliteExecutor();
    const provider = new DatabaseProvider(async () => executor);
    return {
      executor,
      dataSource: new SqliteCategoryDataSource(provider),
      tasks: new SqliteTaskDataSource(provider),
      routines: new SqliteRoutineDataSource(provider),
    };
  };

  it("converte erro técnico do SQLite em DataSourceError", async () => {
    const { executor, dataSource } = createStore();
    await dataSource.listAll();
    executor.database.exec("DROP TABLE categories");

    await expect(dataSource.listAll()).rejects.toBeInstanceOf(DataSourceError);
    await expect(dataSource.findById("music")).rejects.toBeInstanceOf(DataSourceError);
    await expect(dataSource.findByNameKey("x")).rejects.toBeInstanceOf(DataSourceError);
    await expect(dataSource.create(createCategoryFixture(), "fisica")).rejects.toBeInstanceOf(DataSourceError);
    await expect(dataSource.update(createCategoryFixture(), "fisica")).rejects.toBeInstanceOf(DataSourceError);
    await expect(dataSource.delete("music", "2026-11-20T10:00:00-03:00")).rejects.toBeInstanceOf(DataSourceError);
    executor.close();
  });

  it("recusa duas categorias com a mesma chave de nome com DataSourceError", async () => {
    const { executor, dataSource } = createStore();
    await dataSource.create(createCategoryFixture({ id: "c-1" }), "fisica");

    await expect(dataSource.create(createCategoryFixture({ id: "c-2" }), "fisica")).rejects.toBeInstanceOf(
      DataSourceError,
    );
    expect(await dataSource.findById("c-2")).toBeNull();
    executor.close();
  });

  it("aceita várias categorias padrão sem nome, já que a chave nula não conta como repetida", async () => {
    const { executor, dataSource } = createStore();

    await dataSource.update({ ...(await dataSource.findById("music"))!, name: undefined }, null);
    await dataSource.update({ ...(await dataSource.findById("reading"))!, name: undefined }, null);

    expect(await dataSource.listAll()).toHaveLength(6);
    executor.close();
  });

  it("desfaz tudo quando a exclusão falha no meio (RN-0009 CA-04)", async () => {
    const { executor, dataSource, tasks, routines } = createStore();
    await tasks.create(createTaskFixture({ id: "t-1", category: "music" }));
    await routines.create(createRoutineFixture({ id: "r-1", icon: "music" }), []);
    executor.database.exec("DROP TABLE routines");

    await expect(dataSource.delete("music", "2026-11-20T10:00:00-03:00")).rejects.toBeInstanceOf(DataSourceError);

    expect((await dataSource.findById("music"))?.id).toBe("music");
    expect((await tasks.findById("t-1"))?.category).toBe("music");
    executor.close();
  });

  it("lê ícone desconhecido como o ícone genérico, sem quebrar a lista", async () => {
    const { executor, dataSource } = createStore();
    await dataSource.listAll();
    executor.database.prepare("UPDATE categories SET icon = 'desconhecido' WHERE id = 'music'").run();

    expect((await dataSource.findById("music"))?.icon).toBe("tag");
    executor.close();
  });

  it("impede nome com mais de 24 caracteres direto no banco", async () => {
    const { executor, dataSource } = createStore();

    await expect(
      dataSource.create(createCategoryFixture({ id: "c-1", name: "x".repeat(25) }), "x".repeat(25)),
    ).rejects.toBeInstanceOf(DataSourceError);
    executor.close();
  });
});
