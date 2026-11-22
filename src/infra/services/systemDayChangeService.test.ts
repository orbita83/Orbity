import type { AppStateStatus } from "react-native";
import {
  SystemDayChangeService,
  msUntilNextLocalMidnight,
  type AppStatePort,
} from "@/infra/services/systemDayChangeService";
import { LocalDate } from "@/model/entities/localDate";
import type { IClockService } from "@/model/services/iClockService";

class MutableClock implements IClockService {
  constructor(
    private currentIso: string,
    private currentLocal: LocalDate,
  ) {}

  now(): string {
    return this.currentIso;
  }

  todayLocal(): LocalDate {
    return this.currentLocal;
  }

  set(iso: string, localDate: string): void {
    this.currentIso = iso;
    this.currentLocal = LocalDate.parse(localDate);
  }
}

const createFakeAppState = () => {
  const handlers = new Set<(state: AppStateStatus) => void>();
  const removeSpy = jest.fn();
  const port: AppStatePort = {
    addEventListener: (_type, listener) => {
      handlers.add(listener);
      return {
        remove: () => {
          removeSpy();
          handlers.delete(listener);
        },
      };
    },
  };
  return {
    port,
    removeSpy,
    emit: (state: AppStateStatus) => {
      for (const handler of [...handlers]) {
        handler(state);
      }
    },
  };
};

describe("SystemDayChangeService", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calcula os milissegundos restantes até a próxima meia-noite local", () => {
    expect(msUntilNextLocalMidnight("2026-11-16T23:59:50-03:00")).toBe(10_000);
    expect(msUntilNextLocalMidnight("2026-11-16T00:00:00-03:00")).toBe(86_400_000);
  });

  it("avisa na virada de meia-noite com o app aberto", () => {
    const clock = new MutableClock("2026-11-16T23:59:55-03:00", LocalDate.parse("2026-11-16"));
    const appState = createFakeAppState();
    const service = new SystemDayChangeService(clock, appState.port);
    const notified: string[] = [];

    const unsubscribe = service.subscribe((today) => notified.push(today.toString()));

    // Faltam 5 segundos para meia-noite; em 4 segundos ainda é o mesmo dia.
    jest.advanceTimersByTime(4_000);
    expect(notified).toEqual([]);

    // À meia-noite o relógio vira para o dia 17.
    clock.set("2026-11-17T00:00:00-03:00", "2026-11-17");
    jest.advanceTimersByTime(1_000);
    expect(notified).toEqual(["2026-11-17"]);

    unsubscribe();
  });

  it("avisa ao voltar do segundo plano num dia diferente e ignora se continuar no mesmo dia", () => {
    const clock = new MutableClock("2026-11-16T14:00:00-03:00", LocalDate.parse("2026-11-16"));
    const appState = createFakeAppState();
    const service = new SystemDayChangeService(clock, appState.port);
    const notified: string[] = [];

    const unsubscribe = service.subscribe((today) => notified.push(today.toString()));

    // Volta para primeiro plano ainda no mesmo dia: não notifica mudança de dia.
    appState.emit("background");
    clock.set("2026-11-16T18:00:00-03:00", "2026-11-16");
    appState.emit("active");
    expect(notified).toEqual([]);

    // Volta para primeiro plano no dia seguinte: notifica o novo LocalDate.
    appState.emit("background");
    clock.set("2026-11-17T07:30:00-03:00", "2026-11-17");
    appState.emit("active");
    expect(notified).toEqual(["2026-11-17"]);

    unsubscribe();
  });

  it("detecta mudança de fuso horário ou data do aparelho com o app aberto", () => {
    const clock = new MutableClock("2026-11-16T22:00:00-03:00", LocalDate.parse("2026-11-16"));
    const appState = createFakeAppState();
    const service = new SystemDayChangeService(clock, appState.port, 10_000);
    const notified: string[] = [];

    const unsubscribe = service.subscribe((today) => notified.push(today.toString()));

    // Estudante muda o fuso do aparelho para UTC+03:00 (passando a ser 04:00 do dia 17).
    clock.set("2026-11-17T04:00:00+03:00", "2026-11-17");
    jest.advanceTimersByTime(10_000);
    expect(notified).toEqual(["2026-11-17"]);

    unsubscribe();
  });

  it("remove a assinatura do AppState e limpa o temporizador quando o último ouvinte sai", () => {
    const clock = new MutableClock("2026-11-16T20:00:00-03:00", LocalDate.parse("2026-11-16"));
    const appState = createFakeAppState();
    const service = new SystemDayChangeService(clock, appState.port);
    const notified: string[] = [];

    const unsub1 = service.subscribe((today) => notified.push(`1:${today.toString()}`));
    const unsub2 = service.subscribe((today) => notified.push(`2:${today.toString()}`));

    unsub1();
    expect(appState.removeSpy).not.toHaveBeenCalled();

    unsub2();
    expect(appState.removeSpy).toHaveBeenCalledTimes(1);

    clock.set("2026-11-17T08:00:00-03:00", "2026-11-17");
    appState.emit("active");
    jest.advanceTimersByTime(60_000);
    expect(notified).toEqual([]);
  });
});
