import { createFocusSessionFixture } from "@/model/__fixtures__/focusSession.fixture";
import { endFocusSession, pauseFocusSession } from "@/model/entities/focusSession";
import type { IFocusSessionDataSource } from "@/model/datasources/iFocusSessionDataSource";

export type FocusSessionDataSourceHarness = {
  dataSource: IFocusSessionDataSource;
  reopen?: () => Promise<IFocusSessionDataSource>;
  cleanup?: () => void;
};

/** Suíte de contrato que toda implementação de IFocusSessionDataSource deve cumprir (issue #217). */
export function describeFocusSessionDataSourceContract(
  name: string,
  factory: () => Promise<FocusSessionDataSourceHarness>,
): void {
  describe(`${name} (contrato IFocusSessionDataSource)`, () => {
    let harness: FocusSessionDataSourceHarness;

    beforeEach(async () => {
      harness = await factory();
    });

    afterEach(() => {
      harness.cleanup?.();
    });

    it("começa sem sessão ativa nem sessão encerrada", async () => {
      expect(await harness.dataSource.getActive()).toBeNull();
      expect(await harness.dataSource.getLatestEnded()).toBeNull();
    });

    it("salva sessão em andamento, atualiza para pausada e depois para encerrada", async () => {
      const initial = createFocusSessionFixture({
        id: "s-1",
        startedAt: "2026-11-25T14:00:00-03:00",
        cycleStartedAt: "2026-11-25T14:00:00-03:00",
        cycleEndsAt: "2026-11-25T14:15:00-03:00",
      });
      await harness.dataSource.save(initial);
      expect(await harness.dataSource.getActive()).toEqual(initial);

      const paused = pauseFocusSession(initial, "2026-11-25T14:06:00-03:00");
      await harness.dataSource.save(paused);
      expect(await harness.dataSource.getActive()).toEqual(paused);

      const ended = endFocusSession(paused, "2026-11-25T14:10:00-03:00");
      await harness.dataSource.save(ended);
      expect(await harness.dataSource.getActive()).toBeNull();
      expect(await harness.dataSource.getLatestEnded()).toEqual(ended);
    });

    it("EC-0008: endActiveByTarget encerra apenas sessões ativas vinculadas ao alvo removido", async () => {
      const targetSession = createFocusSessionFixture({
        id: "s-target",
        targetKind: "standalone-task",
        targetId: "task-42",
        targetTitle: "Estudar Física",
      });
      await harness.dataSource.save(targetSession);

      expect(await harness.dataSource.endActiveByTarget("routine", "task-42", "2026-11-25T14:05:00-03:00")).toBe(false);
      expect(await harness.dataSource.endActiveByTarget("standalone-task", "task-42", "2026-11-25T14:05:00-03:00")).toBe(true);

      expect(await harness.dataSource.getActive()).toBeNull();
      const latest = await harness.dataSource.getLatestEnded();
      expect(latest?.id).toBe("s-target");
      expect(latest?.accumulatedFocusMs).toBe(5 * 60_000);
    });

    it("RF-0019 CA-05: preserva a sessão ativa depois de fechar e reabrir o banco", async () => {
      if (!harness.reopen) return;
      const active = createFocusSessionFixture({ id: "s-persist" });
      await harness.dataSource.save(active);

      const reopened = await harness.reopen();
      expect(await reopened.getActive()).toEqual(active);
    });
  });
}
