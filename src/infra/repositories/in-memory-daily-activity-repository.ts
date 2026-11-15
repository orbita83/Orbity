import type { LocalDate } from "@/model/entities/local-date";
import type { IDailyActivityRepository } from "@/model/repositories/i-daily-activity-repository";

/** Mesmo comportamento do SQLite, em memória. Usado na web (D8) e em testes. */
export class InMemoryDailyActivityRepository implements IDailyActivityRepository {
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
