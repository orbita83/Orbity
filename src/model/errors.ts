/**
 * Erros puros de domínio (ARCHITECTURE.md §5). O tipo da falha é a própria subclasse:
 * a ViewModel separa erros previstos de inesperados com `instanceof DomainError` e
 * escolhe a mensagem pela subclasse.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

/**
 * Entrada que viola uma regra de negócio. A mensagem já é a que a tela mostra.
 * `field` indica o campo da entrada que falhou, quando a regra é de um campo só,
 * para a ViewModel mostrar o erro junto dele (ex.: `"title"`).
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/** Falha técnica ao guardar ou ler dados. Admite nova tentativa. */
export class DataSourceError extends DomainError {
  constructor(message: string = "Falha ao acessar o armazenamento local.") {
    super(message);
    this.name = "DataSourceError";
  }
}

/** Banco gravado por uma versão mais nova do app. Não admite nova tentativa (D14). */
export class SchemaVersionError extends DomainError {
  constructor(message: string = "O banco está em uma versão mais nova que a do app.") {
    super(message);
    this.name = "SchemaVersionError";
  }
}

/** Falha técnica ao consultar, agendar ou cancelar notificações locais (ADR-0002). */
export class NotificationServiceError extends DomainError {
  constructor(message: string = "Falha ao acessar o serviço de notificações locais.") {
    super(message);
    this.name = "NotificationServiceError";
  }
}
