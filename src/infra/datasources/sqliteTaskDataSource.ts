import type { DatabaseProvider } from "@/infra/database/databaseProvider";
import type { SqlStatement } from "@/infra/database/iSqlExecutor";
import { toDataSourceError } from "@/infra/database/persistenceError";
import { isTaskCategoryId, type Task } from "@/model/entities/task";
import type { ITaskDataSource } from "@/model/datasources/iTaskDataSource";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  category: string | null;
  completed: number;
  pinned: number;
  created_at: string;
  updated_at: string;
  routine_id: string | null;
  position: number | null;
};

const SELECT_COLUMNS = `id, title, description, start_date, start_time, end_date, end_time, category, completed, pinned, created_at, updated_at, routine_id, position`;

const mapRowToTask = (row: TaskRow): Task =>
  Object.freeze({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    startDate: row.start_date ?? undefined,
    startTime: row.start_time ?? undefined,
    endDate: row.end_date ?? undefined,
    endTime: row.end_time ?? undefined,
    category: row.category && isTaskCategoryId(row.category) ? row.category : undefined,
    completed: row.completed === 1,
    pinned: row.pinned === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Tarefas avulsas não têm as chaves, para continuarem iguais às da v2 (rotinas.md, R1).
    ...(row.routine_id === null ? {} : { routineId: row.routine_id }),
    ...(row.position === null ? {} : { position: row.position }),
  });

const UPDATE_SQL = `UPDATE tasks
  SET title = ?, description = ?, start_date = ?, start_time = ?, end_date = ?, end_time = ?,
      category = ?, completed = ?, pinned = ?, updated_at = ?, routine_id = ?, position = ?
  WHERE id = ?`;

const toUpdateParams = (task: Task): readonly unknown[] => [
  task.title,
  task.description ?? null,
  task.startDate ?? null,
  task.startTime ?? null,
  task.endDate ?? null,
  task.endTime ?? null,
  task.category ?? null,
  task.completed ? 1 : 0,
  task.pinned ? 1 : 0,
  task.updatedAt,
  task.routineId ?? null,
  task.position ?? null,
  task.id,
];

/** Comando de inserção de uma tarefa; o DataSource de rotinas o usa na mesma transação da rotina. */
export const insertTaskStatement = (task: Task): SqlStatement => ({
  sql: `INSERT INTO tasks (${SELECT_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  params: [
    task.id,
    task.title,
    task.description ?? null,
    task.startDate ?? null,
    task.startTime ?? null,
    task.endDate ?? null,
    task.endTime ?? null,
    task.category ?? null,
    task.completed ? 1 : 0,
    task.pinned ? 1 : 0,
    task.createdAt,
    task.updatedAt,
    task.routineId ?? null,
    task.position ?? null,
  ],
});

/** Comando de atualização de uma tarefa; o DataSource de rotinas o usa na edição da rotina. */
export const updateTaskStatement = (task: Task): SqlStatement => ({ sql: UPDATE_SQL, params: toUpdateParams(task) });

/** Persistência local de tarefas no SQLite do aparelho (ADR-0001). */
export class SqliteTaskDataSource implements ITaskDataSource {
  constructor(private readonly db: DatabaseProvider) {}

  async listAll(): Promise<Task[]> {
    try {
      const executor = await this.db.get();
      const rows = await executor.all<TaskRow>(
        `SELECT ${SELECT_COLUMNS} FROM tasks ORDER BY created_at DESC, rowid DESC`,
      );
      return rows.map(mapRowToTask);
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async listByRoutine(routineId: string): Promise<Task[]> {
    try {
      const executor = await this.db.get();
      const rows = await executor.all<TaskRow>(
        `SELECT ${SELECT_COLUMNS} FROM tasks WHERE routine_id = ? ORDER BY position ASC, rowid ASC`,
        [routineId],
      );
      return rows.map(mapRowToTask);
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async findById(id: string): Promise<Task | null> {
    try {
      const executor = await this.db.get();
      const [row] = await executor.all<TaskRow>(
        `SELECT ${SELECT_COLUMNS} FROM tasks WHERE id = ? LIMIT 1`,
        [id],
      );
      return row ? mapRowToTask(row) : null;
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async create(task: Task): Promise<void> {
    try {
      const executor = await this.db.get();
      const statement = insertTaskStatement(task);
      await executor.run(statement.sql, statement.params);
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async update(task: Task): Promise<void> {
    try {
      const executor = await this.db.get();
      await executor.run(UPDATE_SQL, toUpdateParams(task));
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async updateMany(tasks: readonly Task[]): Promise<void> {
    if (tasks.length === 0) {
      return;
    }
    try {
      const executor = await this.db.get();
      const statements: SqlStatement[] = tasks.map((task) => ({
        sql: UPDATE_SQL,
        params: toUpdateParams(task),
      }));
      await executor.runInTransaction(statements);
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async deleteMany(ids: readonly string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    try {
      const executor = await this.db.get();
      const placeholders = ids.map(() => "?").join(", ");
      await executor.run(`DELETE FROM tasks WHERE id IN (${placeholders})`, ids);
    } catch (error) {
      throw toDataSourceError(error);
    }
  }
}
