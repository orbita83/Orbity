import type { LocalDate } from "@/model/entities/localDate";

export interface IClockService {
  /** Instante atual em ISO-8601 com o deslocamento do fuso (ex.: 2026-11-14T23:59:00-03:00). */
  now(): string;
  /** Data de calendário local do aparelho. */
  todayLocal(): LocalDate;
}
