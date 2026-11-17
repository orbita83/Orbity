import { act, renderHook, waitFor } from "@testing-library/react-native";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryRoutineRepository } from "@/infra/repositories/in-memory-routine-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { LocalDate } from "@/model/entities/local-date";
import { DomainError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/i-clock-service";
import type { IRoutineUseCases } from "@/usecase/i-routine-use-cases";
import { RoutineUseCases } from "@/usecase/routine-use-cases";
import { useNewRoutineViewModel } from "@/viewmodel/useNewRoutineViewModel";

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
