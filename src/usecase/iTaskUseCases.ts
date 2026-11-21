import type { CreateTaskInput, Task, UpdateTaskInput } from "@/model/entities/task";

/** Casos de uso da funcionalidade de Tarefas (ARCHITECTURE.md). */
export interface ITaskUseCases {
  listTasks(): Promise<Task[]>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(input: UpdateTaskInput): Promise<Task>;
  toggleTaskCompletion(id: string): Promise<Task>;
  togglePinTasks(ids: readonly string[]): Promise<Task[]>;
  deleteTasks(ids: readonly string[]): Promise<void>;
}
