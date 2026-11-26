import { FOCUS_CYCLE_NOTIFICATION_ID } from "@/model/entities/focusSession";
import type { LocalDate } from "@/model/entities/localDate";
import {
  type CreateRoutineInput,
  type Routine,
  type RoutineDetails,
  type RoutineOverview,
  type UpdateRoutineInput,
  DEFAULT_ROUTINE_ICON,
  isRoutineActiveOn,
  nextActiveDay,
} from "@/model/entities/routine";
import { createDefaultCategories, isDefaultCategoryId, type Category } from "@/model/entities/category";
import { createStreakStar } from "@/model/entities/star";
import type { Task } from "@/model/entities/task";
import { ValidationError } from "@/model/errors";
import type { ICategoryDataSource } from "@/model/datasources/iCategoryDataSource";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IFocusSessionDataSource } from "@/model/datasources/iFocusSessionDataSource";
import type { IRoutineDataSource } from "@/model/datasources/iRoutineDataSource";
import type { IStarDataSource } from "@/model/datasources/iStarDataSource";
import type { ITaskDataSource } from "@/model/datasources/iTaskDataSource";
import type { IClockService } from "@/model/services/iClockService";
import type { DayChangeListener, IDayChangeService } from "@/model/services/iDayChangeService";
import type { INotificationService } from "@/model/services/iNotificationService";
import type { IRoutineUseCases } from "@/usecase/iRoutineUseCases";
import { validateCreateRoutineInput, validateUpdateRoutineInput } from "@/usecase/routineInputValidation";

const defaultGenerateId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const NOT_FOUND = "Rotina não encontrada.";
const NOT_TODAY = "Esta rotina não é de hoje.";
const TASK_NOT_FOUND = "Tarefa não encontrada nesta rotina.";

/** Regras de Rotinas (rotinas.md). Depende só dos contratos do domínio (ARCHITECTURE.md §3.1). */
export class RoutineUseCases implements IRoutineUseCases {
  constructor(
    private readonly routineDataSource: IRoutineDataSource,
    private readonly taskDataSource: ITaskDataSource,
    private readonly dailyActivityDataSource: IDailyActivityDataSource,
    private readonly clock: IClockService,
    private readonly generateId: () => string = defaultGenerateId,
    private readonly dayChangeService?: IDayChangeService,
    private readonly starDataSource?: IStarDataSource,
    private readonly categoryDataSource?: ICategoryDataSource,
    private readonly focusSessionDataSource?: IFocusSessionDataSource,
    private readonly notificationService?: INotificationService,
  ) {}

  /**
   * O ícone é "general" ou uma categoria que existe (categorias.md, RF-0020). Sem o DataSource de
   * categorias, só as padrão são aceitas, como antes da issue #212.
   */
  private async assertIconExists(icon: string): Promise<void> {
    if (icon === DEFAULT_ROUTINE_ICON) {
      return;
    }
    const exists = this.categoryDataSource
      ? (await this.categoryDataSource.findById(icon)) !== null
      : isDefaultCategoryId(icon);
    if (!exists) {
      throw new ValidationError("Ícone de rotina inválido.");
    }
  }

  subscribeDayChange(listener: DayChangeListener): () => void {
    return this.dayChangeService ? this.dayChangeService.subscribe(listener) : () => undefined;
  }

  /** Lista as categorias persistidas no DataSource, com fallback para as 6 padrão (issue #213). */
  async listCategories(): Promise<Category[]> {
    if (this.categoryDataSource) {
      return this.categoryDataSource.listAll();
    }
    return [...createDefaultCategories(this.clock.now())];
  }

  async listRoutines(): Promise<RoutineOverview[]> {
    const today = this.clock.todayLocal();
    const [routines, completedToday] = await Promise.all([
      this.routineDataSource.listActive(),
      this.routineDataSource.listCompletedOn(today),
    ]);
    const done = new Set(completedToday);
    return Promise.all(
      routines.map(async (routine) => ({
        routine,
        taskCount: (await this.taskDataSource.listByRoutine(routine.id)).length,
        activeToday: isRoutineActiveOn(routine, today),
        doneToday: done.has(routine.id),
        nextActiveDay: nextActiveDay(routine, today),
      })),
    );
  }

  async getRoutine(id: string): Promise<RoutineDetails | null> {
    const routine = await this.routineDataSource.findById(id);
    return routine ? this.loadDetails(routine, this.clock.todayLocal()) : null;
  }

  async createRoutine(input: CreateRoutineInput): Promise<Routine> {
    const normalized = validateCreateRoutineInput(input);
    await this.assertIconExists(normalized.icon);
    const now = this.clock.now();
    const routine: Routine = Object.freeze({
      id: this.generateId(),
      title: normalized.title,
      description: normalized.description,
      icon: normalized.icon,
      days: Object.freeze([...normalized.days]),
      createdAt: now,
      updatedAt: now,
    });
    // As tarefas da rotina são Task com routineId (R1); `completed` não é usado por elas (R2).
    const tasks = normalized.tasks.map((title, position) => this.newRoutineTask(routine.id, title, position, now));
    await this.routineDataSource.create(routine, tasks);
    return routine;
  }

  async updateRoutine(input: UpdateRoutineInput): Promise<RoutineDetails> {
    const normalized = validateUpdateRoutineInput(input);
    await this.assertIconExists(normalized.icon);
    const current = await this.requireRoutine(normalized.id);
    const existing = new Map((await this.taskDataSource.listByRoutine(current.id)).map((task) => [task.id, task]));
    const now = this.clock.now();

    const kept = new Set<string>();
    const created: Task[] = [];
    const updated: Task[] = [];
    normalized.tasks.forEach((draft, position) => {
      const task = draft.id === undefined ? undefined : existing.get(draft.id);
      if (draft.id !== undefined && (!task || kept.has(draft.id))) {
        throw new ValidationError(TASK_NOT_FOUND);
      }
      if (!task) {
        // Tarefa nova: entra desmarcada, mesmo com a rotina já concluída hoje (RN-0004).
        created.push(this.newRoutineTask(current.id, draft.title, position, now));
        return;
      }
      kept.add(task.id);
      // Renomear ou reordenar mantém a mesma tarefa e, com ela, a marcação de hoje.
      if (task.title !== draft.title || task.position !== position) {
        updated.push(Object.freeze({ ...task, title: draft.title, position, updatedAt: now }));
      }
    });
    const deletedIds = [...existing.keys()].filter((id) => !kept.has(id));

    const routine: Routine = Object.freeze({
      ...current,
      title: normalized.title,
      description: normalized.description,
      icon: normalized.icon,
      days: Object.freeze([...normalized.days]),
      updatedAt: now,
    });
    await this.routineDataSource.update(routine, { created, updated, deletedIds });
    return this.loadDetails(routine, this.clock.todayLocal());
  }

  async deleteRoutine(id: string): Promise<void> {
    const nowIso = this.clock.now();
    await this.routineDataSource.markDeleted(id, nowIso);
    if (this.focusSessionDataSource) {
      const ended = await this.focusSessionDataSource.endActiveByTarget("routine", id, nowIso);
      if (ended && this.notificationService) {
        await this.notificationService.cancel(FOCUS_CYCLE_NOTIFICATION_ID).catch(() => undefined);
      }
    }
  }

  async restoreRoutine(id: string): Promise<void> {
    await this.routineDataSource.restore(id);
  }

  async completeOccurrence(id: string): Promise<RoutineDetails> {
    const today = this.clock.todayLocal();
    const routine = await this.requireActiveToday(id, today);
    const alreadyDone = (await this.routineDataSource.listCompletedOn(today)).includes(id);
    // Concluir de novo no mesmo dia não faz nada (RF-0011 CA-05; R5).
    if (!alreadyDone) {
      const now = this.clock.now();
      const tasks = await this.taskDataSource.listByRoutine(id);
      await this.routineDataSource.completeOccurrence(id, today, tasks.map((task) => task.id), now);
      // Concluir a rotina conta para a sequência e concede a estrela do dia (RN-0002, RN-0003); o registro é idempotente.
      await this.dailyActivityDataSource.recordDay(today, now);
      await this.starDataSource?.awardIfNew(createStreakStar(today, now));
    }
    return this.loadDetails(routine, today);
  }

  async reopenOccurrence(id: string): Promise<RoutineDetails> {
    const today = this.clock.todayLocal();
    const routine = await this.requireActiveToday(id, today);
    // O dia registrado continua valendo (RF-0014 CA-04).
    await this.routineDataSource.reopenOccurrence(id, today);
    return this.loadDetails(routine, today);
  }

  async toggleRoutineTask(routineId: string, taskId: string): Promise<RoutineDetails> {
    const today = this.clock.todayLocal();
    const routine = await this.requireActiveToday(routineId, today);
    const tasks = await this.taskDataSource.listByRoutine(routineId);
    if (!tasks.some((task) => task.id === taskId)) {
      throw new ValidationError(TASK_NOT_FOUND);
    }
    const checked = (await this.routineDataSource.listTaskChecks(routineId, today)).includes(taskId);
    // Só a marcação do dia: não registra atividade (RN-0002, D1) nem mexe na ocorrência (R3).
    await this.routineDataSource.setTaskCheck(routineId, taskId, today, !checked);
    return this.loadDetails(routine, today);
  }

  async moveRoutineTaskUp(routineId: string, index: number): Promise<RoutineDetails> {
    const today = this.clock.todayLocal();
    const routine = await this.requireRoutine(routineId);
    const tasks = await this.taskDataSource.listByRoutine(routineId);
    if (Number.isInteger(index) && index > 0 && index < tasks.length) {
      const reordered = [...tasks];
      [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
      const now = this.clock.now();
      const changed = reordered
        .map((task, position) => ({ task, position }))
        .filter(({ task, position }) => task.position !== position)
        .map(({ task, position }) => Object.freeze({ ...task, position, updatedAt: now }));
      await this.taskDataSource.updateMany(changed);
    }
    return this.loadDetails(routine, today);
  }

  private newRoutineTask(routineId: string, title: string, position: number, now: string): Task {
    return Object.freeze({
      id: this.generateId(),
      title,
      completed: false,
      pinned: false,
      createdAt: now,
      updatedAt: now,
      routineId,
      position,
    });
  }

  private async requireRoutine(id: string): Promise<Routine> {
    const routine = await this.routineDataSource.findById(id);
    if (!routine) {
      throw new ValidationError(NOT_FOUND);
    }
    return routine;
  }

  /** Concluir e marcar só nos dias configurados (RF-0012 CA-04; R6). */
  private async requireActiveToday(id: string, today: LocalDate): Promise<Routine> {
    const routine = await this.requireRoutine(id);
    if (!isRoutineActiveOn(routine, today)) {
      throw new ValidationError(NOT_TODAY);
    }
    return routine;
  }

  private async loadDetails(routine: Routine, today: LocalDate): Promise<RoutineDetails> {
    const [tasks, checks, completed] = await Promise.all([
      this.taskDataSource.listByRoutine(routine.id),
      this.routineDataSource.listTaskChecks(routine.id, today),
      this.routineDataSource.listCompletedOn(today),
    ]);
    const checked = new Set(checks);
    return {
      routine,
      taskCount: tasks.length,
      activeToday: isRoutineActiveOn(routine, today),
      doneToday: completed.includes(routine.id),
      nextActiveDay: nextActiveDay(routine, today),
      tasks: tasks.map((task) => ({ task, checkedToday: checked.has(task.id) })),
    };
  }
}
