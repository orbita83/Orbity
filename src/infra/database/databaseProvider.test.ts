import { DatabaseProvider } from "@/infra/database/databaseProvider";
import type { ISqlExecutor } from "@/infra/database/iSqlExecutor";
import { MIGRATIONS, type Migration } from "@/infra/database/migrations";
import { DataSourceError, DomainError, SchemaVersionError } from "@/model/errors";
import { BetterSqliteExecutor } from "../../../tests/fixtures/better-sqlite-executor";

const userVersion = (executor: BetterSqliteExecutor) =>
  executor.database.pragma("user_version", { simple: true });

const tableExists = (executor: BetterSqliteExecutor, name: string) =>
  executor.database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(name) !==
  undefined;

describe("DatabaseProvider", () => {
  let executor: BetterSqliteExecutor;

  beforeEach(() => {
    executor = new BetterSqliteExecutor();
  });

  afterEach(() => {
    executor.close();
  });

  it("aplica a v1, a v2 e a v3 num banco novo e grava user_version = 3", async () => {
    await new DatabaseProvider(async () => executor).get();

    expect(userVersion(executor)).toBe(3);
    expect(tableExists(executor, "daily_activity")).toBe(true);
    expect(tableExists(executor, "tasks")).toBe(true);
    expect(tableExists(executor, "routines")).toBe(true);
    expect(tableExists(executor, "routine_occurrences")).toBe(true);
    expect(tableExists(executor, "routine_task_checks")).toBe(true);
  });

  it("rotinas.md: atualiza um banco na v2 para a v3 e as tarefas existentes continuam avulsas", async () => {
    const v1AndV2 = new DatabaseProvider(async () => executor, MIGRATIONS.filter((migration) => migration.version <= 2));
    await v1AndV2.get();
    executor.database
      .prepare(
        "INSERT INTO tasks (id, title, completed, pinned, created_at, updated_at) VALUES ('t1', 'Revisar', 1, 0, 'a', 'a')",
      )
      .run();

    await new DatabaseProvider(async () => executor).get();

    expect(userVersion(executor)).toBe(3);
    expect(executor.database.prepare("SELECT id, completed, routine_id, position FROM tasks").all()).toEqual([
      { id: "t1", completed: 1, routine_id: null, position: null },
    ]);
  });

  it("atualiza um banco na v1 para a última versão preservando os registros anteriores", async () => {
    executor.database.exec(`
      CREATE TABLE daily_activity (
        local_date  TEXT PRIMARY KEY
                    CHECK (local_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
        recorded_at TEXT NOT NULL
      );
      INSERT INTO daily_activity (local_date, recorded_at) VALUES ('2026-11-14', '2026-11-14T20:00:00-03:00');
      PRAGMA user_version = 1;
    `);

    await new DatabaseProvider(async () => executor).get();

    expect(userVersion(executor)).toBe(3);
    expect(tableExists(executor, "tasks")).toBe(true);
    expect(executor.database.prepare("SELECT local_date FROM daily_activity").all()).toEqual([
      { local_date: "2026-11-14" },
    ]);
  });

  it("chamar get() duas vezes roda as migrações pendentes uma vez só", async () => {
    const spy = jest.spyOn(executor, "runInTransaction");
    const provider = new DatabaseProvider(async () => executor);

    await provider.get();
    await provider.get();

    expect(spy).toHaveBeenCalledTimes(MIGRATIONS.length);
  });

  it("D14: banco mais novo que o app dá SchemaVersionError sem mexer nas tabelas", async () => {
    executor.database.pragma("user_version = 99");
    const provider = new DatabaseProvider(async () => executor);

    await expect(provider.get()).rejects.toBeInstanceOf(SchemaVersionError);
    expect(tableExists(executor, "daily_activity")).toBe(false);
    expect(userVersion(executor)).toBe(99);
    // Fica guardado: a próxima chamada não tenta abrir de novo.
    await expect(provider.get()).rejects.toBeInstanceOf(SchemaVersionError);
  });

  it("migração com o segundo comando inválido faz ROLLBACK", async () => {
    const broken: Migration[] = [
      {
        version: 1,
        statements: [{ sql: "CREATE TABLE first_table (id TEXT)" }, { sql: "CREATE TABL invalid" }],
      },
    ];

    await expect(new DatabaseProvider(async () => executor, broken).get()).rejects.toBeInstanceOf(DataSourceError);
    expect(tableExists(executor, "first_table")).toBe(false);
    expect(userVersion(executor)).toBe(0);
  });

  it("se a primeira abertura falha, a segunda chamada tenta de novo", async () => {
    const open = jest
      .fn<Promise<ISqlExecutor>, []>()
      .mockRejectedValueOnce(new Error("disk I/O error"))
      .mockResolvedValue(executor);
    const provider = new DatabaseProvider(open);

    const first = provider.get();
    await expect(first).rejects.toBeInstanceOf(DomainError);
    await expect(first).rejects.toBeInstanceOf(DataSourceError);

    await expect(provider.get()).resolves.toBe(executor);
    expect(open).toHaveBeenCalledTimes(2);
  });

  it("duas chamadas simultâneas abrem o banco uma vez só", async () => {
    const open = jest.fn(async () => executor);
    const provider = new DatabaseProvider(open);

    const [a, b] = await Promise.all([provider.get(), provider.get()]);

    expect(a).toBe(b);
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("não abre o banco só por ser criado", () => {
    const open = jest.fn(async () => executor);
    new DatabaseProvider(open);
    expect(open).not.toHaveBeenCalled();
  });
});
