import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import {
  TASK_CATEGORY_IDS,
  buildTaskReminderId,
  filterAndSortTasks,
  getTaskReminderTriggerAt,
  isTaskCategoryId,
  isTaskReminderId,
} from "@/model/entities/task";

describe("Entidade Task", () => {
  describe("filterAndSortTasks", () => {
    it("filtra por status e mantém fixadas no topo preservando ordem relativa", () => {
      const a = createTaskFixture({ id: "a", completed: false, pinned: false });
      const b = createTaskFixture({ id: "b", completed: true, pinned: false });
      const c = createTaskFixture({ id: "c", completed: false, pinned: true });

      expect(filterAndSortTasks([a, b, c], "all").map((item) => item.id)).toEqual(["c", "a", "b"]);
      expect(filterAndSortTasks([a, b, c], "pending").map((item) => item.id)).toEqual(["c", "a"]);
      expect(filterAndSortTasks([a, b, c], "completed").map((item) => item.id)).toEqual(["b"]);
    });
  });

  describe("categorias (tarefas.md, T3)", () => {
    it("reconhece só os ids de categoria do domínio", () => {
      expect(TASK_CATEGORY_IDS).toEqual(["mathematics", "reading", "languages", "science", "programming", "music"]);
      expect(isTaskCategoryId("programming")).toBe(true);
      expect(isTaskCategoryId("programacao")).toBe(false);
      expect(isTaskCategoryId("code")).toBe(false);
    });
  });

  describe("lembretes de tarefa agendada (RN-0011)", () => {
    const referenceIso = "2026-11-15T09:00:00-03:00";

    it("gera e reconhece o identificador determinístico task-reminder:<id>", () => {
      expect(buildTaskReminderId("t-42")).toBe("task-reminder:t-42");
      expect(isTaskReminderId("task-reminder:t-42")).toBe(true);
      expect(isTaskReminderId("task-reminder:")).toBe(false);
      expect(isTaskReminderId("focus-cycle-end")).toBe(false);
    });

    it("calcula o instante ISO com fuso para tarefa avulsa pendente com início futuro", () => {
      const task = createTaskFixture({
        id: "t-1",
        startDate: "15/11/2026",
        startTime: "14:30",
        completed: false,
      });

      expect(getTaskReminderTriggerAt(task, referenceIso)).toBe("2026-11-15T14:30:00-03:00");
    });

    it("retorna null para tarefa sem data/hora, concluída, de rotina ou com horário no passado", () => {
      expect(
        getTaskReminderTriggerAt(
          createTaskFixture({ startDate: "15/11/2026", startTime: undefined }),
          referenceIso,
        ),
      ).toBeNull();
      expect(
        getTaskReminderTriggerAt(
          createTaskFixture({ startDate: undefined, startTime: "14:30" }),
          referenceIso,
        ),
      ).toBeNull();
      expect(
        getTaskReminderTriggerAt(
          createTaskFixture({ startDate: "15/11/2026", startTime: "14:30", completed: true }),
          referenceIso,
        ),
      ).toBeNull();
      expect(
        getTaskReminderTriggerAt(
          createTaskFixture({ startDate: "15/11/2026", startTime: "14:30", routineId: "r-1", position: 0 }),
          referenceIso,
        ),
      ).toBeNull();
      expect(
        getTaskReminderTriggerAt(
          createTaskFixture({ startDate: "15/11/2026", startTime: "09:00" }),
          referenceIso,
        ),
      ).toBeNull();
      expect(
        getTaskReminderTriggerAt(
          createTaskFixture({ startDate: "15/11/2026", startTime: "08:59" }),
          referenceIso,
        ),
      ).toBeNull();
    });
  });
});
