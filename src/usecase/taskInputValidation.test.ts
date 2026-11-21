import { ValidationError } from "@/model/errors";
import {
  isValidDisplayDate,
  isValidDisplayTime,
  normalizeDisplayDate,
  normalizeDisplayTime,
  validateCreateTaskInput,
} from "@/usecase/taskInputValidation";

describe("validações de entrada de tarefa (tarefas.md, G4)", () => {
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

  describe("normalizeDisplayDate e normalizeDisplayTime", () => {
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
        category: "programming",
      });

      expect(result).toEqual({
        title: "Revisar SOLID",
        description: undefined,
        startDate: "15/11/2026",
        startTime: "08:00",
        endDate: "15/11/2026",
        endTime: "09:30",
        category: "programming",
      });
    });

    it("rejeita título em branco com ValidationError que aponta o campo do título", () => {
      expect(() => validateCreateTaskInput({ title: "   " })).toThrow(
        expect.objectContaining({ name: "ValidationError", field: "title" }),
      );
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
});
