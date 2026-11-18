import type { SqlStatement } from "@/infra/database/iSqlExecutor";

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
  {
    // Rotinas (rotinas.md): ocorrências e marcações por dia; tarefas da rotina ficam em `tasks`.
    version: 3,
    statements: [
      {
        sql: `CREATE TABLE routines (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  icon        TEXT NOT NULL,
  days        TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  deleted_at  TEXT
)`,
      },
      {
        sql: `CREATE TABLE routine_occurrences (
  routine_id   TEXT NOT NULL,
  local_date   TEXT NOT NULL
               CHECK (local_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  completed_at TEXT NOT NULL,
  PRIMARY KEY (routine_id, local_date)
)`,
      },
      {
        sql: `CREATE TABLE routine_task_checks (
  routine_id TEXT NOT NULL,
  task_id    TEXT NOT NULL,
  local_date TEXT NOT NULL
             CHECK (local_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  PRIMARY KEY (task_id, local_date)
)`,
      },
      { sql: `ALTER TABLE tasks ADD COLUMN routine_id TEXT` },
      { sql: `ALTER TABLE tasks ADD COLUMN position INTEGER` },
      { sql: `CREATE INDEX idx_tasks_routine ON tasks (routine_id, position)` },
      { sql: `CREATE INDEX idx_routine_task_checks_day ON routine_task_checks (routine_id, local_date)` },
    ],
  },
];
