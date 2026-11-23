import type { DatabaseProvider } from "@/infra/database/databaseProvider";
import { toDataSourceError } from "@/infra/database/persistenceError";
import { LocalDate } from "@/model/entities/localDate";
import type { Star, StarSourceType } from "@/model/entities/star";
import type { IStarDataSource } from "@/model/datasources/iStarDataSource";

type StarRow = {
  id: string;
  source_type: StarSourceType;
  event_key: string;
  earned_date: string;
  created_at: string;
};

type CountRow = {
  total: number;
};

const toStar = (row: StarRow): Star =>
  Object.freeze({
    id: row.id,
    sourceType: row.source_type,
    eventKey: row.event_key,
    earnedDate: LocalDate.parse(row.earned_date),
    createdAt: row.created_at,
  });

/** Persistência em SQLite das estrelas da constelação do estudante (RF-0017, RN-0003, issue #214). */
export class SqliteStarDataSource implements IStarDataSource {
  constructor(private readonly provider: DatabaseProvider) {}

  async awardIfNew(star: Star): Promise<boolean> {
    try {
      const executor = await this.provider.get();
      const existing = await executor.all<{ id: string }>(
        "SELECT id FROM stars WHERE event_key = ? LIMIT 1",
        [star.eventKey],
      );
      if (existing.length > 0) {
        return false;
      }
      await executor.run(
        "INSERT OR IGNORE INTO stars (id, source_type, event_key, earned_date, created_at) VALUES (?, ?, ?, ?, ?)",
        [star.id, star.sourceType, star.eventKey, star.earnedDate.toString(), star.createdAt],
      );
      return true;
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async listAll(): Promise<Star[]> {
    try {
      const executor = await this.provider.get();
      const rows = await executor.all<StarRow>(
        "SELECT id, source_type, event_key, earned_date, created_at FROM stars ORDER BY earned_date ASC, created_at ASC, id ASC",
      );
      return rows.map(toStar);
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async countAll(): Promise<number> {
    try {
      const executor = await this.provider.get();
      const rows = await executor.all<CountRow>("SELECT COUNT(*) AS total FROM stars");
      return Number(rows[0]?.total ?? 0);
    } catch (error) {
      throw toDataSourceError(error);
    }
  }
}
