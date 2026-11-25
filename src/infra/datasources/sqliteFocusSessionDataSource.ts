import type { DatabaseProvider } from "@/infra/database/databaseProvider";
import { toDataSourceError } from "@/infra/database/persistenceError";
import type { FocusDuration } from "@/model/entities/focusDuration";
import {
  endFocusSession,
  type FocusPhase,
  type FocusSession,
  type FocusSessionStatus,
  type FocusTargetKind,
} from "@/model/entities/focusSession";
import type { IFocusSessionDataSource } from "@/model/datasources/iFocusSessionDataSource";

type FocusSessionRow = {
  id: string;
  target_kind: FocusTargetKind;
  target_id: string;
  target_title: string;
  focus_duration_minutes: FocusDuration;
  phase: FocusPhase;
  status: FocusSessionStatus;
  completed_focus_cycles: number;
  cycle_duration_ms: number;
  cycle_started_at: string;
  cycle_ends_at: string | null;
  paused_remaining_ms: number | null;
  accumulated_focus_ms: number;
  started_at: string;
  ended_at: string | null;
  updated_at: string;
};

const SELECT_COLUMNS = `
  id,
  target_kind,
  target_id,
  target_title,
  focus_duration_minutes,
  phase,
  status,
  completed_focus_cycles,
  cycle_duration_ms,
  cycle_started_at,
  cycle_ends_at,
  paused_remaining_ms,
  accumulated_focus_ms,
  started_at,
  ended_at,
  updated_at
`;

const mapRowToSession = (row: FocusSessionRow): FocusSession =>
  Object.freeze({
    id: row.id,
    targetKind: row.target_kind,
    targetId: row.target_id,
    targetTitle: row.target_title,
    focusDurationMinutes: Number(row.focus_duration_minutes) as FocusDuration,
    phase: row.phase,
    status: row.status,
    completedFocusCycles: Number(row.completed_focus_cycles),
    cycleDurationMs: Number(row.cycle_duration_ms),
    cycleStartedAt: row.cycle_started_at,
    cycleEndsAt: row.cycle_ends_at,
    pausedRemainingMs: row.paused_remaining_ms === null ? null : Number(row.paused_remaining_ms),
    accumulatedFocusMs: Number(row.accumulated_focus_ms),
    startedAt: row.started_at,
    endedAt: row.ended_at,
    updatedAt: row.updated_at,
  });

/** Persistência em SQLite das sessões do Modo Foco (migração v7, issue #217). */
export class SqliteFocusSessionDataSource implements IFocusSessionDataSource {
  constructor(private readonly provider: DatabaseProvider) {}

  async getActive(): Promise<FocusSession | null> {
    try {
      const executor = await this.provider.get();
      const rows = await executor.all<FocusSessionRow>(
        `SELECT ${SELECT_COLUMNS} FROM focus_sessions WHERE status IN ('running', 'paused') ORDER BY updated_at DESC, id DESC LIMIT 1`,
      );
      return rows[0] ? mapRowToSession(rows[0]) : null;
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async getLatestEnded(): Promise<FocusSession | null> {
    try {
      const executor = await this.provider.get();
      const rows = await executor.all<FocusSessionRow>(
        `SELECT ${SELECT_COLUMNS} FROM focus_sessions WHERE status = 'ended' AND ended_at IS NOT NULL ORDER BY ended_at DESC, id DESC LIMIT 1`,
      );
      return rows[0] ? mapRowToSession(rows[0]) : null;
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async save(session: FocusSession): Promise<void> {
    try {
      const executor = await this.provider.get();
      await executor.run(
        `INSERT INTO focus_sessions (
          id,
          target_kind,
          target_id,
          target_title,
          focus_duration_minutes,
          phase,
          status,
          completed_focus_cycles,
          cycle_duration_ms,
          cycle_started_at,
          cycle_ends_at,
          paused_remaining_ms,
          accumulated_focus_ms,
          started_at,
          ended_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          target_kind = excluded.target_kind,
          target_id = excluded.target_id,
          target_title = excluded.target_title,
          focus_duration_minutes = excluded.focus_duration_minutes,
          phase = excluded.phase,
          status = excluded.status,
          completed_focus_cycles = excluded.completed_focus_cycles,
          cycle_duration_ms = excluded.cycle_duration_ms,
          cycle_started_at = excluded.cycle_started_at,
          cycle_ends_at = excluded.cycle_ends_at,
          paused_remaining_ms = excluded.paused_remaining_ms,
          accumulated_focus_ms = excluded.accumulated_focus_ms,
          started_at = excluded.started_at,
          ended_at = excluded.ended_at,
          updated_at = excluded.updated_at`,
        [
          session.id,
          session.targetKind,
          session.targetId,
          session.targetTitle,
          session.focusDurationMinutes,
          session.phase,
          session.status,
          session.completedFocusCycles,
          session.cycleDurationMs,
          session.cycleStartedAt,
          session.cycleEndsAt,
          session.pausedRemainingMs,
          session.accumulatedFocusMs,
          session.startedAt,
          session.endedAt,
          session.updatedAt,
        ],
      );
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async endActiveByTarget(targetKind: FocusTargetKind, targetId: string, nowIso: string): Promise<boolean> {
    try {
      const executor = await this.provider.get();
      const rows = await executor.all<FocusSessionRow>(
        `SELECT ${SELECT_COLUMNS} FROM focus_sessions WHERE status IN ('running', 'paused') AND target_kind = ? AND target_id = ?`,
        [targetKind, targetId],
      );
      if (rows.length === 0) {
        return false;
      }
      for (const row of rows) {
        const ended = endFocusSession(mapRowToSession(row), nowIso);
        await this.save(ended);
      }
      return true;
    } catch (error) {
      throw toDataSourceError(error);
    }
  }
}
