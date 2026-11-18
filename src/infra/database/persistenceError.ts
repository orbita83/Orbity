import { DataSourceError, DomainError } from "@/model/errors";

/** Converte qualquer falha do driver em erro de domínio (ARCHITECTURE.md §5). */
export function toDataSourceError(error: unknown): DomainError {
  if (error instanceof DomainError) {
    return error;
  }
  return new DataSourceError();
}
