import type { LocalDate } from "@/model/entities/localDate";

/** Registro diário de atividade (ADR-0001). Não há operação de apagar (RF-0014 CA-04). */
export interface IDailyActivityDataSource {
  /** Idempotente: registrar o mesmo dia de novo não muda nada. */
  recordDay(date: LocalDate, recordedAt: string): Promise<void>;
  /** Dias registrados, do mais recente para o mais antigo. */
  listDays(): Promise<LocalDate[]>;
}
