import Database from "better-sqlite3";
import type { ISqlExecutor, SqlStatement } from "@/infra/database/iSqlExecutor";

/**
 * ISqlExecutor de teste sobre o `better-sqlite3` (D15). Roda o SQL real do app no Node,
 * em `:memory:` ou num arquivo temporário (para testar fechar e reabrir).
 */
export class BetterSqliteExecutor implements ISqlExecutor {
  readonly database: Database.Database;

  constructor(filename = ":memory:") {
    this.database = new Database(filename);
  }

  async all<T>(sql: string, params: readonly unknown[] = []): Promise<T[]> {
    return this.database.prepare(sql).all(...params) as T[];
  }

  async run(sql: string, params: readonly unknown[] = []): Promise<void> {
    this.database.prepare(sql).run(...params);
  }

  async runInTransaction(statements: readonly SqlStatement[]): Promise<void> {
    this.database.exec("BEGIN");
    try {
      for (const statement of statements) {
        this.database.prepare(statement.sql).run(...(statement.params ?? []));
      }
      this.database.exec("COMMIT");
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }

  close(): void {
    this.database.close();
  }
}
