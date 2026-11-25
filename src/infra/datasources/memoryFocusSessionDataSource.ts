import { endFocusSession, type FocusSession, type FocusTargetKind } from "@/model/entities/focusSession";
import type { IFocusSessionDataSource } from "@/model/datasources/iFocusSessionDataSource";

/** Adapter em memória de IFocusSessionDataSource para testes e prévia isolada (issue #217). */
export class MemoryFocusSessionDataSource implements IFocusSessionDataSource {
  private readonly sessions = new Map<string, FocusSession>();

  constructor(initial: readonly FocusSession[] = []) {
    for (const item of initial) {
      this.sessions.set(item.id, Object.freeze({ ...item }));
    }
  }

  async getActive(): Promise<FocusSession | null> {
    const active = [...this.sessions.values()]
      .filter((item) => item.status === "running" || item.status === "paused")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id.localeCompare(a.id));
    return active[0] ?? null;
  }

  async getLatestEnded(): Promise<FocusSession | null> {
    const ended = [...this.sessions.values()]
      .filter((item) => item.status === "ended" && item.endedAt !== null)
      .sort((a, b) => (b.endedAt ?? "").localeCompare(a.endedAt ?? "") || b.id.localeCompare(a.id));
    return ended[0] ?? null;
  }

  async save(session: FocusSession): Promise<void> {
    this.sessions.set(session.id, Object.freeze({ ...session }));
  }

  async endActiveByTarget(targetKind: FocusTargetKind, targetId: string, nowIso: string): Promise<boolean> {
    let changed = false;
    for (const session of this.sessions.values()) {
      if (
        (session.status === "running" || session.status === "paused") &&
        session.targetKind === targetKind &&
        session.targetId === targetId
      ) {
        this.sessions.set(session.id, endFocusSession(session, nowIso));
        changed = true;
      }
    }
    return changed;
  }
}
