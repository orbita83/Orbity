import { LocalDate } from "@/model/entities/local-date";
import { calculateStreak } from "@/model/entities/streak";

const D = LocalDate.parse("2026-11-14");
const day = (offset: number) => D.addDays(offset);

describe("calculateStreak", () => {
  it("sem dias registrados, a sequência é 0", () => {
    expect(calculateStreak([], D)).toEqual({ currentDays: 0, lastActiveDate: null, asOf: D });
  });

  it("RF-0015 CA-01: atividade hoje dá 1", () => {
    expect(calculateStreak([day(0)], D).currentDays).toBe(1);
  });

  it("RF-0015 CA-02: hoje e ontem dão 2", () => {
    expect(calculateStreak([day(0), day(-1)], D).currentDays).toBe(2);
  });

  it("RF-0015 CA-03: dias repetidos contam uma vez", () => {
    expect(calculateStreak([day(0), day(0), day(-1)], D).currentDays).toBe(2);
  });

  it("RF-0015 CA-04: atividade só ontem mantém 1 até o fim de hoje", () => {
    const snapshot = calculateStreak([day(-1)], D);
    expect(snapshot.currentDays).toBe(1);
    expect(snapshot.lastActiveDate?.equals(day(-1))).toBe(true);
  });

  it("RF-0015 CA-05: atividade mais recente anteontem zera a sequência", () => {
    const snapshot = calculateStreak([day(-2)], D);
    expect(snapshot.currentDays).toBe(0);
    expect(snapshot.lastActiveDate?.equals(day(-2))).toBe(true);
  });

  it("RF-0015 CA-07: depois de um intervalo, recomeça em 1", () => {
    expect(calculateStreak([day(0), day(-2)], D).currentDays).toBe(1);
  });

  it("para no primeiro dia que falta", () => {
    expect(calculateStreak([day(0), day(-1), day(-3)], D).currentDays).toBe(2);
  });

  it("D17: datas futuras ficam fora da conta", () => {
    expect(calculateStreak([day(1), day(0)], D).currentDays).toBe(1);
  });

  it("não depende da ordem de entrada", () => {
    expect(calculateStreak([day(-2), day(0), day(-1)], D).currentDays).toBe(3);
  });

  it("conta 10 dias seguidos como 10", () => {
    const days = Array.from({ length: 10 }, (_, index) => day(-index));
    expect(calculateStreak(days, D).currentDays).toBe(10);
  });
});
