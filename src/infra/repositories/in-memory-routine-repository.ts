import type { LocalDate } from "@/model/entities/local-date";
import type { Routine } from "@/model/entities/routine";
import type { Task } from "@/model/entities/task";
import type { IRoutineRepository, RoutineTaskChanges } from "@/model/repositories/i-routine-repository";
import type { ITaskRepository } from "@/model/repositories/i-task-repository";

type StoredRoutine = { readonly order: number; readonly routine: Routine; readonly deletedAt: string | null };

const key = (...parts: string[]) => parts.join("|");

/**
 * Mesma semântica do SQLite, em memória. Usado na web (D8) e em testes. Recebe o repositório de
 * tarefas para criar as tarefas da rotina junto com ela, como a transação do SQLite.
 */
export class InMemoryRoutineRepository implements IRoutineRepository {
  private readonly routines = new Map<string, StoredRoutine>();
  /** routine_id|data -> completed_at */
  private readonly occurrences = new Map<string, string>();
  /** task_id|data -> routine_id */
  private readonly checks = new Map<string, string>();
  private sequence = 0;

  constructor(private readonly tasks: ITaskRepository) {}

  async listActive(): Promise<Routine[]> {
    return [...this.routines.values()]
      .filter((entry) => entry.deletedAt === null)
      .sort((a, b) => a.routine.createdAt.localeCompare(b.routine.createdAt) || a.order - b.order)
      .map((entry) => entry.routine);
  }

  async findById(id: string): Promise<Routine | null> {
    const entry = this.routines.get(id);
    return entry && entry.deletedAt === null ? entry.routine : null;
  }

  async create(routine: Routine, tasks: readonly Task[]): Promise<void> {
    this.sequence += 1;
    this.routines.set(routine.id, { order: this.sequence, routine: Object.freeze({ ...routine }), deletedAt: null });
    for (const task of tasks) {
      await this.tasks.create(task);
    }
  }

  async update(routine: Routine, changes: RoutineTaskChanges): Promise<void> {
    const entry = this.routines.get(routine.id);
    if (!entry || entry.deletedAt !== null) {
      return;
    }
    this.routines.set(routine.id, { ...entry, routine: Object.freeze({ ...routine }) });
    for (const task of changes.created) {
      await this.tasks.create(task);
    }
    await this.tasks.updateMany(changes.updated);
    await this.tasks.deleteMany(changes.deletedIds);
    const removed = new Set(changes.deletedIds);
    for (const entryKey of [...this.checks.keys()]) {
      if (removed.has(entryKey.split("|")[0])) {
        this.checks.delete(entryKey);
      }
    }
  }

  async markDeleted(id: string, deletedAt: string): Promise<void> {
    const entry = this.routines.get(id);
    if (entry && entry.deletedAt === null) {
      this.routines.set(id, { ...entry, deletedAt });
    }
  }

  async restore(id: string): Promise<void> {
    const entry = this.routines.get(id);
    if (entry) {
      this.routines.set(id, { ...entry, deletedAt: null });
    }
  }

  async listCompletedOn(date: LocalDate): Promise<string[]> {
    const day = date.toString();
    return [...this.occurrences.keys()]
      .map((entry) => entry.split("|"))
      .filter(([, entryDay]) => entryDay === day)
      .map(([routineId]) => routineId);
  }

  async completeOccurrence(
    routineId: string,
    date: LocalDate,
    taskIds: readonly string[],
    completedAt: string,
  ): Promise<void> {
    const day = date.toString();
    if (!this.occurrences.has(key(routineId, day))) {
      this.occurrences.set(key(routineId, day), completedAt);
    }
    for (const taskId of taskIds) {
      this.checks.set(key(taskId, day), routineId);
    }
  }

  async reopenOccurrence(routineId: string, date: LocalDate): Promise<void> {
    const day = date.toString();
    this.occurrences.delete(key(routineId, day));
    for (const [entry, owner] of [...this.checks.entries()]) {
      if (owner === routineId && entry.endsWith(`|${day}`)) {
        this.checks.delete(entry);
      }
    }
  }

  async listTaskChecks(routineId: string, date: LocalDate): Promise<string[]> {
    const day = date.toString();
    return [...this.checks.entries()]
      .filter(([entry, owner]) => owner === routineId && entry.endsWith(`|${day}`))
      .map(([entry]) => entry.split("|")[0]);
  }

  async setTaskCheck(routineId: string, taskId: string, date: LocalDate, checked: boolean): Promise<void> {
    const entry = key(taskId, date.toString());
    if (checked) {
      this.checks.set(entry, routineId);
    } else {
      this.checks.delete(entry);
    }
  }
}
