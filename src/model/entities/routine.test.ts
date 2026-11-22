import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { LocalDate } from "@/model/entities/localDate";
import { isRoutineActiveOn, weekdayOf } from "@/model/entities/routine";
import { isStandaloneTask } from "@/model/entities/task";

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
