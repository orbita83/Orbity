import type { LocalDate } from "@/model/entities/localDate";
import type { CreateTaskInput, Task, UpdateTaskInput } from "@/model/entities/task";
import type { NotificationPermissionStatus } from "@/model/services/iNotificationService";

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
  /** Sincroniza os lembretes agendados no sistema com as tarefas avulsas abertas que possuem horário futuro (RF-0021, RN-0011). */
  reconcileScheduledReminders?(): Promise<void>;
  /** Consulta ou solicita permissão de notificações sem bloquear o salvamento da tarefa (RF-0021 CA-05). */
  ensureReminderPermission?(): Promise<NotificationPermissionStatus>;
  /** Escuta o toque do estudante em uma notificação de tarefa para a ViewModel navegar até a aba Tarefas (RF-0021 CA-06). */
  onTaskReminderPress?(onPress: (taskId?: string) => void): () => void;
}
