import type { ISqlExecutor } from "@/infra/database/i-sql-executor";
import { MIGRATIONS, type Migration } from "@/infra/database/migrations";
import { toDomainError } from "@/infra/database/persistence-error";
import { DomainError } from "@/model/errors/domain-error";

/**
 * Abre o banco e aplica as migrações pendentes no primeiro uso, nunca na importação.
 * - Chamadas simultâneas compartilham uma única tentativa.
 * - Falha com PERSISTENCE_FAILURE descarta a tentativa; a próxima chamada tenta de novo.
 * - SCHEMA_VERSION_UNSUPPORTED fica guardado: o banco não é tocado (D14).
 */
export class DatabaseProvider {
  private pending: Promise<ISqlExecutor> | null = null;

  constructor(
    private readonly openExecutor: () => Promise<ISqlExecutor>,
    private readonly migrations: readonly Migration[] = MIGRATIONS,
  ) {}

  get(): Promise<ISqlExecutor> {
    if (this.pending === null) {
      const attempt = this.openAndMigrate().catch((error: unknown) => {
        const domainError = toDomainError(error);
        if (domainError.retryable && this.pending === attempt) {
          this.pending = null;
        }
        throw domainError;
      });
      this.pending = attempt;
    }
    return this.pending;
  }

  private async openAndMigrate(): Promise<ISqlExecutor> {
    const executor = await this.openExecutor();
    const [row] = await executor.all<{ user_version: number }>("PRAGMA user_version");
    const current = row?.user_version ?? 0;
    const ordered = [...this.migrations].sort((a, b) => a.version - b.version);
    const latest = ordered.at(-1)?.version ?? 0;

    if (current > latest) {
      throw new DomainError(
        "SCHEMA_VERSION_UNSUPPORTED",
        `O banco está na versão ${current}, mais nova que a ${latest} conhecida pelo app.`,
      );
    }

    for (const migration of ordered) {
      if (migration.version > current) {
        await executor.runInTransaction([
          ...migration.statements,
          // Inteiro vindo do código, nunca do usuário: o PRAGMA não aceita parâmetro.
          { sql: `PRAGMA user_version = ${Math.trunc(migration.version)}` },
        ]);
      }
    }
    return executor;
  }
}
