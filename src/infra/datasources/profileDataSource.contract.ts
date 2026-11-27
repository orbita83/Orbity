import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";

export type ProfileDataSourceHarness = {
  dataSource: IProfileDataSource;
  reopen?: () => Promise<IProfileDataSource>;
  cleanup?: () => void;
};

/** Suíte de contrato que toda implementação de IProfileDataSource deve cumprir (issue #280). */
export function describeProfileDataSourceContract(
  name: string,
  factory: () => Promise<ProfileDataSourceHarness>,
): void {
  describe(`${name} (contrato IProfileDataSource)`, () => {
    let harness: ProfileDataSourceHarness;

    beforeEach(async () => {
      harness = await factory();
    });

    afterEach(() => {
      harness.cleanup?.();
    });

    it("começa com a identificação inicial, sem nome", async () => {
      expect(await harness.dataSource.getProfile()).toEqual({ id: "local-student", name: "" });
    });

    it("atualiza o nome e o devolve nas consultas seguintes", async () => {
      expect(await harness.dataSource.updateName("Lucas Mendes")).toEqual({ id: "local-student", name: "Lucas Mendes" });
      expect(await harness.dataSource.getProfile()).toEqual({ id: "local-student", name: "Lucas Mendes" });

      await harness.dataSource.updateName("Ana");
      expect(await harness.dataSource.getProfile()).toEqual({ id: "local-student", name: "Ana" });
    });

    it("issue #280: o nome salvo continua lá depois de reabrir o app", async () => {
      if (!harness.reopen) return;
      await harness.dataSource.updateName("Camila Santos");

      const reopened = await harness.reopen();

      expect(await reopened.getProfile()).toEqual({ id: "local-student", name: "Camila Santos" });
    });
  });
}
