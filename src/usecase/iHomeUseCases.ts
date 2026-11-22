import type { HomeSummary } from "@/model/entities/homeSummary";
import type { DayChangeListener } from "@/model/services/iDayChangeService";

export interface IHomeUseCases {
  /** Sequência, progresso geral e disponibilidade do Modo Foco, lidos juntos. */
  loadHome(): Promise<HomeSummary>;
  /** Inscreve um ouvinte para recalcular a Tela Inicial quando o dia local muda (issue #210). */
  subscribeDayChange?(listener: DayChangeListener): () => void;
}
