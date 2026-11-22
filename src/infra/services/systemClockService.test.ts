import { SystemClockService } from "@/infra/services/systemClockService";

// Os testes rodam em America/Sao_Paulo (tests/setup/timezone.cjs), UTC−3.
const clockAt = (date: Date) => new SystemClockService(() => date);

describe("SystemClockService", () => {
  it("RF-0015 CA-08: 23h59 ainda é o mesmo dia", () => {
    expect(clockAt(new Date(2026, 10, 14, 23, 59)).todayLocal().toString()).toBe("2026-11-14");
  });

  it("RF-0015 CA-08: 00h01 já é o dia seguinte", () => {
    expect(clockAt(new Date(2026, 10, 15, 0, 1)).todayLocal().toString()).toBe("2026-11-15");
  });

  it("usa o dia local mesmo quando em UTC já é o dia seguinte", () => {
    const date = new Date(2026, 10, 14, 22, 0);
    expect(date.toISOString().startsWith("2026-11-15")).toBe(true);
    expect(clockAt(date).todayLocal().toString()).toBe("2026-11-14");
  });

  it("now() traz o deslocamento do fuso", () => {
    expect(clockAt(new Date(2026, 10, 14, 23, 59, 7)).now()).toBe("2026-11-14T23:59:07-03:00");
  });
});
