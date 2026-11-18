import type { HomeSummary } from "@/model/entities/homeSummary";

export interface IHomeUseCases {
  /** Sequência, progresso geral e disponibilidade do Modo Foco, lidos juntos. */
  loadHome(): Promise<HomeSummary>;
}
