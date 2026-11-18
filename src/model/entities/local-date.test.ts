import { LocalDate } from "@/model/entities/local-date";
import { ValidationError } from "@/model/errors";

describe("LocalDate", () => {
  it("converte e devolve o texto AAAA-MM-DD", () => {
    expect(LocalDate.parse("2026-11-14").toString()).toBe("2026-11-14");
  });

  it("vira o mês ao somar dias", () => {
    expect(LocalDate.parse("2026-11-30").addDays(1).toString()).toBe("2026-12-01");
  });

  it("vira o ano ao somar e ao subtrair dias", () => {
    expect(LocalDate.parse("2026-12-31").addDays(1).toString()).toBe("2027-01-01");
    expect(LocalDate.parse("2027-01-01").addDays(-1).toString()).toBe("2026-12-31");
  });

  it("respeita o 29 de fevereiro em ano bissexto", () => {
    expect(LocalDate.parse("2028-02-28").addDays(1).toString()).toBe("2028-02-29");
    expect(LocalDate.parse("2027-02-28").addDays(1).toString()).toBe("2027-03-01");
  });

  it("não muda de dia na troca de horário de verão", () => {
    // O Brasil não usa horário de verão hoje, mas a aritmética não pode depender do fuso.
    expect(LocalDate.parse("2026-10-31").addDays(1).toString()).toBe("2026-11-01");
  });

  it.each(["2026-1-01", "14/11/2026", "2026-13-01", "2026-02-30", "2027-02-29", ""])(
    "rejeita a data inválida %p",
    (value) => {
      expect(() => LocalDate.parse(value)).toThrow(ValidationError);
    },
  );

  it("compara e verifica igualdade", () => {
    const today = LocalDate.parse("2026-11-14");
    expect(today.compare(LocalDate.parse("2026-11-13"))).toBe(1);
    expect(today.compare(LocalDate.parse("2026-11-15"))).toBe(-1);
    expect(today.compare(LocalDate.parse("2026-11-14"))).toBe(0);
    expect(today.equals(LocalDate.parse("2026-11-14"))).toBe(true);
  });
});
