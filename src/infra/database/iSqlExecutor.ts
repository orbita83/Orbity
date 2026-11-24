export type SqlStatement = { sql: string; params?: readonly unknown[] };

/**
 * Porta mínima sobre o driver SQLite (D15). O app usa o `expo-sqlite`; os testes usam o
 * `node:sqlite` do Node (tests/fixtures). A transação é um lote declarativo, sem callback, para os
 * dois drivers (um síncrono, outro assíncrono) se comportarem igual.
 */
export interface ISqlExecutor {
  all<T>(sql: string, params?: readonly unknown[]): Promise<T[]>;
  run(sql: string, params?: readonly unknown[]): Promise<void>;
  /** BEGIN, os comandos e COMMIT; se algum falhar, ROLLBACK e rejeita. */
  runInTransaction(statements: readonly SqlStatement[]): Promise<void>;
}
