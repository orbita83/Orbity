import { describeDailyActivityDataSourceContract } from "@/infra/datasources/daily-activity-datasource.contract";
import { MemoryDailyActivityDataSource } from "@/infra/datasources/memory-daily-activity-datasource";

describeDailyActivityDataSourceContract("MemoryDailyActivityDataSource", async () => ({
  dataSource: new MemoryDailyActivityDataSource(),
}));
