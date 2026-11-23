import { MemoryStarDataSource } from "@/infra/datasources/memoryStarDataSource";
import { LocalDate } from "@/model/entities/localDate";
import { createStreakStar } from "@/model/entities/star";
import { DataSourceError } from "@/model/errors";
import type { IActivityDataSource } from "@/model/datasources/iActivityDataSource";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IClockService } from "@/model/services/iClockService";
import { HomeUseCases } from "@/usecase/homeUseCases";

const today = LocalDate.parse("2026-11-14");

const clock: IClockService = {
  now: () => "2026-11-14T10:00:00-03:00",
  todayLocal: () => today,
};

const dataSourceWith = (days: string[]): IDailyActivityDataSource => ({
  recordDay: jest.fn(async () => undefined),
  listDays: async () => days.map((value) => LocalDate.parse(value)),
});

const activitiesWith = (
  counts: { completed: number; total: number },
  hasFocusTargets = false,
): IActivityDataSource => ({
  getProgressCounts: async () => counts,
  hasFocusTargets: async () => hasFocusTargets,
});

describe("HomeUseCases", () => {
  it("sem atividades: 0/0, foco bloqueado com 15 minutos e sequência 0", async () => {
    const useCases = new HomeUseCases(dataSourceWith([]), activitiesWith({ completed: 0, total: 0 }), clock);

    const summary = await useCases.loadHome();

    expect(summary.progress).toEqual({ completed: 0, total: 0, ratio: null });
    expect(summary.focus).toEqual({
      canStart: false,
      reason: "no-targets",
      durations: [5, 10, 15, 20, 25, 30],
      defaultDuration: 15,
    });
    expect(summary.streak.currentDays).toBe(0);
  });

  it("RN-0007: progresso sobre o total geral", async () => {
    const useCases = new HomeUseCases(dataSourceWith([]), activitiesWith({ completed: 3, total: 30 }), clock);

    expect((await useCases.loadHome()).progress.ratio).toBe(0.1);
  });
  it("RN-0007: pede ao DataSource de atividades o progresso do dia de hoje", async () => {
    const activities = activitiesWith({ completed: 1, total: 2 });
    const spy = jest.spyOn(activities, "getProgressCounts");
    const useCases = new HomeUseCases(dataSourceWith([]), activities, clock);

    await useCases.loadHome();

    expect(spy).toHaveBeenCalledWith(today);
  });

  it("calcula a sequência a partir dos dias registrados e preserva estrelas quando a sequência zera (RN-0003)", async () => {
    const stars = new MemoryStarDataSource();
    await stars.awardIfNew(createStreakStar(LocalDate.parse("2026-11-10"), "2026-11-10T10:00:00-03:00"));
    await stars.awardIfNew(createStreakStar(LocalDate.parse("2026-11-14"), "2026-11-14T10:00:00-03:00"));
    const useCases = new HomeUseCases(
      dataSourceWith(["2026-11-14", "2026-11-13", "2026-11-12"]),
      activitiesWith({ completed: 0, total: 0 }),
      clock,
      undefined,
      stars,
    );

    const summary = await useCases.loadHome();
    expect(summary.streak.currentDays).toBe(3);
    expect(summary.stars).toEqual({ total: 2, earnedToday: true });
  });

  it("com alvos de foco, libera o início", async () => {
    const useCases = new HomeUseCases(dataSourceWith([]), activitiesWith({ completed: 0, total: 1 }, true), clock);

    expect((await useCases.loadHome()).focus).toMatchObject({ canStart: true, reason: null });
  });

  it("repassa a falha do DataSource como DomainError", async () => {
    const failure = new DataSourceError();
    const dataSource: IDailyActivityDataSource = {
      recordDay: async () => undefined,
      listDays: async () => {
        throw failure;
      },
    };
    const useCases = new HomeUseCases(dataSource, activitiesWith({ completed: 0, total: 0 }), clock);

    await expect(useCases.loadHome()).rejects.toBe(failure);
  });

  it("issue #210: delega a inscrição de mudança de dia para o IDayChangeService", () => {
    let capturedListener: ((day: LocalDate) => void) | undefined;
    const unsubscribeSpy = jest.fn();
    const useCases = new HomeUseCases(
      dataSourceWith([]),
      activitiesWith({ completed: 0, total: 0 }),
      clock,
      {
        subscribe: (listener) => {
          capturedListener = listener;
          return unsubscribeSpy;
        },
      },
    );
    const received: string[] = [];
    const unsubscribe = useCases.subscribeDayChange((day) => received.push(day.toString()));

    capturedListener?.(LocalDate.parse("2026-11-15"));
    expect(received).toEqual(["2026-11-15"]);

    unsubscribe();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });
});
