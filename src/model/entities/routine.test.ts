import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { LocalDate } from "@/model/entities/localDate";
import { isRoutineActiveOn, nextActiveDay, weekdayOf } from "@/model/entities/routine";
import { isStandaloneTask } from "@/model/entities/task";
import { ValidationError } from "@/model/errors";

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

  it("nextActiveDay: todos os dias marcados na segunda volta na terça (dia seguinte)", () => {
    const routine = createRoutineFixture({ days: [0, 1, 2, 3, 4, 5, 6] });
    const next = nextActiveDay(routine, LocalDate.parse("2026-11-16")); // segunda
    expect(next.date.toString()).toBe("2026-11-17");
    expect(next.weekday).toBe(2); // terça
    expect(next.daysAhead).toBe(1);
  });

  it("nextActiveDay: só segunda marcada na segunda volta na próxima segunda (7 dias)", () => {
    const routine = createRoutineFixture({ days: [1] });
    const next = nextActiveDay(routine, LocalDate.parse("2026-11-16")); // segunda
    expect(next.date.toString()).toBe("2026-11-23");
    expect(next.weekday).toBe(1); // próxima segunda
    expect(next.daysAhead).toBe(7);
  });

  it("nextActiveDay: segunda, quarta e sexta na segunda volta na quarta", () => {
    const routine = createRoutineFixture({ days: [1, 3, 5] });
    const next = nextActiveDay(routine, LocalDate.parse("2026-11-16")); // segunda
    expect(next.date.toString()).toBe("2026-11-18");
    expect(next.weekday).toBe(3); // quarta
    expect(next.daysAhead).toBe(2);
  });

  it("nextActiveDay: segunda, quarta e sexta na sexta volta na segunda seguinte", () => {
    const routine = createRoutineFixture({ days: [1, 3, 5] });
    const next = nextActiveDay(routine, LocalDate.parse("2026-11-20")); // sexta
    expect(next.date.toString()).toBe("2026-11-23");
    expect(next.weekday).toBe(1); // segunda seguinte
    expect(next.daysAhead).toBe(3);
  });

  it("nextActiveDay: terça e quinta consultada na quarta (fora do dia) volta na quinta", () => {
    const routine = createRoutineFixture({ days: [2, 4] });
    const next = nextActiveDay(routine, LocalDate.parse("2026-11-18")); // quarta
    expect(next.date.toString()).toBe("2026-11-19");
    expect(next.weekday).toBe(4); // quinta
    expect(next.daysAhead).toBe(1);
  });

  it("nextActiveDay: rejeita rotina sem dias válidos", () => {
    expect(() => nextActiveDay({ days: [] }, LocalDate.parse("2026-11-16"))).toThrow(ValidationError);
  });
});

describe("isStandaloneTask (RN-0002)", () => {
  it("só a tarefa sem rotina é avulsa", () => {
    expect(isStandaloneTask({})).toBe(true);
    expect(isStandaloneTask({ routineId: "routine-1" })).toBe(false);
  });
});
