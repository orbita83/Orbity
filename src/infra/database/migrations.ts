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
  {
    // Issue #159: o domínio guarda ids em inglês, sem rótulo em pt-BR nem nome de ícone do Material
    // Symbols (tarefas.md, T8; rotinas.md, R8). Valores desconhecidos ficam como estão.
    version: 4,
    statements: [
      {
        sql: `UPDATE tasks SET category = CASE category
  WHEN 'matematica'  THEN 'mathematics'
  WHEN 'leitura'     THEN 'reading'
  WHEN 'idiomas'     THEN 'languages'
  WHEN 'ciencias'    THEN 'science'
  WHEN 'programacao' THEN 'programming'
  WHEN 'musica'      THEN 'music'
  ELSE category
END
WHERE category IS NOT NULL`,
      },
      {
        sql: `UPDATE routines SET icon = CASE icon
  WHEN 'track_changes' THEN 'general'
  WHEN 'menu_book'     THEN 'reading'
  WHEN 'calculate'     THEN 'mathematics'
  WHEN 'translate'     THEN 'languages'
  WHEN 'science'       THEN 'science'
  WHEN 'code'          THEN 'programming'
  WHEN 'music_note'    THEN 'music'
  ELSE icon
END`,
      },
    ],
  },
  {
    // Issue #214: registro persistente de estrelas (RF-0017, RN-0003) com concessão retroativa dos dias de daily_activity.
    version: 5,
    statements: [
      {
        sql: `CREATE TABLE stars (
  id          TEXT PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('streak', 'achievement')),
  event_key   TEXT NOT NULL UNIQUE,
  earned_date TEXT NOT NULL CHECK (earned_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  created_at  TEXT NOT NULL
)`,
      },
      {
        sql: `INSERT OR IGNORE INTO stars (id, source_type, event_key, earned_date, created_at)
SELECT 'star-streak-' || local_date, 'streak', 'streak:' || local_date, local_date, recorded_at
FROM daily_activity`,
      },
    ],
  },
  {
    // Issue #212: categorias de estudo como dados (RF-0020, RN-0010). As seis padrão mantêm os ids da 0.1.0, então tarefas e rotinas já salvas continuam válidas.
    version: 6,
    statements: [
      {
        sql: `CREATE TABLE categories (
  id         TEXT PRIMARY KEY,
  name       TEXT CHECK (name IS NULL OR length(trim(name)) BETWEEN 1 AND 24),
  name_key   TEXT UNIQUE,
  icon       TEXT NOT NULL,
  is_default INTEGER NOT NULL CHECK (is_default IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`,
      },
      {
        sql: `INSERT INTO categories (id, name, name_key, icon, is_default, created_at, updated_at) VALUES
  ('mathematics', NULL, NULL, 'mathematics', 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  ('reading', NULL, NULL, 'reading', 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  ('languages', NULL, NULL, 'languages', 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  ('science', NULL, NULL, 'science', 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  ('programming', NULL, NULL, 'programming', 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  ('music', NULL, NULL, 'music', 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`,
      },
    ],
  },
  {
    // Issue #217: sessões do Modo Foco com cronômetro pomodoro persistido (RF-0019, RN-0001).
    version: 7,
    statements: [
      {
        sql: `CREATE TABLE focus_sessions (
  id                     TEXT PRIMARY KEY,
  target_kind            TEXT NOT NULL CHECK (target_kind IN ('standalone-task', 'routine')),
  target_id              TEXT NOT NULL,
  target_title           TEXT NOT NULL,
  focus_duration_minutes INTEGER NOT NULL CHECK (focus_duration_minutes IN (5, 10, 15, 20, 25, 30)),
  phase                  TEXT NOT NULL CHECK (phase IN ('focus', 'short-break', 'long-break')),
  status                 TEXT NOT NULL CHECK (status IN ('running', 'paused', 'ended')),
  completed_focus_cycles INTEGER NOT NULL DEFAULT 0,
  cycle_duration_ms      INTEGER NOT NULL,
  cycle_started_at       TEXT NOT NULL,
  cycle_ends_at          TEXT,
  paused_remaining_ms    INTEGER,
  accumulated_focus_ms   INTEGER NOT NULL DEFAULT 0,
  started_at             TEXT NOT NULL,
  ended_at               TEXT,
  updated_at             TEXT NOT NULL
)`,
      },
      {
        sql: `CREATE INDEX idx_focus_sessions_status ON focus_sessions (status, updated_at DESC)`,
      },
      {
        sql: `CREATE INDEX idx_focus_sessions_ended ON focus_sessions (ended_at DESC)`,
      },
    ],
  },
  {
    // Issue #280: identificação do estudante (id e nome) persistida; as métricas do Perfil continuam calculadas.
    version: 8,
    statements: [
      {
        sql: `CREATE TABLE student_profile (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL
)`,
      },
    ],
  },
];
