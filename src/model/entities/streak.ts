import type { LocalDate } from "@/model/entities/local-date";

export type StreakSnapshot = {
  currentDays: number;
  lastActiveDate: LocalDate | null;
  asOf: LocalDate;
};

/**
 * Sequência derivada dos dias com atividade (RF-0014, RF-0015).
 * - Dias repetidos contam uma vez; datas depois de `today` são ignoradas (D17).
 * - Se o dia mais recente for hoje ou ontem, conta os dias consecutivos que terminam nele.
 * - Se for anteontem ou antes, a sequência é 0 (RF-0015 CA-05).
 */
export function calculateStreak(days: readonly LocalDate[], today: LocalDate): StreakSnapshot {
  const unique = new Map<string, LocalDate>();
  for (const day of days) {
    if (day.compare(today) <= 0) {
      unique.set(day.toString(), day);
    }
  }
  const sorted = [...unique.values()].sort((a, b) => b.compare(a));
  const lastActiveDate = sorted[0] ?? null;

  if (lastActiveDate === null || lastActiveDate.compare(today.addDays(-1)) < 0) {
    return { currentDays: 0, lastActiveDate, asOf: today };
  }

  let currentDays = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    if (!sorted[index].equals(sorted[index - 1].addDays(-1))) {
      break;
    }
    currentDays += 1;
  }
  return { currentDays, lastActiveDate, asOf: today };
}
