/**
 * Erros puros de domínio do Orbity.
 * Não possuem dependências de bibliotecas externas ou frameworks.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string = "DOMAIN_ERROR",
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}
