import type { Task } from "@/model/entities/task";
import type { ITaskRepository } from "@/model/repositories/i-task-repository";

type StoredEntry = {
  readonly order: number;
  readonly task: Task;
};

/** Mesma semântica de persistência do SQLite, em memória. Usado em testes. */
export class InMemoryTaskRepository implements ITaskRepository {
  private readonly items = new Map<string, StoredEntry>();
  private sequence = 0;

  constructor(initialTasks: readonly Task[] = []) {
    for (const task of initialTasks) {
      this.sequence += 1;
      this.items.set(task.id, { order: this.sequence, task: Object.freeze({ ...task }) });
    }
  }

  async listAll(): Promise<Task[]> {
    return [...this.items.values()]
      .sort((a, b) => {
        if (b.task.createdAt !== a.task.createdAt) {
          return b.task.createdAt.localeCompare(a.task.createdAt);
        }
        return b.order - a.order;
      })
      .map((entry) => entry.task);
  }

  async listByRoutine(routineId: string): Promise<Task[]> {
    return [...this.items.values()]
      .filter((entry) => entry.task.routineId === routineId)
      .sort((a, b) => (a.task.position ?? 0) - (b.task.position ?? 0) || a.order - b.order)
      .map((entry) => entry.task);
  }

  async findById(id: string): Promise<Task | null> {
    return this.items.get(id)?.task ?? null;
  }

  async create(task: Task): Promise<void> {
    this.sequence += 1;
    this.items.set(task.id, { order: this.sequence, task: Object.freeze({ ...task }) });
  }

  async update(task: Task): Promise<void> {
    const existing = this.items.get(task.id);
    if (!existing) {
      return;
    }
    this.items.set(task.id, { order: existing.order, task: Object.freeze({ ...task }) });
  }

  async updateMany(tasks: readonly Task[]): Promise<void> {
    for (const task of tasks) {
      await this.update(task);
    }
  }

  async deleteMany(ids: readonly string[]): Promise<void> {
    for (const id of ids) {
      this.items.delete(id);
    }
  }
}
