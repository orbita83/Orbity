import { act, renderHook, waitFor } from "@testing-library/react-native";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryRoutineRepository } from "@/infra/repositories/in-memory-routine-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { LocalDate } from "@/model/entities/local-date";
import { DomainError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/i-clock-service";
import type { IRoutineUseCases } from "@/usecase/i-routine-use-cases";
import { RoutineUseCases } from "@/usecase/routine-use-cases";
import { PROTOTYPE_INACTIVE_ROUTINE, PROTOTYPE_ROUTINES } from "@/view/__fixtures__/routines.fixture";
import { UNDO_WINDOW_MS, useRoutinesViewModel } from "@/viewmodel/useRoutinesViewModel";

const ids = (items: { id: string }[]) => items.map((item) => item.id);

/** Segunda-feira: a rotina de Seg a Sex é de hoje. */
const monday: IClockService = {
  now: () => "2026-11-16T08:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-16"),
};

/** Caso de uso real sobre repositórios em memória (Fake), sem banco e sem o container. */
const createUseCases = () => {
  const tasks = new InMemoryTaskRepository();
  const routines = new InMemoryRoutineRepository(tasks);
  const dailyActivity = new InMemoryDailyActivityRepository();
  let seq = 0;
  const useCases = new RoutineUseCases(routines, tasks, dailyActivity, monday, () => `id-${++seq}`);
  return { useCases, dailyActivity };
};

describe("useRoutinesViewModel (protótipo)", () => {
  it("começa vazia quando a lista é vazia", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel([]));
    expect(result.current.visibleRoutines).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("busca pelo nome sem diferenciar maiúsculas", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    await act(async () => result.current.setQuery("ING"));
    expect(ids(result.current.visibleRoutines)).toEqual(["ing"]);
  });

  it("RF-0011: concluir e desmarcar a rotina do dia", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    expect(result.current.doneTodayCount).toBe(1);
    await act(async () => result.current.toggleDoneToday("ing"));
    expect(result.current.doneTodayCount).toBe(2);
  });

  it("R6: o resumo conta só as rotinas de hoje, e a de outro dia não conclui", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel([...PROTOTYPE_ROUTINES, PROTOTYPE_INACTIVE_ROUTINE]));
    expect(result.current.totalCount).toBe(3);
    await act(async () => result.current.toggleDoneToday("fds"));
    expect(result.current.visibleRoutines.find((routine) => routine.id === "fds")?.doneToday).toBe(false);
  });

  it("3.4: excluir mostra o aviso e desfazer devolve a rotina ao mesmo lugar", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    await act(async () => result.current.deleteRoutine("ing"));
    expect(result.current.totalCount).toBe(2);
    expect(result.current.lastDeleted?.title).toBe("Inglês");

    await act(async () => result.current.undoDelete());
    expect(ids(result.current.visibleRoutines)).toEqual(["mat", "ing", "leitura"]);
    expect(result.current.lastDeleted).toBeNull();
  });

  it("o aviso de exclusão some sozinho", async () => {
    jest.useFakeTimers();
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    await act(async () => result.current.deleteRoutine("mat"));
    await act(async () => jest.advanceTimersByTime(UNDO_WINDOW_MS));
    expect(result.current.lastDeleted).toBeNull();
    jest.useRealTimers();
  });
});

describe("useRoutinesViewModel (caso de uso)", () => {
  it("RF-0008: carrega as rotinas e conclui pelo caso de uso, registrando o dia", async () => {
    const { useCases, dailyActivity } = createUseCases();
    await useCases.createRoutine({ title: "Matemática", days: [1, 2, 3, 4, 5], tasks: ["Revisar"] });

    const { result } = await renderHook(() => useRoutinesViewModel(useCases));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.visibleRoutines).toEqual([
      { id: "id-1", title: "Matemática", icon: "track_changes", days: [1, 2, 3, 4, 5], taskCount: 1, activeToday: true, doneToday: false },
    ]);

    await act(async () => result.current.toggleDoneToday("id-1"));
    await waitFor(() => expect(result.current.doneTodayCount).toBe(1));
    expect((await dailyActivity.listDays()).map(String)).toEqual(["2026-11-16"]);
  });

  it("R7: excluir e desfazer passam pelo caso de uso", async () => {
    const { useCases } = createUseCases();
    await useCases.createRoutine({ title: "Matemática", days: [1], tasks: [] });
    const { result } = await renderHook(() => useRoutinesViewModel(useCases));
    await waitFor(() => expect(result.current.visibleRoutines).toHaveLength(1));

    await act(async () => result.current.deleteRoutine("id-1"));
    await waitFor(async () => expect(await useCases.listRoutines()).toEqual([]));

    await act(async () => result.current.undoDelete());
    await waitFor(async () => expect(await useCases.listRoutines()).toHaveLength(1));
    expect(ids(result.current.visibleRoutines)).toEqual(["id-1"]);
  });

  it("falha ao carregar vira aviso, sem quebrar a tela", async () => {
    const failing = { listRoutines: () => Promise.reject(new DomainError("PERSISTENCE_FAILURE")) } as unknown as IRoutineUseCases;
    const { result } = await renderHook(() => useRoutinesViewModel(failing));
    await waitFor(() => expect(result.current.errorKey).toBe("error.load"));
    expect(result.current.loading).toBe(false);
  });
});
