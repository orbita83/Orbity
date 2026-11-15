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
  {
    version: 2,
    statements: [
      {
        sql: `CREATE TABLE tasks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  start_date  TEXT,
  start_time  TEXT,
  end_date    TEXT,
  end_time    TEXT,
  category    TEXT,
  completed   INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
  pinned      INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
)`,
      },
      {
        sql: `CREATE INDEX idx_tasks_order ON tasks (pinned DESC, created_at DESC)`,
      },
    ],
  },
];
