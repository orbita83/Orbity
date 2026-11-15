import type { ActivitySource } from "@/model/entities/activity-source";
import type { StreakSnapshot } from "@/model/entities/streak";

export interface IStreakUseCases {
  /**
   * Registra o dia local de hoje como dia com atividade (idempotente).
   * É o ponto de entrada que Tarefas e Rotinas vão chamar ao concluir algo (RN-0002).
   */
  recordActivity(source: ActivitySource): Promise<void>;
  getStreak(): Promise<StreakSnapshot>;
}
