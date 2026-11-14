export type DomainErrorCode =
  | "VALIDATION_ERROR"
  | "PERSISTENCE_FAILURE"
  | "SCHEMA_VERSION_UNSUPPORTED";

// Erro puro de domínio (ARCHITECTURE.md §5). Só PERSISTENCE_FAILURE admite nova tentativa.
export class DomainError extends Error {
  readonly retryable: boolean;

  constructor(
    readonly code: DomainErrorCode,
    message: string = code,
  ) {
    super(message);
    this.name = "DomainError";
    this.retryable = code === "PERSISTENCE_FAILURE";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message);
    this.name = "ValidationError";
  }
}
