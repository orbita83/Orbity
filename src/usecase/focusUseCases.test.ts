import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { MemoryFocusSessionDataSource } from "@/infra/datasources/memoryFocusSessionDataSource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryStarDataSource } from "@/infra/datasources/memoryStarDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { TaskActivityDataSource } from "@/infra/datasources/taskActivityDataSource";
import { createRoutineFixture } from "@/model/__fixtures__/routine.fixture";
import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { FOCUS_CYCLE_NOTIFICATION_ID, computeRemainingMs, computeTotalFocusedMinutes } from "@/model/entities/focusSession";
import { LocalDate } from "@/model/entities/localDate";
import { ValidationError } from "@/model/errors";
import type { IClockService } from "@/model/services/iClockService";
import { FocusUseCases } from "@/usecase/focusUseCases";
import { RoutineUseCases } from "@/usecase/routineUseCases";
import { TaskUseCases } from "@/usecase/taskUseCases";
import { FakeNotificationService } from "../../tests/fixtures/fakeNotificationService";

describe("FocusUseCases (issue #217)", () => {
  const setup = (initialPermission: "granted" | "denied" | "undetermined" = "granted") => {
    let nowIso = "2026-11-25T14:00:00-03:00";
    const clock: IClockService = {
      now: () => nowIso,
      todayLocal: () => LocalDate.parse(nowIso.slice(0, 10)),
    };
    const tasks = new MemoryTaskDataSource();
    const routines = new MemoryRoutineDataSource(tasks);
    const focusSessions = new MemoryFocusSessionDataSource();
    const dailyActivity = new MemoryDailyActivityDataSource();
    const stars = new MemoryStarDataSource();
    const activities = new TaskActivityDataSource(tasks, routines);
    const notifications = new FakeNotificationService(initialPermission, initialPermission === "denied" ? "denied" : "granted");
    let seq = 0;
    const focusUseCases = new FocusUseCases(focusSessions, activities, clock, notifications, () => `focus-${++seq}`);
    const taskUseCases = new TaskUseCases(
      tasks,
      dailyActivity,
      clock,
      () => `task-${++seq}`,
      stars,
      undefined,
      notifications,
      focusSessions,
    );
    const routineUseCases = new RoutineUseCases(
      routines,
      tasks,
      dailyActivity,
      clock,
      () => `routine-${++seq}`,
      undefined,
      stars,
      undefined,
      focusSessions,
      notifications,
    );

    return {
      focusUseCases,
      taskUseCases,
      routineUseCases,
      tasks,
      routines,
      focusSessions,
      dailyActivity,
      stars,
      notifications,
      setNow: (next: string) => {
        nowIso = next;
      },
    };
  };

  it("RN-0001 e RF-0019: impede iniciar sem tarefa/rotina ou com duração fora da lista pré-definida", async () => {
    const { focusUseCases, tasks } = setup();

    await expect(
      focusUseCases.startSession({ targetKind: "standalone-task", targetId: "inexistente", durationMinutes: 15 }),
    ).rejects.toBeInstanceOf(ValidationError);

    await tasks.create(createTaskFixture({ id: "t-1", title: "Estudar Cálculo" }));
    await expect(
      focusUseCases.startSession({ targetKind: "standalone-task", targetId: "   ", durationMinutes: 15 }),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      focusUseCases.startSession({ targetKind: "standalone-task", targetId: "t-1", durationMinutes: 12 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("conduz foco, segundo plano, pausar, retomar, avançar ciclo e encerrar com aviso local, sem mexer na sequência", async () => {
    const { focusUseCases, tasks, dailyActivity, stars, notifications, setNow } = setup("undetermined");
    await tasks.create(createTaskFixture({ id: "t-1", title: "Estudar Álgebra" }));

    // Inicia foco padrão de 15 min às 14:00
    const started = await focusUseCases.startSession({ targetKind: "standalone-task", targetId: "t-1" });
    expect(started.focusDurationMinutes).toBe(15);
    expect(started.cycleEndsAt).toBe("2026-11-25T14:15:00-03:00");
    expect(await notifications.listScheduled()).toEqual([
      expect.objectContaining({
        id: FOCUS_CYCLE_NOTIFICATION_ID,
        triggerAt: "2026-11-25T14:15:00-03:00",
      }),
    ]);

    // Simula ida ao segundo plano por 6 min -> restam 9 min
    setNow("2026-11-25T14:06:00-03:00");
    const snapInBackground = await focusUseCases.loadSnapshot();
    expect(computeRemainingMs(snapInBackground.activeSession!, snapInBackground.nowIso)).toBe(9 * 60_000);

    // Pausa -> congela 9 min e cancela a notificação
    const paused = await focusUseCases.pauseSession();
    expect(paused.status).toBe("paused");
    expect(paused.pausedRemainingMs).toBe(9 * 60_000);
    expect(await notifications.listScheduled()).toEqual([]);

    // Retoma 10 min depois (14:16) -> novo término em 14:25 e reagenda notificação
    setNow("2026-11-25T14:16:00-03:00");
    const resumed = await focusUseCases.resumeSession();
    expect(resumed.cycleEndsAt).toBe("2026-11-25T14:25:00-03:00");
    expect(await notifications.listScheduled()).toEqual([
      expect.objectContaining({
        id: FOCUS_CYCLE_NOTIFICATION_ID,
        triggerAt: "2026-11-25T14:25:00-03:00",
      }),
    ]);

    // Conclui o ciclo de foco às 14:25 e avança para pausa curta de 5 min (14:30)
    setNow("2026-11-25T14:25:00-03:00");
    const shortBreak = await focusUseCases.advanceCycle();
    expect(shortBreak.phase).toBe("short-break");
    expect(shortBreak.completedFocusCycles).toBe(1);
    expect(shortBreak.cycleEndsAt).toBe("2026-11-25T14:30:00-03:00");
    expect(await notifications.listScheduled()).toEqual([
      expect.objectContaining({
        id: FOCUS_CYCLE_NOTIFICATION_ID,
        title: "Pausa concluída",
        triggerAt: "2026-11-25T14:30:00-03:00",
      }),
    ]);

    // Encerra durante a pausa às 14:27 -> registra apenas os 15 min de foco e cancela notificação
    setNow("2026-11-25T14:27:00-03:00");
    const ended = await focusUseCases.endSession();
    expect(ended?.status).toBe("ended");
    expect(computeTotalFocusedMinutes(ended!, "2026-11-25T14:27:00-03:00")).toBe(15);
    expect(await notifications.listScheduled()).toEqual([]);
    // RF-0019 CA-04: não registra atividade diária nem estrela
    expect(await dailyActivity.listDays()).toEqual([]);
    expect(await stars.countAll()).toBe(0);
  });

  it("EC-0008: excluir a tarefa ou rotina vinculada encerra a sessão ativa e cancela a notificação de ciclo", async () => {
    const { focusUseCases, taskUseCases, routineUseCases, routines, notifications, setNow } = setup("granted");
    const task = await taskUseCases.createTask({ title: "Revisar Física" });
    await focusUseCases.startSession({ targetKind: "standalone-task", targetId: task.id, durationMinutes: 25 });
    expect((await notifications.listScheduled()).some((n) => n.id === FOCUS_CYCLE_NOTIFICATION_ID)).toBe(true);

    setNow("2026-11-25T14:08:00-03:00");
    await taskUseCases.deleteTasks([task.id]);

    const afterTaskDelete = await focusUseCases.loadSnapshot();
    expect(afterTaskDelete.activeSession).toBeNull();
    expect(afterTaskDelete.lastEndedSession?.accumulatedFocusMs).toBe(8 * 60_000);
    expect((await notifications.listScheduled()).some((n) => n.id === FOCUS_CYCLE_NOTIFICATION_ID)).toBe(false);

    // O mesmo vale para uma rotina excluída
    await routines.create(createRoutineFixture({ id: "r-1", title: "Leitura Diária" }), []);
    await focusUseCases.startSession({ targetKind: "routine", targetId: "r-1", durationMinutes: 10 });
    setNow("2026-11-25T14:12:00-03:00");
    await routineUseCases.deleteRoutine("r-1");

    expect((await focusUseCases.loadSnapshot()).activeSession).toBeNull();
    expect((await notifications.listScheduled()).some((n) => n.id === FOCUS_CYCLE_NOTIFICATION_ID)).toBe(false);
  });

  it("RF-0019 CA-06: funciona normalmente sem permissão de notificações e propaga toque na notificação de foco", async () => {
    const { focusUseCases, tasks, notifications } = setup("denied");
    await tasks.create(createTaskFixture({ id: "t-1", title: "Química" }));

    const session = await focusUseCases.startSession({ targetKind: "standalone-task", targetId: "t-1" });
    expect(session.status).toBe("running");
    expect(await notifications.listScheduled()).toEqual([]);

    let pressedCount = 0;
    const unsubscribe = focusUseCases.onCycleNotificationPress(() => {
      pressedCount += 1;
    });
    notifications.emitNotificationResponse({ route: "/focus-session" });
    notifications.emitNotificationResponse({ route: "/tasks" });
    unsubscribe();
    notifications.emitNotificationResponse({ route: "/focus-session" });

    expect(pressedCount).toBe(1);
  });

  it("abre a sessão de foco quando o toque no aviso de fim de ciclo abriu o app (início a frio)", () => {
    const { focusUseCases, notifications } = setup("granted");
    notifications.setLaunchResponse({ route: "/focus-session" });

    let pressedCount = 0;
    focusUseCases.onCycleNotificationPress(() => {
      pressedCount += 1;
    })();
    focusUseCases.onCycleNotificationPress(() => {
      pressedCount += 1;
    })();

    expect(pressedCount).toBe(1);
  });
});
