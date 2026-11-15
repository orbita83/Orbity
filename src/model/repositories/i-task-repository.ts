import type { Task } from "@/model/entities/task";

/** Contrato de persistência de tarefas (ARCHITECTURE.md). */
export interface ITaskRepository {
  listAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  updateMany(tasks: readonly Task[]): Promise<void>;
  deleteMany(ids: readonly string[]): Promise<void>;
}
