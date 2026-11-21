import {
  type CreateTaskInput,
  type Task,
  type UpdateTaskInput,
  isStandaloneTask,
  isTaskCategoryId,
} from "@/model/entities/task";
import { ValidationError } from "@/model/errors";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { ITaskDataSource } from "@/model/datasources/iTaskDataSource";
import type { IClockService } from "@/model/services/iClockService";
import type { ITaskUseCases } from "@/usecase/iTaskUseCases";
import {
  normalizeDisplayDate,
  normalizeDisplayTime,
  validateCreateTaskInput,
  validateDateTimeFields,
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

/** Regras de aplicação para criação, conclusão, fixação e exclusão de tarefas. */
export class TaskUseCases implements ITaskUseCases {
  constructor(
    private readonly taskDataSource: ITaskDataSource,
    private readonly dailyActivityDataSource: IDailyActivityDataSource,
    private readonly clock: IClockService,
    private readonly generateId: () => string = defaultGenerateId,
  ) {}

  /** Só as tarefas avulsas: as de rotina ficam na aba Rotinas (rotinas.md, R1). */
  async listTasks(): Promise<Task[]> {
    return (await this.taskDataSource.listAll()).filter(isStandaloneTask);
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const normalized = validateCreateTaskInput(input);
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
    return task;
  }

  async updateTask(input: UpdateTaskInput): Promise<Task> {
    const existing = await this.taskDataSource.findById(input.id);
    if (!existing) {
      throw new ValidationError("Tarefa não encontrada.");
    }

    const title = input.title !== undefined ? input.title.trim() : existing.title;
    if (title.length === 0) {
      throw new ValidationError("Dê um título para a tarefa.");
    }

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
      if (!isTaskCategoryId(input.category)) {
        throw new ValidationError("Categoria de tarefa inválida.");
      }
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
      await this.dailyActivityDataSource.recordDay(this.clock.todayLocal(), now);
    }

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

    // Concluir registra atividade do dia na sequência (RN-0002); reabrir mantém o dia (RF-0014 CA-04).
    if (!existing.completed && updated.completed) {
      await this.dailyActivityDataSource.recordDay(this.clock.todayLocal(), now);
    }

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
  }
}
