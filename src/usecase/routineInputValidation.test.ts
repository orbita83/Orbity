import { ValidationError } from "@/model/errors";
import { validateCreateRoutineInput } from "@/usecase/routineInputValidation";

describe("validateCreateRoutineInput", () => {
  it("RF-0007: exige um nome", () => {
    expect(() => validateCreateRoutineInput({ title: "   ", days: [1], tasks: [] })).toThrow(
      new ValidationError("Dê um nome para a rotina."),
    );
  });

  it("RF-0012: exige pelo menos um dia", () => {
    expect(() => validateCreateRoutineInput({ title: "Inglês", days: [], tasks: [] })).toThrow(
      new ValidationError("Escolha pelo menos um dia."),
    );
  });

  it("recusa dia fora da semana e ícone em branco (se o ícone existe é checado no caso de uso)", () => {
    expect(() => validateCreateRoutineInput({ title: "Inglês", days: [7], tasks: [] })).toThrow(ValidationError);
    expect(() => validateCreateRoutineInput({ title: "Inglês", days: [1], icon: "  ", tasks: [] })).toThrow(ValidationError);
  });

  it("normaliza nome, descrição, dias e tarefas, com o ícone Geral por padrão", () => {
    const normalized = validateCreateRoutineInput({
      title: "  Inglês ",
      description: "   ",
      days: [5, 1, 3, 1],
      tasks: [" Vocabulário ", "", "  ", "Leitura"],
    });

    expect(normalized).toEqual({
      title: "Inglês",
      description: undefined,
      icon: "general",
      days: [1, 3, 5],
      tasks: ["Vocabulário", "Leitura"],
    });
  });
});
