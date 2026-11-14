import { describeDailyActivityRepositoryContract } from "@/infra/repositories/daily-activity-repository.contract";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";

describeDailyActivityRepositoryContract("InMemoryDailyActivityRepository", async () => ({
  repository: new InMemoryDailyActivityRepository(),
}));
