import type { ActivitySource } from "@/model/entities/activitySource";
import type { Star } from "@/model/entities/star";
import type { StreakSnapshot } from "@/model/entities/streak";

export interface IStreakUseCases {
  /**
   * Registra o dia local de hoje como dia com atividade e concede a estrela do dia (idempotente).
   * É o ponto de entrada que Tarefas e Rotinas vão chamar ao concluir algo (RN-0002, RN-0003).
   */
  recordActivity(source: ActivitySource): Promise<void>;
  getStreak(): Promise<StreakSnapshot>;
  listStars(): Promise<Star[]>;
  getStarCount(): Promise<number>;
}
