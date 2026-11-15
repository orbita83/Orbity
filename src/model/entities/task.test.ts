import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import {
  TASK_CATEGORIES,
  filterAndSortTasks,
  formatTaskDueLabel,
  getTaskCategoryOption,
  isValidDisplayDate,
  isValidDisplayTime,
  validateCreateTaskInput,
} from "@/model/entities/task";
import { ValidationError } from "@/model/errors/domain-error";

describe("Entidade Task e validações de domínio", () => {
  describe("isValidDisplayDate e isValidDisplayTime", () => {
    it("aceita datas de calendário reais em dd/mm/aaaa e rejeita datas inexistentes", () => {
      expect(isValidDisplayDate("15/11/2026")).toBe(true);
      expect(isValidDisplayDate("29/02/2024")).toBe(true);
      expect(isValidDisplayDate("29/02/2026")).toBe(false);
      expect(isValidDisplayDate("31/04/2026")).toBe(false);
      expect(isValidDisplayDate("2026-11-15")).toBe(false);
    });

    it("aceita horários válidos em 24h hh:mm e rejeita valores fora da faixa", () => {
      expect(isValidDisplayTime("00:00")).toBe(true);
      expect(isValidDisplayTime("23:59")).toBe(true);
      expect(isValidDisplayTime("24:00")).toBe(false);
      expect(isValidDisplayTime("12:60")).toBe(false);
      expect(isValidDisplayTime("8:30")).toBe(false);
    });
  });

  describe("validateCreateTaskInput", () => {
    it("normaliza campos válidos e remove espaços extras", () => {
      const result = validateCreateTaskInput({
        title: "  Revisar SOLID  ",
        description: "   ",
        startDate: " 15/11/2026 ",
        startTime: "08:00",
        endDate: "15/11/2026",
        endTime: "09:30",
        category: "programacao",
      });

      expect(result).toEqual({
        title: "Revisar SOLID",
        description: undefined,
        startDate: "15/11/2026",
        startTime: "08:00",
        endDate: "15/11/2026",
        endTime: "09:30",
        category: "programacao",
      });
    });

    it("rejeita título em branco com ValidationError", () => {
      expect(() => validateCreateTaskInput({ title: "   " })).toThrow(ValidationError);
    });

    it("rejeita data ou horário inválidos com ValidationError", () => {
      expect(() => validateCreateTaskInput({ title: "Estudar", startDate: "31/02/2026" })).toThrow(ValidationError);
      expect(() => validateCreateTaskInput({ title: "Estudar", endTime: "25:00" })).toThrow(ValidationError);
    });

    it("rejeita intervalo em que término antecede o início", () => {
      expect(() =>
        validateCreateTaskInput({
          title: "Estudar",
          startDate: "16/11/2026",
          endDate: "15/11/2026",
        }),
      ).toThrow(ValidationError);

      expect(() =>
        validateCreateTaskInput({
          title: "Estudar",
          startDate: "15/11/2026",
          startTime: "10:00",
          endDate: "15/11/2026",
          endTime: "09:00",
        }),
      ).toThrow(ValidationError);
    });
  });

  describe("formatTaskDueLabel", () => {
    it("formata data única com faixa de horário no padrão curto do card", () => {
      expect(
        formatTaskDueLabel({
          startDate: "19/10/2026",
          startTime: "08:00",
          endDate: "19/10/2026",
          endTime: "09:00",
        }),
      ).toBe("19/10 · 08:00–09:00");
    });

    it("formata intervalos entre dias diferentes e retorna undefined quando vazio", () => {
      expect(
        formatTaskDueLabel({
          startDate: "19/10/2026",
          startTime: "08:00",
          endDate: "21/10/2026",
          endTime: "18:00",
        }),
      ).toBe("19/10 08:00 – 21/10 18:00");

      expect(formatTaskDueLabel({})).toBeUndefined();
    });
  });

  describe("filterAndSortTasks e categorias", () => {
    it("filtra por status e mantém fixadas no topo preservando ordem relativa", () => {
      const a = createTaskFixture({ id: "a", completed: false, pinned: false });
      const b = createTaskFixture({ id: "b", completed: true, pinned: false });
      const c = createTaskFixture({ id: "c", completed: false, pinned: true });

      expect(filterAndSortTasks([a, b, c], "all").map((item) => item.id)).toEqual(["c", "a", "b"]);
      expect(filterAndSortTasks([a, b, c], "pending").map((item) => item.id)).toEqual(["c", "a"]);
      expect(filterAndSortTasks([a, b, c], "completed").map((item) => item.id)).toEqual(["b"]);
    });

    it("encontra categorias suportadas pelo catálogo", () => {
      expect(TASK_CATEGORIES.length).toBeGreaterThanOrEqual(5);
      expect(getTaskCategoryOption("programacao")?.label).toBe("Programação");
      expect(getTaskCategoryOption("inexistente")).toBeUndefined();
    });
  });
});
