import type { Task } from "@/model/entities/task";

/** Contrato de persistência de tarefas (ARCHITECTURE.md). */
export interface ITaskDataSource {
  /** Todas as tarefas, avulsas e de rotina. */
  listAll(): Promise<Task[]>;
  /** Tarefas de uma rotina, pela posição (rotinas.md, R1). */
  listByRoutine(routineId: string): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  updateMany(tasks: readonly Task[]): Promise<void>;
  deleteMany(ids: readonly string[]): Promise<void>;
}
