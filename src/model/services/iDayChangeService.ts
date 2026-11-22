import type { LocalDate } from "@/model/entities/localDate";

export type DayChangeListener = (today: LocalDate) => void;

/**
 * Contrato do serviço de calendário/mudança de dia local (issue #210).
 * Notifica quando a data de calendário local muda (virada de meia-noite com o app aberto,
 * retorno do segundo plano em outro dia ou mudança de fuso/data do aparelho).
 */
export interface IDayChangeService {
  subscribe(listener: DayChangeListener): () => void;
}
