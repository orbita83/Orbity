import type { SqlStatement } from "@/infra/database/i-sql-executor";

export type Migration = { version: number; statements: readonly SqlStatement[] };

/** Esquema do banco local (ADR-0001, D14). Cada versão nova entra no fim da lista. */
export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    statements: [
      {
        sql: `CREATE TABLE daily_activity (
  local_date  TEXT PRIMARY KEY
              CHECK (local_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  recorded_at TEXT NOT NULL
)`,
      },
    ],
  },
];
