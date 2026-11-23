import type { LocalDate } from "@/model/entities/localDate";

export type StarSourceType = "streak" | "achievement";

/**
 * Estrela conquistada pelo estudante na constelação (RF-0017, RN-0003).
 * Identificada de forma única e idempotente por `eventKey`.
 */
export type Star = {
  readonly id: string;
  readonly sourceType: StarSourceType;
  /** Chave única do evento gerador (ex.: "streak:2026-11-22" ou "achievement:first-streak"). */
  readonly eventKey: string;
  /** Data local em que a estrela foi conquistada. */
  readonly earnedDate: LocalDate;
  /** Instante ISO-8601 com deslocamento local em que foi registrada. */
  readonly createdAt: string;
};

export function streakStarEventKey(date: LocalDate): string {
  return `streak:${date.toString()}`;
}

export function createStreakStar(date: LocalDate, createdAt: string, id = `star-streak-${date.toString()}`): Star {
  return Object.freeze({
    id,
    sourceType: "streak",
    eventKey: streakStarEventKey(date),
    earnedDate: date,
    createdAt,
  });
}
