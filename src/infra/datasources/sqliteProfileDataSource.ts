import type { DatabaseProvider } from "@/infra/database/databaseProvider";
import { toDataSourceError } from "@/infra/database/persistenceError";
import { initialStudentIdentity } from "@/infra/datasources/memoryProfileDataSource";
import type { StudentIdentity } from "@/model/entities/studentProfile";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";

type ProfileRow = {
  id: string;
  name: string;
};

/**
 * Persistência em SQLite da identificação do estudante (issue #280). O banco guarda uma única linha;
 * enquanto o estudante não informa o nome, vale a identificação inicial, sem nome.
 */
export class SqliteProfileDataSource implements IProfileDataSource {
  constructor(private readonly provider: DatabaseProvider) {}

  async getProfile(): Promise<StudentIdentity> {
    try {
      const executor = await this.provider.get();
      const rows = await executor.all<ProfileRow>("SELECT id, name FROM student_profile LIMIT 1");
      const row = rows[0];
      return row ? { id: row.id, name: row.name } : { ...initialStudentIdentity };
    } catch (error) {
      throw toDataSourceError(error);
    }
  }

  async updateName(name: string): Promise<StudentIdentity> {
    try {
      const executor = await this.provider.get();
      const rows = await executor.all<Pick<ProfileRow, "id">>("SELECT id FROM student_profile LIMIT 1");
      const id = rows[0]?.id ?? initialStudentIdentity.id;
      await executor.run(
        "INSERT INTO student_profile (id, name) VALUES (?, ?) ON CONFLICT (id) DO UPDATE SET name = excluded.name",
        [id, name],
      );
      return { id, name };
    } catch (error) {
      throw toDataSourceError(error);
    }
  }
}
