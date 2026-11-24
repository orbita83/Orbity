import type { LocalDate } from "@/model/entities/localDate";
import { createStreakStar } from "@/model/entities/star";
import {
  type CreateTaskInput,
  type Task,
  type UpdateTaskInput,
  buildTaskReminderId,
  getTaskReminderTriggerAt,
  isStandaloneTask,
  isTaskCategoryId,
  isTaskReminderId,
} from "@/model/entities/task";
import { ValidationError } from "@/model/errors";
import type { ICategoryDataSource } from "@/model/datasources/iCategoryDataSource";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IStarDataSource } from "@/model/datasources/iStarDataSource";
import type { ITaskDataSource } from "@/model/datasources/iTaskDataSource";
import type { IClockService } from "@/model/services/iClockService";
import type {
  INotificationService,
  NotificationPermissionStatus,
  ScheduleNotificationInput,
} from "@/model/services/iNotificationService";
import type { ITaskUseCases } from "@/usecase/iTaskUseCases";
import {
  normalizeDisplayDate,
  normalizeDisplayTime,
  validateCreateTaskInput,
  validateDateTimeFields,
  validateTaskTitle,
} from "@/usecase/taskInputValidation";

const defaultGenerateId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const resolveOptionalPatch = (patch: string | null | undefined, current: string | undefined): string | undefined => {
  if (patch === null) {
    return undefined;
  }
  if (patch === undefined) {
    return current;
  }
  const trimmed = patch.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const TASK_REMINDER_NOTIFICATION_TITLE = "Hora de estudar";

/**
 * Monta o payload de agendamento de lembrete local com textos acolhedores e metadados de rota
 * para uma tarefa avulsa pendente com início no futuro (RF-0021, RN-0011).
 */
export function buildTaskReminderInput(
  task: Pick<Task, "id" | "title" | "startDate" | "startTime" | "completed" | "routineId">,
  referenceIso: string,
): ScheduleNotificationInput | null {
  const triggerAt = getTaskReminderTriggerAt(task, referenceIso);
  if (!triggerAt) {
    return null;
  }
  return Object.freeze({
    id: buildTaskReminderId(task.id),
    title: TASK_REMINDER_NOTIFICATION_TITLE,
    body: `Sua tarefa "${task.title}" começa agora. Bons estudos!`,
    triggerAt,
    data: Object.freeze({
      route: "/tasks",
      taskId: task.id,
    }),
  });
}

/** Regras de aplicação para criação, conclusão, fixação e exclusão de tarefas. */
export class TaskUseCases implements ITaskUseCases {
  constructor(
    private readonly taskDataSource: ITaskDataSource,
    private readonly dailyActivityDataSource: IDailyActivityDataSource,
    private readonly clock: IClockService,
    private readonly generateId: () => string = defaultGenerateId,
    private readonly starDataSource?: IStarDataSource,
    private readonly categoryDataSource?: ICategoryDataSource,
    private readonly notificationService?: INotificationService,
  ) {}

  /**
   * A categoria precisa existir (categorias.md, RF-0020). Sem o DataSource de categorias, só as
   * padrão são aceitas, como antes da issue #212.
   */
  private async assertCategoryExists(category: string | undefined): Promise<void> {
    if (category === undefined) {
      return;
    }
    const exists = this.categoryDataSource
      ? (await this.categoryDataSource.findById(category)) !== null
      : isTaskCategoryId(category);
    if (!exists) {
      throw new ValidationError("Categoria de tarefa inválida.");
    }
  }

  /** Só as tarefas avulsas: as de rotina ficam na aba Rotinas (rotinas.md, R1). */
  async listTasks(): Promise<Task[]> {
    return (await this.taskDataSource.listAll()).filter(isStandaloneTask);
  }

  /** Só tarefas avulsas, como em `listTasks`: as de rotina são editadas na aba Rotinas. */
  async getTask(id: string): Promise<Task> {
    const task = await this.taskDataSource.findById(id);
    if (!task || !isStandaloneTask(task)) {
      throw new ValidationError("Tarefa não encontrada.");
    }
    return task;
  }

  todayLocal(): LocalDate {
    return this.clock.todayLocal();
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const normalized = validateCreateTaskInput(input);
    await this.assertCategoryExists(normalized.category);
    const now = this.clock.now();
    const task: Task = Object.freeze({
      id: this.generateId(),
      title: normalized.title,
      description: normalized.description,
      startDate: normalized.startDate,
      startTime: normalized.startTime,
      endDate: normalized.endDate,
      endTime: normalized.endTime,
      category: normalized.category,
      completed: false,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    });

    await this.taskDataSource.create(task);
    await this.syncTaskReminder(task, true);
    return task;
  }

  async updateTask(input: UpdateTaskInput): Promise<Task> {
    const existing = await this.taskDataSource.findById(input.id);
    if (!existing) {
      throw new ValidationError("Tarefa não encontrada.");
    }

    const title = input.title !== undefined ? validateTaskTitle(input.title) : existing.title;

    const description = resolveOptionalPatch(input.description, existing.description);
    const startDate = normalizeDisplayDate(resolveOptionalPatch(input.startDate, existing.startDate));
    const startTime = normalizeDisplayTime(resolveOptionalPatch(input.startTime, existing.startTime));
    const endDate = normalizeDisplayDate(resolveOptionalPatch(input.endDate, existing.endDate));
    const endTime = normalizeDisplayTime(resolveOptionalPatch(input.endTime, existing.endTime));

    validateDateTimeFields({ startDate, startTime, endDate, endTime });

    let category = existing.category;
    if (input.category === null) {
      category = undefined;
    } else if (input.category !== undefined) {
      await this.assertCategoryExists(input.category);
      category = input.category;
    }

    const now = this.clock.now();
    const completed = input.completed ?? existing.completed;
    const pinned = input.pinned ?? existing.pinned;
    const updated: Task = Object.freeze({
      ...existing,
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      category,
      completed,
      pinned,
      updatedAt: now,
    });

    await this.taskDataSource.update(updated);

    if (!existing.completed && updated.completed) {
      const today = this.clock.todayLocal();
      await this.dailyActivityDataSource.recordDay(today, now);
      await this.starDataSource?.awardIfNew(createStreakStar(today, now));
    }

    await this.syncTaskReminder(updated);
    return updated;
  }

  async toggleTaskCompletion(id: string): Promise<Task> {
    const existing = await this.taskDataSource.findById(id);
    if (!existing) {
      throw new ValidationError("Tarefa não encontrada.");
    }

    const now = this.clock.now();
    const updated: Task = Object.freeze({
      ...existing,
      completed: !existing.completed,
      updatedAt: now,
    });

    await this.taskDataSource.update(updated);

    // Concluir registra atividade do dia na sequência e estrela (RN-0002, RN-0003); reabrir mantém ambos (RF-0014 CA-04).
    if (!existing.completed && updated.completed) {
      const today = this.clock.todayLocal();
      await this.dailyActivityDataSource.recordDay(today, now);
      await this.starDataSource?.awardIfNew(createStreakStar(today, now));
    }

    await this.syncTaskReminder(updated);
    return updated;
  }

  async togglePinTasks(ids: readonly string[]): Promise<Task[]> {
    const selected = new Set(ids);
    if (selected.size === 0) {
      return [];
    }

    const all = await this.taskDataSource.listAll();
    const targets = all.filter((task) => selected.has(task.id));
    if (targets.length === 0) {
      return [];
    }

    const shouldUnpin = targets.every((task) => task.pinned);
    const nextPinned = !shouldUnpin;
    const now = this.clock.now();
    const changed = targets
      .filter((task) => task.pinned !== nextPinned)
      .map((task) =>
        Object.freeze({
          ...task,
          pinned: nextPinned,
          updatedAt: now,
        }),
      );

    await this.taskDataSource.updateMany(changed);
    return changed;
  }

  async deleteTasks(ids: readonly string[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) {
      return;
    }
    await this.taskDataSource.deleteMany(uniqueIds);
    if (this.notificationService) {
      await Promise.all(
        uniqueIds.map((id) =>
          this.notificationService!.cancel(buildTaskReminderId(id)).catch(() => undefined),
        ),
      );
    }
  }

  async reconcileScheduledReminders(): Promise<void> {
    if (!this.notificationService) {
      return;
    }
    try {
      const status = await this.notificationService.getPermissionStatus();
      if (status !== "granted") {
        return;
      }
      const [tasks, scheduled] = await Promise.all([
        this.listTasks(),
        this.notificationService.listScheduled(),
      ]);
      const nowIso = this.clock.now();
      const desiredById = new Map<string, ScheduleNotificationInput>();
      for (const task of tasks) {
        const reminder = buildTaskReminderInput(task, nowIso);
        if (reminder) {
          desiredById.set(reminder.id, reminder);
        }
      }

      const scheduledById = new Map(scheduled.map((item) => [item.id, item]));
      const orphanIds = scheduled
        .filter((item) => isTaskReminderId(item.id) && !desiredById.has(item.id))
        .map((item) => item.id);
      await Promise.all(orphanIds.map((id) => this.notificationService!.cancel(id).catch(() => undefined)));

      for (const desired of desiredById.values()) {
        const current = scheduledById.get(desired.id);
        const alreadyAligned =
          current !== undefined &&
          current.title === desired.title &&
          current.body === desired.body &&
          current.triggerAt === desired.triggerAt;
        if (!alreadyAligned) {
          await this.notificationService.schedule(desired);
        }
      }
    } catch {
      // Falha no serviço nativo nunca impede listar ou manipular tarefas (RF-0021 CA-05).
    }
  }

  async ensureReminderPermission(): Promise<NotificationPermissionStatus> {
    if (!this.notificationService) {
      return "granted";
    }
    try {
      const current = await this.notificationService.getPermissionStatus();
      if (current === "granted") {
        return "granted";
      }
      if (current === "undetermined") {
        return await this.notificationService.requestPermission();
      }
      return current;
    } catch {
      return "denied";
    }
  }

  onTaskReminderPress(onPress: (taskId?: string) => void): () => void {
    if (!this.notificationService?.onNotificationResponse) {
      return () => undefined;
    }
    return this.notificationService.onNotificationResponse((data) => {
      if (data.route === "/tasks") {
        onPress(data.taskId);
      }
    });
  }

  private async syncTaskReminder(task: Task, isNew = false): Promise<void> {
    if (!this.notificationService || !isStandaloneTask(task)) {
      return;
    }
    try {
      const reminder = buildTaskReminderInput(task, this.clock.now());
      if (!reminder) {
        if (!isNew) {
          await this.notificationService.cancel(buildTaskReminderId(task.id));
        }
        return;
      }
      const permission = await this.ensureReminderPermission();
      if (permission !== "granted") {
        return;
      }
      await this.notificationService.schedule(reminder);
    } catch {
      // Falha técnica ou negativa de permissão nunca impede persistir a tarefa (RF-0021 CA-05).
    }
  }
}
