import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import type { ISqlExecutor, SqlStatement } from "@/infra/database/iSqlExecutor";

/**
 * Normaliza os parâmetros como o `expo-sqlite` faz no app (`paramUtils.ts`): `boolean` vira 1/0 e
 * `undefined` vira NULL. O `node:sqlite` recusa os dois, e o teste deve aceitar o que o app aceita.
 */
function toBindValues(params: readonly unknown[]): SQLInputValue[] {
  return params.map((value) => {
    if (typeof value === "boolean") return value ? 1 : 0;
    return (value ?? null) as SQLInputValue;
  });
}

/**
 * ISqlExecutor de teste sobre o `node:sqlite`, embutido no Node (D15, #226). Roda o SQL real do app
 * no Jest, em `:memory:` ou num arquivo temporário (para testar fechar e reabrir), sem dependência
 * nativa para compilar. Só roda no Node: o app no aparelho usa o `expo-sqlite`.
 *
 * As linhas lidas direto de `database` têm protótipo nulo: compare com `toEqual`, não `toStrictEqual`.
 */
export class NodeSqliteExecutor implements ISqlExecutor {
  readonly database: DatabaseSync;

  constructor(filename = ":memory:") {
    this.database = new DatabaseSync(filename);
  }

  async all<T>(sql: string, params: readonly unknown[] = []): Promise<T[]> {
    return this.database.prepare(sql).all(...toBindValues(params)) as T[];
  }

  async run(sql: string, params: readonly unknown[] = []): Promise<void> {
    this.database.prepare(sql).run(...toBindValues(params));
  }

  async runInTransaction(statements: readonly SqlStatement[]): Promise<void> {
    this.database.exec("BEGIN");
    try {
      for (const statement of statements) {
        this.database.prepare(statement.sql).run(...toBindValues(statement.params ?? []));
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
