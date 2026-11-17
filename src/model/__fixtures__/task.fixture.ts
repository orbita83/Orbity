import type { Task } from "@/model/entities/task";

const DEFAULT_TASK: Task = Object.freeze({
  id: "task-1",
  title: "Revisar matemática discreta",
  description: "Resolver lista de grafos e indução",
  startDate: "15/11/2026",
  startTime: "08:00",
  endDate: "15/11/2026",
  endTime: "09:00",
  category: "matematica",
  completed: false,
  pinned: false,
  createdAt: "2026-11-15T08:00:00-03:00",
  updatedAt: "2026-11-15T08:00:00-03:00",
});

/** Cria uma tarefa congelada para testes de domínio, casos de uso e apresentação. */
export function createTaskFixture(overrides: Partial<Task> = {}): Task {
  return Object.freeze({ ...DEFAULT_TASK, ...overrides });
}
