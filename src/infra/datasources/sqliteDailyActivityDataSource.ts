import type { DatabaseProvider } from "@/infra/database/databaseProvider";
import { toDataSourceError } from "@/infra/database/persistenceError";
import { LocalDate } from "@/model/entities/localDate";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";

type DailyActivityRow = { local_date: string };

export class SqliteDailyActivityDataSource implements IDailyActivityDataSource {
  constructor(private readonly provider: DatabaseProvider) {}

  async recordDay(date: LocalDate, recordedAt: string): Promise<void> {
    try {
      const executor = await this.provider.get();
      await executor.run(
        "INSERT OR IGNORE INTO daily_activity (local_date, recorded_at) VALUES (?, ?)",
        [date.toString(), recordedAt],
      );
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async listDays(): Promise<LocalDate[]> {
    try {
      const executor = await this.provider.get();
      const rows = await executor.all<DailyActivityRow>(
        "SELECT local_date FROM daily_activity ORDER BY local_date DESC",
      );
      return rows.map((row) => LocalDate.parse(row.local_date));
    } catch (error) {
      throw toDataSourceError(error);
    }
  }
}
