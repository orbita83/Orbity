import { LocalDate } from "@/model/entities/local-date";
import { DomainError } from "@/model/errors/domain-error";
import type { IActivityCatalog } from "@/model/repositories/i-activity-catalog";
import type { IDailyActivityRepository } from "@/model/repositories/i-daily-activity-repository";
import type { IClockService } from "@/model/services/i-clock-service";
import { HomeUseCases } from "@/usecase/home-use-cases";

const today = LocalDate.parse("2026-11-14");

const clock: IClockService = {
  now: () => "2026-11-14T10:00:00-03:00",
  todayLocal: () => today,
};

const repositoryWith = (days: string[]): IDailyActivityRepository => ({
  recordDay: jest.fn(async () => undefined),
  listDays: async () => days.map((value) => LocalDate.parse(value)),
});

const catalogWith = (
  counts: { completed: number; total: number },
  hasFocusTargets = false,
): IActivityCatalog => ({
  getProgressCounts: async () => counts,
  hasFocusTargets: async () => hasFocusTargets,
});

describe("HomeUseCases", () => {
  it("catálogo vazio: 0/0, foco bloqueado com 15 minutos e sequência 0", async () => {
    const useCases = new HomeUseCases(repositoryWith([]), catalogWith({ completed: 0, total: 0 }), clock);

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
    const useCases = new HomeUseCases(repositoryWith([]), catalogWith({ completed: 3, total: 30 }), clock);

    expect((await useCases.loadHome()).progress.ratio).toBe(0.1);
  });
  it("RN-0007: pede ao catálogo o progresso do dia de hoje", async () => {
    const catalog = catalogWith({ completed: 1, total: 2 });
    const spy = jest.spyOn(catalog, "getProgressCounts");
    const useCases = new HomeUseCases(repositoryWith([]), catalog, clock);

    await useCases.loadHome();

    expect(spy).toHaveBeenCalledWith(today);
  });

  it("calcula a sequência a partir dos dias registrados", async () => {
    const useCases = new HomeUseCases(
      repositoryWith(["2026-11-14", "2026-11-13", "2026-11-12"]),
      catalogWith({ completed: 0, total: 0 }),
      clock,
    );

    expect((await useCases.loadHome()).streak.currentDays).toBe(3);
  });

  it("com alvos de foco, libera o início", async () => {
    const useCases = new HomeUseCases(repositoryWith([]), catalogWith({ completed: 0, total: 1 }, true), clock);

    expect((await useCases.loadHome()).focus).toMatchObject({ canStart: true, reason: null });
  });

  it("repassa a falha do repositório como DomainError", async () => {
    const failure = new DomainError("PERSISTENCE_FAILURE");
    const repository: IDailyActivityRepository = {
      recordDay: async () => undefined,
      listDays: async () => {
        throw failure;
      },
    };
    const useCases = new HomeUseCases(repository, catalogWith({ completed: 0, total: 0 }), clock);

    await expect(useCases.loadHome()).rejects.toBe(failure);
  });
});
