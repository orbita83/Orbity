import { DomainError } from "@/model/errors/domain-error";

/** Converte qualquer falha do driver em erro de domínio (ARCHITECTURE.md §5). */
export function toDomainError(error: unknown): DomainError {
  if (error instanceof DomainError) {
    return error;
  }
  return new DomainError("PERSISTENCE_FAILURE", "Falha ao acessar o armazenamento local.");
}
