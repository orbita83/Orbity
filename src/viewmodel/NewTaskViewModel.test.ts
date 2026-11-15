import { act, renderHook, waitFor } from "@testing-library/react-native";
import { InMemoryDailyActivityRepository } from "@/infra/repositories/in-memory-daily-activity-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { LocalDate } from "@/model/entities/local-date";
import { DomainError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/i-clock-service";
import type { ITaskUseCases } from "@/usecase/i-task-use-cases";
import { TaskUseCases } from "@/usecase/task-use-cases";
import { useNewTaskViewModel } from "@/viewmodel/NewTaskViewModel";

const fixedClock: IClockService = {
  now: () => "2026-11-15T10:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-15"),
};

const createVmDependencies = () => {
  const taskRepo = new InMemoryTaskRepository();
  const useCases = new TaskUseCases(taskRepo, new InMemoryDailyActivityRepository(), fixedClock, () => "task-created");
  return { taskRepo, useCases };
};

describe("useNewTaskViewModel", () => {
  it("sem título, criar mostra o erro e mantém o que foi digitado", async () => {
    const { useCases } = createVmDependencies();
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock));

    await act(async () => result.current.setField("description", "Capítulo 3"));
    expect(result.current.titleError).toBe(false);

    await act(async () => result.current.submit());
    expect(result.current.titleError).toBe(true);
    expect(result.current.created).toBe(false);
    expect(result.current.fields.description).toBe("Capítulo 3");
  });

  it("com título e dados válidos, cria e persiste a tarefa, e reset limpa o formulário", async () => {
    const { taskRepo, useCases } = createVmDependencies();
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock));

    await act(async () => result.current.setField("title", "Revisar SOLID"));
    await act(async () => result.current.setField("startDate", "15/11/2026"));
    await act(async () => result.current.setField("startTime", "08:00"));
    await act(async () => result.current.openPicker("category"));
    expect(result.current.activePicker).toBe("category");

    await act(async () => result.current.selectCategory("programacao"));
    expect(result.current.activePicker).toBeNull();
    expect(result.current.fields.category).toBe("programacao");

    await act(async () => result.current.submit());
    await waitFor(() => expect(result.current.created).toBe(true));

    const stored = await taskRepo.listAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      title: "Revisar SOLID",
      startDate: "15/11/2026",
      startTime: "08:00",
      category: "programacao",
    });

    await act(async () => result.current.reset());
    expect(result.current.created).toBe(false);
    expect(result.current.fields.title).toBe("");
    expect(result.current.fields.category).toBeUndefined();
  });

  it("data inválida ou falha ao persistir exibe formError e preserva o que foi preenchido", async () => {
    const { useCases } = createVmDependencies();
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock));

    await act(async () => result.current.setField("title", "Revisar grafos"));
    await act(async () => result.current.setField("startDate", "31/02/2026"));
    await act(async () => result.current.submit());

    await waitFor(() => expect(result.current.formError).toBeTruthy());
    expect(result.current.created).toBe(false);
    expect(result.current.fields.title).toBe("Revisar grafos");

    const failingUseCases: ITaskUseCases = {
      listTasks: jest.fn(),
      createTask: jest.fn().mockRejectedValueOnce(new DomainError("PERSISTENCE_FAILURE")),
      updateTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
      togglePinTasks: jest.fn(),
      deleteTasks: jest.fn(),
    };
    const { result: failingResult } = await renderHook(() => useNewTaskViewModel(failingUseCases, fixedClock));
    await act(async () => failingResult.current.setField("title", "Estudar"));
    await act(async () => failingResult.current.submit());

    await waitFor(() => expect(failingResult.current.formError).toBe("Não foi possível salvar a tarefa agora."));
    expect(failingResult.current.created).toBe(false);
  });

  it("gera opções de data começando em Hoje e Amanhã conforme a data local", async () => {
    const { useCases } = createVmDependencies();
    const { result } = await renderHook(() => useNewTaskViewModel(useCases, fixedClock));

    expect(result.current.dateOptions.slice(0, 3)).toEqual([
      { id: "clear", label: "Sem data", value: "" },
      { id: "today", label: "Hoje", hint: "15/11/2026", value: "15/11/2026" },
      { id: "tomorrow", label: "Amanhã", hint: "16/11/2026", value: "16/11/2026" },
    ]);
    expect(result.current.categoryOptions.some((option) => option.value === "programacao")).toBe(true);
    expect(result.current.timeOptions[1]).toEqual({ id: "00:00", label: "00:00", value: "00:00" });
  });
});
