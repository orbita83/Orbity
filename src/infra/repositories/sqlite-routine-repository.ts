import type { DatabaseProvider } from "@/infra/database/database-provider";
import type { SqlStatement } from "@/infra/database/i-sql-executor";
import { toDomainError } from "@/infra/database/persistence-error";
import { insertTaskStatement, updateTaskStatement } from "@/infra/repositories/sqlite-task-repository";
import type { LocalDate } from "@/model/entities/local-date";
import { DEFAULT_ROUTINE_ICON, isRoutineIcon, isWeekday, type Routine, type Weekday } from "@/model/entities/routine";
import type { Task } from "@/model/entities/task";
import type { IRoutineRepository, RoutineTaskChanges } from "@/model/repositories/i-routine-repository";

type RoutineRow = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  days: string;
  created_at: string;
  updated_at: string;
};

const SELECT_COLUMNS = "id, title, description, icon, days, created_at, updated_at";

/** Dias guardados como texto "1,3,5" (0 = domingo). */
const serializeDays = (days: readonly Weekday[]): string => days.join(",");
const parseDays = (value: string): Weekday[] =>
  value
    .split(",")
    .filter((part) => part !== "")
    .map(Number)
    .filter(isWeekday);

const mapRowToRoutine = (row: RoutineRow): Routine =>
  Object.freeze({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    icon: isRoutineIcon(row.icon) ? row.icon : DEFAULT_ROUTINE_ICON,
    days: Object.freeze(parseDays(row.days)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

/** Rotinas no SQLite do aparelho (ADR-0001, rotinas.md). */
export class SqliteRoutineRepository implements IRoutineRepository {
  constructor(private readonly db: DatabaseProvider) {}

  async listActive(): Promise<Routine[]> {
    try {
      const executor = await this.db.get();
      const rows = await executor.all<RoutineRow>(
        `SELECT ${SELECT_COLUMNS} FROM routines WHERE deleted_at IS NULL ORDER BY created_at ASC, rowid ASC`,
      );
      return rows.map(mapRowToRoutine);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async findById(id: string): Promise<Routine | null> {
    try {
      const executor = await this.db.get();
      const [row] = await executor.all<RoutineRow>(
        `SELECT ${SELECT_COLUMNS} FROM routines WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [id],
      );
      return row ? mapRowToRoutine(row) : null;
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async create(routine: Routine, tasks: readonly Task[]): Promise<void> {
    try {
      const executor = await this.db.get();
      const statements: SqlStatement[] = [
        {
          sql: `INSERT INTO routines (${SELECT_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          params: [
            routine.id,
            routine.title,
            routine.description ?? null,
            routine.icon,
            serializeDays(routine.days),
            routine.createdAt,
            routine.updatedAt,
          ],
        },
        ...tasks.map(insertTaskStatement),
      ];
      await executor.runInTransaction(statements);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async update(routine: Routine, changes: RoutineTaskChanges): Promise<void> {
    try {
      const executor = await this.db.get();
      const statements: SqlStatement[] = [
        {
          sql: "UPDATE routines SET title = ?, description = ?, icon = ?, days = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
          params: [
            routine.title,
            routine.description ?? null,
            routine.icon,
            serializeDays(routine.days),
            routine.updatedAt,
            routine.id,
          ],
        },
        ...changes.created.map(insertTaskStatement),
        ...changes.updated.map(updateTaskStatement),
      ];
      if (changes.deletedIds.length > 0) {
        const placeholders = changes.deletedIds.map(() => "?").join(", ");
        // A tarefa removida leva as marcações dela; a ocorrência e a sequência não mudam (#137).
        statements.push(
          { sql: `DELETE FROM routine_task_checks WHERE task_id IN (${placeholders})`, params: [...changes.deletedIds] },
          {
            sql: `DELETE FROM tasks WHERE routine_id = ? AND id IN (${placeholders})`,
            params: [routine.id, ...changes.deletedIds],
          },
        );
      }
      await executor.runInTransaction(statements);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async markDeleted(id: string, deletedAt: string): Promise<void> {
    try {
      const executor = await this.db.get();
      await executor.run("UPDATE routines SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL", [deletedAt, id]);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async restore(id: string): Promise<void> {
    try {
      const executor = await this.db.get();
      await executor.run("UPDATE routines SET deleted_at = NULL WHERE id = ?", [id]);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async listCompletedOn(date: LocalDate): Promise<string[]> {
    try {
      const executor = await this.db.get();
      const rows = await executor.all<{ routine_id: string }>(
        "SELECT routine_id FROM routine_occurrences WHERE local_date = ?",
        [date.toString()],
      );
      return rows.map((row) => row.routine_id);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async completeOccurrence(
    routineId: string,
    date: LocalDate,
    taskIds: readonly string[],
    completedAt: string,
  ): Promise<void> {
    const day = date.toString();
    try {
      const executor = await this.db.get();
      // INSERT OR IGNORE: o que já estava concluído ou marcado não duplica (RF-0011 CA-05, EC-0005).
      await executor.runInTransaction([
        {
          sql: "INSERT OR IGNORE INTO routine_occurrences (routine_id, local_date, completed_at) VALUES (?, ?, ?)",
          params: [routineId, day, completedAt],
        },
        ...taskIds.map((taskId) => ({
          sql: "INSERT OR IGNORE INTO routine_task_checks (routine_id, task_id, local_date) VALUES (?, ?, ?)",
          params: [routineId, taskId, day],
        })),
      ]);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async reopenOccurrence(routineId: string, date: LocalDate): Promise<void> {
    const day = date.toString();
    try {
      const executor = await this.db.get();
      await executor.runInTransaction([
        { sql: "DELETE FROM routine_occurrences WHERE routine_id = ? AND local_date = ?", params: [routineId, day] },
        { sql: "DELETE FROM routine_task_checks WHERE routine_id = ? AND local_date = ?", params: [routineId, day] },
      ]);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async listTaskChecks(routineId: string, date: LocalDate): Promise<string[]> {
    try {
      const executor = await this.db.get();
      const rows = await executor.all<{ task_id: string }>(
        "SELECT task_id FROM routine_task_checks WHERE routine_id = ? AND local_date = ?",
        [routineId, date.toString()],
      );
      return rows.map((row) => row.task_id);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async setTaskCheck(routineId: string, taskId: string, date: LocalDate, checked: boolean): Promise<void> {
    const day = date.toString();
    try {
      const executor = await this.db.get();
      if (checked) {
        await executor.run(
          "INSERT OR IGNORE INTO routine_task_checks (routine_id, task_id, local_date) VALUES (?, ?, ?)",
          [routineId, taskId, day],
        );
      } else {
        await executor.run("DELETE FROM routine_task_checks WHERE task_id = ? AND local_date = ?", [taskId, day]);
      }
    } catch (error) {
      throw toDomainError(error);
    }
  }
}
