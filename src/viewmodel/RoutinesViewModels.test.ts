import { act, renderHook, waitFor } from "@testing-library/react-native";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryRoutineRepository } from "@/infra/repositories/in-memory-routine-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { LocalDate } from "@/model/entities/local-date";
import { DomainError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/i-clock-service";
import type { IRoutineUseCases } from "@/usecase/i-routine-use-cases";
import { RoutineUseCases } from "@/usecase/routine-use-cases";
import { PROTOTYPE_INACTIVE_ROUTINE, PROTOTYPE_ROUTINE_DETAILS, PROTOTYPE_ROUTINES } from "@/view/__fixtures__/routines.fixture";
import { useNewRoutineViewModel } from "@/viewmodel/NewRoutineViewModel";
import { useRoutineDetailsViewModel } from "@/viewmodel/RoutineDetailsViewModel";
import { UNDO_WINDOW_MS, useRoutinesViewModel } from "@/viewmodel/RoutinesViewModel";

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

describe("useNewRoutineViewModel", () => {
  it("RF-0007 e RF-0012: exige nome e pelo menos um dia sem chamar o caso de uso nem perder o que foi digitado", async () => {
    const { useCases } = createUseCases();
    const create = jest.spyOn(useCases, "createRoutine");
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases));
    await act(async () => result.current.setDescription("Estudos diários"));
    await act(async () => result.current.submit());

    expect(result.current.nameError).toBe(true);
    expect(result.current.daysError).toBe(true);
    expect(result.current.description).toBe("Estudos diários");
    expect(create).not.toHaveBeenCalled();
  });

  it("cria a rotina com as tarefas na ordem escolhida", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases));
    await act(async () => result.current.setName("Matemática"));
    await act(async () => result.current.toggleDay(3));
    await act(async () => result.current.toggleDay(1));
    expect(result.current.days).toEqual([1, 3]);
    for (const title of ["Revisar", "Resolver", "   "]) {
      await act(async () => result.current.setDraft(title));
      await act(async () => result.current.addTask());
    }
    await act(async () => result.current.moveTaskUp(1));
    expect(result.current.tasks).toEqual(["Resolver", "Revisar"]);

    await act(async () => result.current.submit());
    await waitFor(() => expect(result.current.created).toBe(true));
    const details = await useCases.getRoutine("id-1");
    expect(details?.routine.days).toEqual([1, 3]);
    expect(details?.tasks.map((item) => item.task.title)).toEqual(["Resolver", "Revisar"]);
  });

  it("falha ao salvar mostra o aviso e preserva o formulário", async () => {
    const failing = { createRoutine: () => Promise.reject(new DomainError("PERSISTENCE_FAILURE")) } as unknown as IRoutineUseCases;
    const { result } = await renderHook(() => useNewRoutineViewModel(failing));
    await act(async () => result.current.setName("Matemática"));
    await act(async () => result.current.toggleDay(1));
    await act(async () => result.current.submit());

    await waitFor(() => expect(result.current.formError).toBe("Não foi possível salvar a rotina agora. Tente de novo."));
    expect(result.current.name).toBe("Matemática");
    expect(result.current.submitting).toBe(false);
    expect(result.current.created).toBe(false);
  });

  it("o ícone começa em Geral e pode ser trocado", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases));
    expect(result.current.icon).toBe("track_changes");
    await act(async () => result.current.setIcon("science"));
    expect(result.current.icon).toBe("science");
  });
});

describe("useNewRoutineViewModel (edição, #137)", () => {
  const createMath = async (useCases: RoutineUseCases) => {
    const routine = await useCases.createRoutine({
      title: "Matemática",
      icon: "calculate",
      description: "Diária",
      days: [1, 3],
      tasks: ["Revisar", "Resolver"],
    });
    return routine.id;
  };

  it("RF-0009 CA-02: abre com as informações atuais da rotina", async () => {
    const { useCases } = createUseCases();
    const id = await createMath(useCases);
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases, id));

    expect(result.current.editing).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({
      name: "Matemática",
      icon: "calculate",
      description: "Diária",
      days: [1, 3],
      tasks: ["Revisar", "Resolver"],
    });
    // Sem alterações, sai sem perguntar.
    expect(result.current.requestLeave()).toBe(true);
  });

  it("RF-0009 CA-03 a CA-06: salva mantendo as tarefas existentes e a marcação delas", async () => {
    const { useCases } = createUseCases();
    const id = await createMath(useCases);
    const [revisar] = (await useCases.getRoutine(id))!.tasks;
    await useCases.toggleRoutineTask(id, revisar.task.id);
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases, id));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => result.current.setName("Cálculo"));
    await act(async () => result.current.removeTask(1));
    await act(async () => result.current.setDraft("Anotar"));
    await act(async () => result.current.addTask());
    await act(async () => result.current.moveTaskUp(1));
    await act(async () => result.current.submit());
    await waitFor(() => expect(result.current.created).toBe(true));

    const details = (await useCases.getRoutine(id))!;
    expect(details.routine.title).toBe("Cálculo");
    expect(details.tasks.map(({ task, checkedToday }) => [task.title, checkedToday])).toEqual([
      ["Anotar", false],
      ["Revisar", true],
    ]);
    expect(details.tasks[1].task.id).toBe(revisar.task.id);
  });

  it("sair com alterações pede confirmação, e continuar editando mantém o que foi digitado", async () => {
    const { useCases } = createUseCases();
    const id = await createMath(useCases);
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases, id));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => result.current.toggleDay(5));

    let canLeave = true;
    await act(async () => {
      canLeave = result.current.requestLeave();
    });
    expect(canLeave).toBe(false);
    expect(result.current.discardVisible).toBe(true);

    await act(async () => result.current.cancelLeave());
    expect(result.current.discardVisible).toBe(false);
    expect(result.current.days).toEqual([1, 3, 5]);
  });

  it("rotina que não existe mais: avisa e não deixa salvar", async () => {
    const { useCases } = createUseCases();
    const update = jest.spyOn(useCases, "updateRoutine");
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases, "nada"));

    await waitFor(() => expect(result.current.formError).toBe("Esta rotina não está mais na sua lista."));
    await act(async () => result.current.submit());
    expect(update).not.toHaveBeenCalled();
  });

  it("a criação não pergunta ao sair, mesmo com algo digitado", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useNewRoutineViewModel(useCases));
    await act(async () => result.current.setName("Inglês"));
    expect(result.current.requestLeave()).toBe(true);
  });
});

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
