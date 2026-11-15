import { ValidationError } from "@/model/errors/domain-error";

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

const pad = (value: number, size: number): string => String(value).padStart(size, "0");

/**
 * Data de calendário "AAAA-MM-DD", sem hora e sem fuso. É a única forma de representar
 * "um dia" no domínio. Nunca use `toISOString()` para obter uma data local: ele devolve UTC.
 */
export class LocalDate {
  private constructor(
    readonly year: number,
    readonly month: number,
    readonly day: number,
  ) {}

  static parse(value: string): LocalDate {
    const match = LOCAL_DATE_PATTERN.exec(value);
    if (!match) {
      throw new ValidationError(`Data local inválida: "${value}".`);
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    // Date.UTC só faz a aritmética de calendário; nenhum fuso entra na conta.
    const probe = new Date(Date.UTC(year, month - 1, day));
    if (
      probe.getUTCFullYear() !== year ||
      probe.getUTCMonth() !== month - 1 ||
      probe.getUTCDate() !== day
    ) {
      throw new ValidationError(`Data local inexistente: "${value}".`);
    }
    return new LocalDate(year, month, day);
  }

  toString(): string {
    return `${pad(this.year, 4)}-${pad(this.month, 2)}-${pad(this.day, 2)}`;
  }

  addDays(n: number): LocalDate {
    if (!Number.isInteger(n)) {
      throw new ValidationError(`A quantidade de dias deve ser inteira: ${n}.`);
    }
    const shifted = new Date((this.toEpochDay() + n) * MS_PER_DAY);
    return new LocalDate(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
  }

  equals(other: LocalDate): boolean {
    return this.compare(other) === 0;
  }

  compare(other: LocalDate): -1 | 0 | 1 {
    const difference = this.toEpochDay() - other.toEpochDay();
    return difference < 0 ? -1 : difference > 0 ? 1 : 0;
  }

  private toEpochDay(): number {
    return Date.UTC(this.year, this.month - 1, this.day) / MS_PER_DAY;
  }
}
