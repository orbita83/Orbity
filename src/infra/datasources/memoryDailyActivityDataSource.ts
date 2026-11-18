import type { LocalDate } from "@/model/entities/localDate";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";

/** Mesmo comportamento do SQLite, em memória. Usado na web (D8) e em testes. */
export class MemoryDailyActivityDataSource implements IDailyActivityDataSource {
  private readonly days = new Map<string, LocalDate>();

  async recordDay(date: LocalDate): Promise<void> {
    if (!this.days.has(date.toString())) {
      this.days.set(date.toString(), date);
    }
  }

  async listDays(): Promise<LocalDate[]> {
    return [...this.days.values()].sort((a, b) => b.compare(a));
  }
}
