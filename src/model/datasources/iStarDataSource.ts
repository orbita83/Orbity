import type { Star } from "@/model/entities/star";

/**
 * Contrato de persistência das estrelas da constelação do estudante (RF-0017, RN-0003, issue #214).
 * Não possui operação de remoção: estrelas conquistadas nunca são perdidas.
 */
export interface IStarDataSource {
  /**
   * Registra uma estrela de forma idempotente pela sua `eventKey` (RF-0017 CA-04).
   * Retorna `true` se a estrela foi concedida agora, ou `false` se o evento já havia gerado estrela.
   */
  awardIfNew(star: Star): Promise<boolean>;
  /** Lista todas as estrelas em ordem cronológica crescente (`earnedDate`, `createdAt`). */
  listAll(): Promise<Star[]>;
  /** Retorna o total acumulado de estrelas conquistadas. */
  countAll(): Promise<number>;
}
