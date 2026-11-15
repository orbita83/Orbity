import { act, renderHook } from "@testing-library/react-native";
import { PROTOTYPE_ROUTINE_DETAILS, PROTOTYPE_ROUTINES } from "@/view/__fixtures__/routines.fixture";
import { useNewRoutineViewModel } from "@/viewmodel/NewRoutineViewModel";
import { useRoutineDetailsViewModel } from "@/viewmodel/RoutineDetailsViewModel";
import { UNDO_WINDOW_MS, useRoutinesViewModel } from "@/viewmodel/RoutinesViewModel";

describe("useRoutinesViewModel", () => {
  it("começa vazia quando nada é passado", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel());
    expect(result.current.visibleRoutines).toEqual([]);
  });

  it("busca pelo nome sem diferenciar maiúsculas", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    await act(async () => result.current.setQuery("ING"));
    expect(result.current.visibleRoutines.map((r) => r.id)).toEqual(["ing"]);
  });

  it("RF-0011: concluir e desmarcar a rotina do dia", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    expect(result.current.doneTodayCount).toBe(1);
    await act(async () => result.current.toggleDoneToday("ing"));
    expect(result.current.doneTodayCount).toBe(2);
  });

  it("3.4: excluir mostra o aviso e desfazer devolve a rotina ao mesmo lugar", async () => {
    const { result } = await renderHook(() => useRoutinesViewModel(PROTOTYPE_ROUTINES));
    await act(async () => result.current.deleteRoutine("ing"));
    expect(result.current.totalCount).toBe(2);
    expect(result.current.lastDeleted?.title).toBe("Inglês");

    await act(async () => result.current.undoDelete());
    expect(result.current.visibleRoutines.map((r) => r.id)).toEqual(["mat", "ing", "leitura"]);
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

describe("useNewRoutineViewModel", () => {
  it("RF-0007 e RF-0012: exige nome e pelo menos um dia, sem perder o que foi digitado", async () => {
    const { result } = await renderHook(() => useNewRoutineViewModel());
    await act(async () => result.current.setDescription("Estudos diários"));
    await act(async () => result.current.submit());
    expect(result.current.nameError).toBe(true);
    expect(result.current.daysError).toBe(true);
    expect(result.current.description).toBe("Estudos diários");

    await act(async () => result.current.setName("Matemática"));
    await act(async () => result.current.toggleDay(3));
    await act(async () => result.current.toggleDay(1));
    expect(result.current.days).toEqual([1, 3]);
    await act(async () => result.current.submit());
    expect(result.current.created).toBe(true);
  });

  it("adiciona, reordena e remove tarefas; ignora tarefa em branco", async () => {
    const { result } = await renderHook(() => useNewRoutineViewModel());
    for (const title of ["Revisar", "Resolver", "   "]) {
      await act(async () => result.current.setDraft(title));
      await act(async () => result.current.addTask());
    }
    expect(result.current.tasks).toEqual(["Revisar", "Resolver"]);

    await act(async () => result.current.moveTaskUp(1));
    expect(result.current.tasks).toEqual(["Resolver", "Revisar"]);
    await act(async () => result.current.removeTask(0));
    expect(result.current.tasks).toEqual(["Revisar"]);
  });

  it("o ícone começa em Geral e pode ser trocado", async () => {
    const { result } = await renderHook(() => useNewRoutineViewModel());
    expect(result.current.icon).toBe("track_changes");
    await act(async () => result.current.setIcon("science"));
    expect(result.current.icon).toBe("science");
  });
});

describe("useRoutineDetailsViewModel", () => {
  it("F8: concluir tudo e desmarcar todos", async () => {
    const { result } = await renderHook(() => useRoutineDetailsViewModel(PROTOTYPE_ROUTINE_DETAILS));
    expect(result.current.completedCount).toBe(1);
    await act(async () => result.current.completeAll());
    expect(result.current.allDone).toBe(true);
    await act(async () => result.current.undoAll());
    expect(result.current.completedCount).toBe(0);
  });

  it("concluir item a item e reordenar", async () => {
    const { result } = await renderHook(() => useRoutineDetailsViewModel(PROTOTYPE_ROUTINE_DETAILS));
    await act(async () => result.current.toggleTask("b"));
    expect(result.current.completedCount).toBe(2);
    await act(async () => result.current.moveTaskUp(2));
    expect(result.current.routine?.tasks.map((t) => t.id)).toEqual(["a", "c", "b"]);
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
    expect(result.current.allDone).toBe(false);
  });
});
