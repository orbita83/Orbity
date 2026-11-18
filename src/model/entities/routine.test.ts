import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { LocalDate } from "@/model/entities/localDate";
import { isRoutineActiveOn, validateCreateRoutineInput, weekdayOf } from "@/model/entities/routine";
import { isStandaloneTask } from "@/model/entities/task";
import { ValidationError } from "@/model/errors";

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

  it("recusa dia ou ícone fora da lista", () => {
    expect(() => validateCreateRoutineInput({ title: "Inglês", days: [7], tasks: [] })).toThrow(ValidationError);
    expect(() => validateCreateRoutineInput({ title: "Inglês", days: [1], icon: "rocket", tasks: [] })).toThrow(ValidationError);
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
      icon: "track_changes",
      days: [1, 3, 5],
      tasks: ["Vocabulário", "Leitura"],
    });
  });
});

describe("dias ativos (RF-0012 CA-04)", () => {
  it("calcula o dia da semana da data local", () => {
    expect(weekdayOf(LocalDate.parse("2026-11-15"))).toBe(0); // domingo
    expect(weekdayOf(LocalDate.parse("2026-11-16"))).toBe(1); // segunda
    expect(weekdayOf(LocalDate.parse("2026-11-21"))).toBe(6); // sábado
  });

  it("uma rotina de Seg a Sex acontece na segunda e não no sábado", () => {
    const routine = createRoutineFixture({ days: [1, 2, 3, 4, 5] });
    expect(isRoutineActiveOn(routine, LocalDate.parse("2026-11-16"))).toBe(true);
    expect(isRoutineActiveOn(routine, LocalDate.parse("2026-11-21"))).toBe(false);
  });
});

describe("isStandaloneTask (RN-0002)", () => {
  it("só a tarefa sem rotina é avulsa", () => {
    expect(isStandaloneTask({})).toBe(true);
    expect(isStandaloneTask({ routineId: "routine-1" })).toBe(false);
  });
});
