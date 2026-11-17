import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import {
  TASK_CATEGORIES,
  filterAndSortTasks,
  formatDisplayDateInput,
  formatDisplayTimeInput,
  formatTaskDueLabel,
  getTaskCategoryOption,
  isValidDisplayDate,
  isValidDisplayTime,
  normalizeDisplayDate,
  normalizeDisplayTime,
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

  describe("formatDisplayDateInput, formatDisplayTimeInput e normalização", () => {
    it("formata progressivamente datas digitadas apenas com números ou separadores", () => {
      expect(formatDisplayDateInput("")).toBe("");
      expect(formatDisplayDateInput("16")).toBe("16");
      expect(formatDisplayDateInput("16/")).toBe("16/");
      expect(formatDisplayDateInput("161")).toBe("16/1");
      expect(formatDisplayDateInput("1611")).toBe("16/11");
      expect(formatDisplayDateInput("1611/")).toBe("16/11/");
      expect(formatDisplayDateInput("16112026")).toBe("16/11/2026");
      expect(formatDisplayDateInput("5/")).toBe("05/");
      expect(formatDisplayDateInput("5/3/2026")).toBe("05/03/2026");
      expect(formatDisplayDateInput("16-11-2026")).toBe("16/11/2026");
      expect(formatDisplayDateInput("abc")).toBe("");
    });

    it("formata progressivamente horários digitados com ou sem separador", () => {
      expect(formatDisplayTimeInput("")).toBe("");
      expect(formatDisplayTimeInput("08")).toBe("08");
      expect(formatDisplayTimeInput("08:")).toBe("08:");
      expect(formatDisplayTimeInput("083")).toBe("08:3");
      expect(formatDisplayTimeInput("0830")).toBe("08:30");
      expect(formatDisplayTimeInput("8:")).toBe("08:");
      expect(formatDisplayTimeInput("83")).toBe("08:3");
      expect(formatDisplayTimeInput("830")).toBe("08:30");
      expect(formatDisplayTimeInput("8:30")).toBe("08:30");
      expect(formatDisplayTimeInput("08h30")).toBe("08:30");
      expect(formatDisplayTimeInput("abc")).toBe("");
    });

    it("normaliza datas e horários equivalentes e preserva entradas inválidas para validação", () => {
      expect(normalizeDisplayDate("15112026")).toBe("15/11/2026");
      expect(normalizeDisplayDate("5/3/2026")).toBe("05/03/2026");
      expect(normalizeDisplayDate("15-11-2026")).toBe("15/11/2026");
      expect(normalizeDisplayDate("   ")).toBeUndefined();
      expect(normalizeDisplayDate("2026-11-15")).toBe("2026-11-15");

      expect(normalizeDisplayTime("0830")).toBe("08:30");
      expect(normalizeDisplayTime("830")).toBe("08:30");
      expect(normalizeDisplayTime("8:30")).toBe("08:30");
      expect(normalizeDisplayTime("8:5")).toBe("08:05");
      expect(normalizeDisplayTime("08h30")).toBe("08:30");
      expect(normalizeDisplayTime("   ")).toBeUndefined();
      expect(normalizeDisplayTime("25:00")).toBe("25:00");
    });
  });

  describe("validateCreateTaskInput", () => {
    it("aceita e normaliza datas e horários digitados sem formatação prévia", () => {
      const result = validateCreateTaskInput({
        title: "Estudar álgebra",
        startDate: "15112026",
        startTime: "830",
        endDate: "5/12/2026",
        endTime: "9:30",
      });

      expect(result).toMatchObject({
        title: "Estudar álgebra",
        startDate: "15/11/2026",
        startTime: "08:30",
        endDate: "05/12/2026",
        endTime: "09:30",
      });
    });
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
