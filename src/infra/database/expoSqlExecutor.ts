import { openDatabaseAsync, type SQLiteBindValue, type SQLiteDatabase } from "expo-sqlite";
import type { ISqlExecutor, SqlStatement } from "@/infra/database/iSqlExecutor";

const toParams = (params?: readonly unknown[]): SQLiteBindValue[] =>
  (params ?? []) as SQLiteBindValue[];

/**
 * Único arquivo que importa o `expo-sqlite` (regra de lint em eslint.config.js).
 * As operações passam por uma fila para que nada se intercale dentro de uma transação.
 * Sem teste automatizado (D15): a lógica fica no DatabaseProvider e nos DataSources.
 */
export class ExpoSqlExecutor implements ISqlExecutor {
  private queue: Promise<unknown> = Promise.resolve();

  private constructor(private readonly database: SQLiteDatabase) {}

  static async open(name: string): Promise<ExpoSqlExecutor> {
    return new ExpoSqlExecutor(await openDatabaseAsync(name));
  }

  all<T>(sql: string, params?: readonly unknown[]): Promise<T[]> {
    return this.enqueue(() => this.database.getAllAsync<T>(sql, toParams(params)));
  }

  run(sql: string, params?: readonly unknown[]): Promise<void> {
    return this.enqueue(async () => {
      await this.database.runAsync(sql, toParams(params));
    });
  }

  runInTransaction(statements: readonly SqlStatement[]): Promise<void> {
    return this.enqueue(async () => {
      await this.database.execAsync("BEGIN");
      try {
        for (const statement of statements) {
          await this.database.runAsync(statement.sql, toParams(statement.params));
        }
        await this.database.execAsync("COMMIT");
      } catch (error) {
        await this.database.execAsync("ROLLBACK");
        throw error;
      }
    });
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation, operation);
    this.queue = result.catch(() => undefined);
    return result;
  }
}
