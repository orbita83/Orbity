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

  it("aplica todas as migrações num banco novo e grava user_version = 6", async () => {
    await new DatabaseProvider(async () => executor).get();

    expect(userVersion(executor)).toBe(6);
    expect(tableExists(executor, "daily_activity")).toBe(true);
    expect(tableExists(executor, "tasks")).toBe(true);
    expect(tableExists(executor, "routines")).toBe(true);
    expect(tableExists(executor, "routine_occurrences")).toBe(true);
    expect(tableExists(executor, "routine_task_checks")).toBe(true);
    expect(tableExists(executor, "stars")).toBe(true);
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

    expect(userVersion(executor)).toBe(6);
    expect(executor.database.prepare("SELECT id, completed, routine_id, position FROM tasks").all()).toEqual([
      { id: "t1", completed: 1, routine_id: null, position: null },
    ]);
  });

  it("issue #159: a v4 converte categorias e ícones gravados na v3 para os ids em inglês", async () => {
    await new DatabaseProvider(async () => executor, MIGRATIONS.filter((migration) => migration.version <= 3)).get();
    const insertTask = executor.database.prepare(
      "INSERT INTO tasks (id, title, category, created_at, updated_at) VALUES (?, 'Estudar', ?, 'a', 'a')",
    );
    const oldCategories = ["matematica", "leitura", "idiomas", "ciencias", "programacao", "musica", null, "outra"];
    oldCategories.forEach((category, index) => insertTask.run(`t${index}`, category));
    const insertRoutine = executor.database.prepare(
      "INSERT INTO routines (id, title, icon, days, created_at, updated_at) VALUES (?, 'Rotina', ?, '[1]', 'a', 'a')",
    );
    const oldIcons = ["track_changes", "menu_book", "calculate", "translate", "science", "code", "music_note", "rocket"];
    oldIcons.forEach((icon, index) => insertRoutine.run(`r${index}`, icon));

    await new DatabaseProvider(async () => executor).get();

    expect(userVersion(executor)).toBe(6);
    expect(executor.database.prepare("SELECT category FROM tasks ORDER BY id").all().map((row) => (row as { category: string | null }).category)).toEqual(
      ["mathematics", "reading", "languages", "science", "programming", "music", null, "outra"],
    );
    expect(executor.database.prepare("SELECT icon FROM routines ORDER BY id").all().map((row) => (row as { icon: string }).icon)).toEqual(
      ["general", "reading", "mathematics", "languages", "science", "programming", "music", "rocket"],
    );
  });

  it("atualiza um banco na v1 para a última versão preservando os registros anteriores e concedendo estrelas retroativas (issue #214)", async () => {
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

    expect(userVersion(executor)).toBe(6);
    expect(tableExists(executor, "tasks")).toBe(true);
    expect(executor.database.prepare("SELECT local_date FROM daily_activity").all()).toEqual([
      { local_date: "2026-11-14" },
    ]);
    expect(executor.database.prepare("SELECT id, source_type, event_key, earned_date FROM stars").all()).toEqual([
      {
        id: "star-streak-2026-11-14",
        source_type: "streak",
        event_key: "streak:2026-11-14",
        earned_date: "2026-11-14",
      },
    ]);
  });

  it("issue #212: a v6 de um banco novo cria as seis categorias padrão, sem nome próprio e com o ícone do id", async () => {
    await new DatabaseProvider(async () => executor).get();

    expect(
      executor.database
        .prepare("SELECT id, name, name_key, icon, is_default FROM categories ORDER BY is_default DESC, rowid ASC")
        .all(),
    ).toEqual(
      ["mathematics", "reading", "languages", "science", "programming", "music"].map((id) => ({
        id,
        name: null,
        name_key: null,
        icon: id,
        is_default: 1,
      })),
    );
  });

  it("issue #212: a v6 de um banco da 0.1.0 (v4 e v5) mantém a categoria das tarefas e o ícone das rotinas", async () => {
    await new DatabaseProvider(async () => executor, MIGRATIONS.filter((migration) => migration.version <= 5)).get();
    executor.database.exec(`
      INSERT INTO tasks (id, title, category, completed, pinned, created_at, updated_at) VALUES
        ('t-1', 'Revisar', 'programming', 0, 0, '2026-11-15T08:00:00-03:00', '2026-11-15T08:00:00-03:00'),
        ('t-2', 'Ler', NULL, 1, 0, '2026-11-15T09:00:00-03:00', '2026-11-15T09:00:00-03:00');
      INSERT INTO routines (id, title, icon, days, created_at, updated_at) VALUES
        ('r-1', 'Música', 'music', '1,3', '2026-11-15T08:00:00-03:00', '2026-11-15T08:00:00-03:00'),
        ('r-2', 'Geral', 'general', '2', '2026-11-15T08:00:00-03:00', '2026-11-15T08:00:00-03:00');
    `);

    await new DatabaseProvider(async () => executor).get();

    expect(userVersion(executor)).toBe(6);
    expect(executor.database.prepare("SELECT id, category FROM tasks ORDER BY id").all()).toEqual([
      { id: "t-1", category: "programming" },
      { id: "t-2", category: null },
    ]);
    expect(executor.database.prepare("SELECT id, icon FROM routines ORDER BY id").all()).toEqual([
      { id: "r-1", icon: "music" },
      { id: "r-2", icon: "general" },
    ]);
    expect(executor.database.prepare("SELECT COUNT(*) AS total FROM categories").get()).toEqual({ total: 6 });
    expect(
      executor.database.prepare("SELECT COUNT(*) AS total FROM categories WHERE id IN ('programming', 'music')").get(),
    ).toEqual({ total: 2 });
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
