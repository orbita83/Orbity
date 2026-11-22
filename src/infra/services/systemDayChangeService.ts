import { AppState, type AppStateStatus } from "react-native";
import type { LocalDate } from "@/model/entities/localDate";
import type { IClockService } from "@/model/services/iClockService";
import type { DayChangeListener, IDayChangeService } from "@/model/services/iDayChangeService";

const MS_PER_DAY = 86_400_000;
const DEFAULT_TIMEZONE_WATCH_INTERVAL_MS = 30_000;
const ISO_TIME_PATTERN = /T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?/;

export type AppStateSubscription = {
  remove: () => void;
};

export type AppStatePort = {
  addEventListener: (type: "change", listener: (state: AppStateStatus) => void) => AppStateSubscription;
};

/** Calcula quantos milissegundos faltam até a próxima meia-noite local a partir do ISO `clock.now()`. */
export function msUntilNextLocalMidnight(nowIso: string): number {
  const match = ISO_TIME_PATTERN.exec(nowIso);
  if (!match) {
    return DEFAULT_TIMEZONE_WATCH_INTERVAL_MS;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const millis = match[4] ? Number(match[4].padEnd(3, "0")) : 0;
  const elapsedMs = ((hours * 60 + minutes) * 60 + seconds) * 1000 + millis;
  const remaining = MS_PER_DAY - elapsedMs;
  return remaining > 0 ? remaining : MS_PER_DAY;
}

/**
 * Serviço nativo de calendário/mudança de dia local (issue #210).
 * Combina:
 * - retorno do segundo plano (`AppState` -> `"active"`), comparando a data atual com a última conhecida;
 * - agendamento de aviso para a próxima meia-noite local enquanto o app estiver aberto;
 * - verificação de mudança de fuso horário ou ajuste manual de data do aparelho.
 */
export class SystemDayChangeService implements IDayChangeService {
  private readonly listeners = new Set<DayChangeListener>();
  private lastKnownDate: LocalDate | null = null;
  private appStateSubscription: AppStateSubscription | null = null;
  private timerId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly clock: IClockService,
    private readonly appState: AppStatePort = AppState,
    private readonly maxWatchIntervalMs: number = DEFAULT_TIMEZONE_WATCH_INTERVAL_MS,
  ) {}

  subscribe(listener: DayChangeListener): () => void {
    const wasEmpty = this.listeners.size === 0;
    this.listeners.add(listener);
    if (wasEmpty) {
      this.startWatching();
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stopWatching();
      }
    };
  }

  private startWatching(): void {
    this.lastKnownDate = this.clock.todayLocal();
    this.appStateSubscription = this.appState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        this.checkForDayChange();
        this.scheduleNextTick();
      }
    });
    this.scheduleNextTick();
  }

  private stopWatching(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.lastKnownDate = null;
  }

  private scheduleNextTick(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.listeners.size === 0) return;

    const untilMidnight = msUntilNextLocalMidnight(this.clock.now());
    const delay = Math.max(50, Math.min(untilMidnight, this.maxWatchIntervalMs));
    this.timerId = setTimeout(() => {
      this.timerId = null;
      if (this.listeners.size === 0) return;
      this.checkForDayChange();
      this.scheduleNextTick();
    }, delay);
  }

  private checkForDayChange(): void {
    const current = this.clock.todayLocal();
    if (this.lastKnownDate !== null && !current.equals(this.lastKnownDate)) {
      this.lastKnownDate = current;
      for (const listener of [...this.listeners]) {
        listener(current);
      }
    } else {
      this.lastKnownDate = current;
    }
  }
}
