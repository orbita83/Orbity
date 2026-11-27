import { DEFAULT_FOCUS_DURATION, isFocusDuration } from "@/model/entities/focusDuration";
import {
  FOCUS_CYCLE_NOTIFICATION_ID,
  advanceFocusSessionPhase,
  createInitialFocusSession,
  endFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  type FocusPhase,
  type FocusSession,
  type FocusTarget,
  type FocusTargetKind,
} from "@/model/entities/focusSession";
import { calculateStreak } from "@/model/entities/streak";
import { ValidationError } from "@/model/errors";
import type { IActivityDataSource } from "@/model/datasources/iActivityDataSource";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IFocusSessionDataSource } from "@/model/datasources/iFocusSessionDataSource";
import type { IClockService } from "@/model/services/iClockService";
import type {
  INotificationService,
  NotificationPermissionStatus,
  ScheduleNotificationInput,
} from "@/model/services/iNotificationService";
import type { IFocusUseCases } from "@/usecase/iFocusUseCases";

const defaultGenerateId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `focus-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const TARGET_REQUIRED_ERROR = "Selecione uma tarefa ou rotina para iniciar o modo foco.";
const INVALID_DURATION_ERROR = "Escolha uma duração válida entre 5 e 30 minutos.";
const NO_ACTIVE_SESSION_ERROR = "Não há sessão de foco ativa no momento.";

function buildCycleNotification(
  phase: FocusPhase,
  targetTitle: string,
  triggerAt: string,
): ScheduleNotificationInput {
  if (phase === "focus") {
    return Object.freeze({
      id: FOCUS_CYCLE_NOTIFICATION_ID,
      title: "Ciclo de foco concluído",
      body: `Bom trabalho em "${targetTitle}"! Hora de fazer uma pausa.`,
      triggerAt,
      data: Object.freeze({ route: "/focus-session" }),
    });
  }
  return Object.freeze({
    id: FOCUS_CYCLE_NOTIFICATION_ID,
    title: "Pausa concluída",
    body: `Sua pausa terminou. Pronto para retomar "${targetTitle}"?`,
    triggerAt,
    data: Object.freeze({ route: "/focus-session" }),
  });
}

/**
 * Orquestração dos ciclos pomodoro do Modo Foco (RF-0019, RN-0001, EC-0007, EC-0008, issue #217).
 * Todo o cálculo de tempo usa `IClockService`, sem depender de timers em memória.
 */
export class FocusUseCases implements IFocusUseCases {
  constructor(
    private readonly focusSessions: IFocusSessionDataSource,
    private readonly activities: IActivityDataSource,
    private readonly clock: IClockService,
    private readonly notificationService?: INotificationService,
    private readonly generateId: () => string = defaultGenerateId,
    private readonly dailyActivity?: IDailyActivityDataSource,
  ) {}

  now(): string {
    return this.clock.now();
  }

  async loadSnapshot(): Promise<{
    readonly targets: readonly FocusTarget[];
    readonly activeSession: FocusSession | null;
    readonly lastEndedSession: FocusSession | null;
    readonly streakDays: number;
    readonly nowIso: string;
  }> {
    const nowIso = this.clock.now();
    const today = this.clock.todayLocal();
    const [targets, storedActive, days] = await Promise.all([
      this.activities.listFocusTargets ? this.activities.listFocusTargets() : Promise.resolve([]),
      this.focusSessions.getActive(),
      this.dailyActivity ? this.dailyActivity.listDays() : Promise.resolve([]),
    ]);

    let activeSession = storedActive;
    // Defesa em profundidade (EC-0008): se a atividade vinculada não existir mais, encerra a sessão órfã.
    if (
      activeSession &&
      this.activities.listFocusTargets &&
      !targets.some((item) => item.kind === activeSession!.targetKind && item.id === activeSession!.targetId)
    ) {
      const ended = endFocusSession(activeSession, nowIso);
      await this.focusSessions.save(ended);
      await this.cancelCycleNotification();
      activeSession = null;
    }

    const lastEndedSession = await this.focusSessions.getLatestEnded();
    const streakDays = calculateStreak(days, today).currentDays;
    return Object.freeze({
      targets,
      activeSession,
      lastEndedSession,
      streakDays,
      nowIso,
    });
  }

  async startSession(input: {
    readonly targetKind: FocusTargetKind;
    readonly targetId: string;
    readonly durationMinutes?: number;
  }): Promise<FocusSession> {
    const duration = input.durationMinutes ?? DEFAULT_FOCUS_DURATION;
    if (!isFocusDuration(duration)) {
      throw new ValidationError(INVALID_DURATION_ERROR, "duration");
    }

    const targetId = input.targetId.trim();
    if (!targetId) {
      throw new ValidationError(TARGET_REQUIRED_ERROR, "target");
    }

    const targets = this.activities.listFocusTargets ? await this.activities.listFocusTargets() : [];
    const target = targets.find((item) => item.kind === input.targetKind && item.id === targetId);
    if (!target) {
      throw new ValidationError(TARGET_REQUIRED_ERROR, "target");
    }

    const nowIso = this.clock.now();
    const existingActive = await this.focusSessions.getActive();
    if (existingActive) {
      await this.focusSessions.save(endFocusSession(existingActive, nowIso));
    }

    const session = createInitialFocusSession({
      id: this.generateId(),
      target,
      focusDurationMinutes: duration,
      nowIso,
    });
    await this.focusSessions.save(session);
    await this.scheduleCycleNotification(session);
    return session;
  }

  async pauseSession(): Promise<FocusSession> {
    const active = await this.requireActiveSession();
    if (active.status === "paused") {
      return active;
    }
    const paused = pauseFocusSession(active, this.clock.now());
    await this.focusSessions.save(paused);
    await this.cancelCycleNotification();
    return paused;
  }

  async resumeSession(): Promise<FocusSession> {
    const active = await this.requireActiveSession();
    if (active.status === "running") {
      return active;
    }
    const resumed = resumeFocusSession(active, this.clock.now());
    await this.focusSessions.save(resumed);
    await this.scheduleCycleNotification(resumed);
    return resumed;
  }

  async advanceCycle(): Promise<FocusSession> {
    const active = await this.requireActiveSession();
    const advanced = advanceFocusSessionPhase(active, this.clock.now());
    await this.focusSessions.save(advanced);
    await this.scheduleCycleNotification(advanced);
    return advanced;
  }

  async endSession(): Promise<FocusSession | null> {
    const active = await this.focusSessions.getActive();
    if (!active) {
      await this.cancelCycleNotification();
      return null;
    }
    const ended = endFocusSession(active, this.clock.now());
    await this.focusSessions.save(ended);
    await this.cancelCycleNotification();
    return ended;
  }

  async ensureNotificationPermission(): Promise<NotificationPermissionStatus> {
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

  onCycleNotificationPress(onPress: () => void): () => void {
    if (!this.notificationService?.onNotificationResponse) {
      return () => undefined;
    }
    return this.notificationService.onNotificationResponse((data) => {
      if (data.route !== "/focus-session") {
        return false;
      }
      onPress();
      return true;
    });
  }

  private async requireActiveSession(): Promise<FocusSession> {
    const active = await this.focusSessions.getActive();
    if (!active) {
      throw new ValidationError(NO_ACTIVE_SESSION_ERROR);
    }
    return active;
  }

  private async scheduleCycleNotification(session: FocusSession): Promise<void> {
    if (!this.notificationService || session.status !== "running" || !session.cycleEndsAt) {
      return;
    }
    try {
      const permission = await this.ensureNotificationPermission();
      if (permission !== "granted") {
        return;
      }
      await this.notificationService.schedule(
        buildCycleNotification(session.phase, session.targetTitle, session.cycleEndsAt),
      );
    } catch {
      // Falha técnica ou permissão negada nunca impede o cronômetro de foco (RF-0019 CA-06).
    }
  }

  private async cancelCycleNotification(): Promise<void> {
    if (!this.notificationService) {
      return;
    }
    try {
      await this.notificationService.cancel(FOCUS_CYCLE_NOTIFICATION_ID);
    } catch {
      // Ignora falha ao cancelar notificação nativa.
    }
  }
}
