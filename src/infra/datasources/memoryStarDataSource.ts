import type { Star } from "@/model/entities/star";
import type { IStarDataSource } from "@/model/datasources/iStarDataSource";

/** Mesmo comportamento do SQLite, em memória. Usado em testes. */
export class MemoryStarDataSource implements IStarDataSource {
  private readonly starsByEventKey = new Map<string, Star>();

  async awardIfNew(star: Star): Promise<boolean> {
    if (this.starsByEventKey.has(star.eventKey)) {
      return false;
    }
    this.starsByEventKey.set(star.eventKey, Object.freeze({ ...star }));
    return true;
  }

  async listAll(): Promise<Star[]> {
    return [...this.starsByEventKey.values()].sort((a, b) => {
      const byDate = a.earnedDate.compare(b.earnedDate);
      if (byDate !== 0) return byDate;
      const byTime = a.createdAt.localeCompare(b.createdAt);
      return byTime !== 0 ? byTime : a.id.localeCompare(b.id);
    });
  }

  async countAll(): Promise<number> {
    return this.starsByEventKey.size;
  }
}
