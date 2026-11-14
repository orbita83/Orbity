import { DatabaseProvider } from "@/infra/database/database-provider";
import type { ISqlExecutor } from "@/infra/database/i-sql-executor";
import type { Migration } from "@/infra/database/migrations";
import { DomainError } from "@/model/errors/domain-error";
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

  it("aplica a v1 num banco novo e grava user_version = 1", async () => {
    await new DatabaseProvider(async () => executor).get();

    expect(userVersion(executor)).toBe(1);
    expect(tableExists(executor, "daily_activity")).toBe(true);
  });

  it("chamar get() duas vezes roda as migrações uma vez só", async () => {
    const spy = jest.spyOn(executor, "runInTransaction");
    const provider = new DatabaseProvider(async () => executor);

    await provider.get();
    await provider.get();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("D14: banco mais novo que o app dá SCHEMA_VERSION_UNSUPPORTED sem mexer nas tabelas", async () => {
    executor.database.pragma("user_version = 99");
    const provider = new DatabaseProvider(async () => executor);

    await expect(provider.get()).rejects.toMatchObject({
      code: "SCHEMA_VERSION_UNSUPPORTED",
      retryable: false,
    });
    expect(tableExists(executor, "daily_activity")).toBe(false);
    expect(userVersion(executor)).toBe(99);
    // Fica guardado: a próxima chamada não tenta abrir de novo.
    await expect(provider.get()).rejects.toMatchObject({ code: "SCHEMA_VERSION_UNSUPPORTED" });
  });

  it("migração com o segundo comando inválido faz ROLLBACK", async () => {
    const broken: Migration[] = [
      {
        version: 1,
        statements: [{ sql: "CREATE TABLE first_table (id TEXT)" }, { sql: "CREATE TABL invalid" }],
      },
    ];

    await expect(new DatabaseProvider(async () => executor, broken).get()).rejects.toMatchObject({
      code: "PERSISTENCE_FAILURE",
    });
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
    await expect(first).rejects.toMatchObject({ code: "PERSISTENCE_FAILURE", retryable: true });

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
