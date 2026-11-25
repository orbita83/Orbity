import { createInitialFocusSession, type FocusSession } from "@/model/entities/focusSession";

export function createFocusSessionFixture(overrides: Partial<FocusSession> = {}): FocusSession {
  const base = createInitialFocusSession({
    id: "focus-1",
    target: { kind: "standalone-task", id: "task-1", title: "Estudar Cálculo" },
    focusDurationMinutes: 15,
    nowIso: "2026-11-25T14:00:00-03:00",
  });
  return Object.freeze({
    ...base,
    ...overrides,
  });
}
