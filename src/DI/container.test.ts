import { DatabaseProvider } from "@/infra/database/database-provider";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { LocalDate } from "@/model/entities/local-date";
import type { IClockService } from "@/model/services/i-clock-service";

const fixedClock: IClockService = {
  now: () => "2026-11-14T10:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-14"),
};

describe("container da aplicação", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("importar o container não abre o banco", () => {
    const get = jest.spyOn(DatabaseProvider.prototype, "get");

    jest.isolateModules(() => {
      require("@/DI/container");
    });

    expect(get).not.toHaveBeenCalled();
  });

  it("o caso de uso da sequência usa o repositório passado em overrides", async () => {
    const { createAppContainer } = require("@/DI/container") as typeof import("@/DI/container");
    const dailyActivity = new InMemoryDailyActivityRepository();
    const container = createAppContainer({
      repositories: { dailyActivity },
      services: { clock: fixedClock },
    });

    await container.useCases.streak.recordActivity({ kind: "routine", id: "r1" });

    expect((await dailyActivity.listDays()).map(String)).toEqual(["2026-11-14"]);
    expect((await container.useCases.home.loadHome()).streak.currentDays).toBe(1);
  });

  it("o container e seus registros ficam congelados", () => {
    const { container } = require("@/DI/container") as typeof import("@/DI/container");

    expect(Object.isFrozen(container)).toBe(true);
    expect(Object.isFrozen(container.repositories)).toBe(true);
    expect(Object.isFrozen(container.services)).toBe(true);
    expect(Object.isFrozen(container.useCases)).toBe(true);
  });
});
