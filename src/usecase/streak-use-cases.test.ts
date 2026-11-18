import { LocalDate } from "@/model/entities/local-date";
import { ValidationError } from "@/model/errors/domain-error";
import type { IDailyActivityDataSource } from "@/model/datasources/i-daily-activity-datasource";
import type { IClockService } from "@/model/services/i-clock-service";
import { StreakUseCases } from "@/usecase/streak-use-cases";

class FakeDailyActivityDataSource implements IDailyActivityDataSource {
  readonly days = new Map<string, LocalDate>();

  async recordDay(date: LocalDate): Promise<void> {
    if (!this.days.has(date.toString())) this.days.set(date.toString(), date);
  }

  async listDays(): Promise<LocalDate[]> {
    return [...this.days.values()].sort((a, b) => b.compare(a));
  }
}

class FakeClock implements IClockService {
  constructor(public today: string, public time = "10:00:00") {}

  now(): string {
    return `${this.today}T${this.time}-03:00`;
  }

  todayLocal(): LocalDate {
    return LocalDate.parse(this.today);
  }
}

describe("StreakUseCases", () => {
  let dataSource: FakeDailyActivityDataSource;
  let clock: FakeClock;
  let useCases: StreakUseCases;

  beforeEach(() => {
    dataSource = new FakeDailyActivityDataSource();
    clock = new FakeClock("2026-11-14");
    useCases = new StreakUseCases(dataSource, clock);
  });

  it("RF-0015 CA-03: três conclusões no mesmo dia registram um dia e a sequência é 1", async () => {
    await useCases.recordActivity({ kind: "standalone-task", id: "t1" });
    await useCases.recordActivity({ kind: "routine", id: "r1" });
    await useCases.recordActivity({ kind: "standalone-task", id: "t2" });

    expect((await dataSource.listDays()).map(String)).toEqual(["2026-11-14"]);
    expect((await useCases.getStreak()).currentDays).toBe(1);
  });

  it("rejeita atividade sem identificador", async () => {
    await expect(useCases.recordActivity({ kind: "routine", id: "  " })).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(dataSource.days.size).toBe(0);
  });

  it("RF-0015 CA-04: atividade às 23h59 ainda conta às 00h01 do dia seguinte", async () => {
    clock.time = "23:59:00";
    await useCases.recordActivity({ kind: "standalone-task", id: "t1" });

    clock.today = "2026-11-15";
    clock.time = "00:01:00";
    expect((await useCases.getStreak()).currentDays).toBe(1);
  });

  it("RF-0015 CA-05: sem atividade no dia seguinte, a sequência zera", async () => {
    await useCases.recordActivity({ kind: "standalone-task", id: "t1" });

    clock.today = "2026-11-16";
    expect((await useCases.getStreak()).currentDays).toBe(0);
  });

  it("grava o instante com o deslocamento do fuso", async () => {
    const spy = jest.spyOn(dataSource, "recordDay");
    await useCases.recordActivity({ kind: "routine", id: "r1" });
    expect(spy).toHaveBeenCalledWith(LocalDate.parse("2026-11-14"), "2026-11-14T10:00:00-03:00");
  });
});
