import { LocalDate } from "@/model/entities/localDate";
import type { IClockService } from "@/model/services/iClockService";

const pad = (value: number, size = 2): string => String(value).padStart(size, "0");

/** Relógio do aparelho. A data local vem do calendário local, nunca do `toISOString()` (UTC). */
export class SystemClockService implements IClockService {
  constructor(private readonly currentDate: () => Date = () => new Date()) {}

  now(): string {
    const date = this.currentDate();
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absolute = Math.abs(offsetMinutes);
    return (
      `${this.localDateOf(date).toString()}T${pad(date.getHours())}:${pad(date.getMinutes())}:` +
      `${pad(date.getSeconds())}${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`
    );
  }

  todayLocal(): LocalDate {
    return this.localDateOf(this.currentDate());
  }

  private localDateOf(date: Date): LocalDate {
    return LocalDate.parse(`${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
  }
}
