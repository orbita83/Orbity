import type { LocalDate } from "@/model/entities/localDate";
import type { CreateTaskInput, Task, UpdateTaskInput } from "@/model/entities/task";

/** Casos de uso da funcionalidade de Tarefas (ARCHITECTURE.md). */
export interface ITaskUseCases {
  listTasks(): Promise<Task[]>;
  /**
   * Busca uma tarefa avulsa pelo id, para editá-la.
   *
   * @throws {ValidationError} Caso a tarefa não exista ou seja de uma rotina.
   */
  getTask(id: string): Promise<Task>;
  /** Data local de hoje, referência das opções de data do formulário de tarefa. */
  todayLocal(): LocalDate;
  /** @throws {ValidationError} Com `field: "title"` quando o título está em branco. */
  createTask(input: CreateTaskInput): Promise<Task>;
  /** @throws {ValidationError} Com `field: "title"` quando o título está em branco. */
  updateTask(input: UpdateTaskInput): Promise<Task>;
  toggleTaskCompletion(id: string): Promise<Task>;
  togglePinTasks(ids: readonly string[]): Promise<Task[]>;
  deleteTasks(ids: readonly string[]): Promise<void>;
}
