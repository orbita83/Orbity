import type { HomeSummary } from "@/model/entities/home-summary";

export interface IHomeUseCases {
  /** Sequência, progresso geral e disponibilidade do Modo Foco, lidos juntos. */
  loadHome(): Promise<HomeSummary>;
}
