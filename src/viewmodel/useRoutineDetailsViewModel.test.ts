import { act, renderHook, waitFor } from "@testing-library/react-native";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryRoutineRepository } from "@/infra/repositories/in-memory-routine-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { LocalDate } from "@/model/entities/local-date";
import { DomainError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/i-clock-service";
import { RoutineUseCases } from "@/usecase/routine-use-cases";
import { PROTOTYPE_ROUTINE_DETAILS } from "@/view/__fixtures__/routines.fixture";
import { useRoutineDetailsViewModel } from "@/viewmodel/useRoutineDetailsViewModel";

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

describe("useRoutineDetailsViewModel (protótipo)", () => {
  it("F8: concluir tudo e desmarcar todos", async () => {
    const { result } = await renderHook(() => useRoutineDetailsViewModel(PROTOTYPE_ROUTINE_DETAILS));
    expect(result.current.completedCount).toBe(1);
    await act(async () => result.current.completeAll());
    expect(result.current.doneToday).toBe(true);
    expect(result.current.completedCount).toBe(3);
    await act(async () => result.current.undoAll());
    expect(result.current.doneToday).toBe(false);
    expect(result.current.completedCount).toBe(0);
  });

  it("concluir item a item não conclui a rotina (R3) e reordenar funciona", async () => {
    const { result } = await renderHook(() => useRoutineDetailsViewModel(PROTOTYPE_ROUTINE_DETAILS));
    await act(async () => result.current.toggleTask("b"));
    await act(async () => result.current.toggleTask("c"));
    expect(result.current.completedCount).toBe(3);
    expect(result.current.doneToday).toBe(false);
    await act(async () => result.current.moveTaskUp(2));
    expect(result.current.routine?.tasks.map((task) => task.id)).toEqual(["a", "c", "b"]);
  });

  it("pede confirmação antes de excluir", async () => {
    const { result } = await renderHook(() => useRoutineDetailsViewModel(PROTOTYPE_ROUTINE_DETAILS));
    await act(async () => result.current.requestDelete());
    expect(result.current.confirmDeleteVisible).toBe(true);
    await act(async () => result.current.cancelDelete());
    expect(result.current.confirmDeleteVisible).toBe(false);
  });

  it("sem rotina, fica indisponível", async () => {
    const { result } = await renderHook(() => useRoutineDetailsViewModel());
    expect(result.current.routine).toBeNull();
    expect(result.current.doneToday).toBe(false);
    expect(result.current.loading).toBe(false);
  });
});

describe("useRoutineDetailsViewModel (caso de uso)", () => {
  it("carrega pelo id, conclui, desmarca uma tarefa sem reabrir (R3) e desmarca todos (R4)", async () => {
    const { useCases, dailyActivity } = createUseCases();
    await useCases.createRoutine({ title: "Matemática", days: [1, 2, 3, 4, 5], tasks: ["Revisar", "Resolver"] });
    const { result } = await renderHook(() => useRoutineDetailsViewModel("id-1", useCases));
    await waitFor(() => expect(result.current.routine?.title).toBe("Matemática"));

    await act(async () => result.current.completeAll());
    await waitFor(async () => expect((await useCases.getRoutine("id-1"))?.doneToday).toBe(true));
    expect((await dailyActivity.listDays()).map(String)).toEqual(["2026-11-16"]);

    await act(async () => result.current.toggleTask("id-2"));
    await waitFor(() => expect(result.current.completedCount).toBe(1));
    expect(result.current.doneToday).toBe(true);

    await act(async () => result.current.undoAll());
    await waitFor(() => expect(result.current.doneToday).toBe(false));
    expect(result.current.completedCount).toBe(0);
    expect((await dailyActivity.listDays()).map(String)).toEqual(["2026-11-16"]);
  });

  it("id inexistente mostra a rotina indisponível", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useRoutineDetailsViewModel("nada", useCases));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.routine).toBeNull();
  });

  it("falha ao salvar vira aviso e a tela volta ao que ficou salvo", async () => {
    const { useCases } = createUseCases();
    await useCases.createRoutine({ title: "Matemática", days: [1], tasks: ["Revisar"] });
    jest.spyOn(useCases, "completeOccurrence").mockRejectedValue(new DomainError("PERSISTENCE_FAILURE"));
    const { result } = await renderHook(() => useRoutineDetailsViewModel("id-1", useCases));
    await waitFor(() => expect(result.current.routine).not.toBeNull());

    await act(async () => result.current.completeAll());
    await waitFor(() => expect(result.current.errorKey).toBe("error.save"));
    await waitFor(() => expect(result.current.doneToday).toBe(false));
  });
});
