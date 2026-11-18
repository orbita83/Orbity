import { describeDailyActivityDataSourceContract } from "@/infra/datasources/dailyActivityDataSource.contract";
import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";

describeDailyActivityDataSourceContract("MemoryDailyActivityDataSource", async () => ({
  dataSource: new MemoryDailyActivityDataSource(),
}));
