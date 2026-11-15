import { createPersistence } from "@/DI/persistence.web";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";

describe("createPersistence (web)", () => {
  it("D8: na web, o registro diário fica em memória", () => {
    expect(createPersistence().dailyActivity).toBeInstanceOf(InMemoryDailyActivityRepository);
  });
});
