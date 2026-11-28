import { act, renderHook, waitFor } from "@testing-library/react-native";
import { createDefaultCategories } from "@/model/entities/category";
import type { Task } from "@/model/entities/task";
import type { ITaskUseCases } from "@/usecase/iTaskUseCases";
import { useTaskDetailsViewModel } from "@/viewmodel/useTaskDetailsViewModel";

// Navegação do Expo Router isolada: o foco roda uma vez ao montar.
const mockNavigate = jest.fn();
let mockParams: Record<string, string | undefined> = {};
jest.mock("expo-router", () => ({
  router: { navigate: (...args: unknown[]) => mockNavigate(...args) },
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual<typeof import("react")>("react");
    React.useEffect(() => {
      callback();
    }, [callback]);
  },
  useLocalSearchParams: () => mockParams,
}));

const baseTask: Task = {
  id: "t1",
  title: "Estudar para IHC",
  description: "Capítulo 3",
  startDate: "20/10/2026",
  startTime: "14:00",
  endDate: "20/10/2026",
  endTime: "15:00",
  category: "programming",
  completed: false,
  pinned: false,
  createdAt: "2026-10-19T10:00:00-03:00",
  updatedAt: "2026-10-19T10:00:00-03:00",
};

const createUseCases = (task: Task | null) => {
  let current = task;
  return {
    getTask: jest.fn(async () => {
      if (!current) throw new Error("não encontrada");
      return current;
    }),
    listCategories: jest.fn(async () => createDefaultCategories()),
    toggleTaskCompletion: jest.fn(async () => {
      current = { ...(current as Task), completed: !(current as Task).completed };
      return current;
    }),
  } as unknown as ITaskUseCases;
};

beforeEach(() => {
  mockParams = {};
  mockNavigate.mockClear();
});

describe("useTaskDetailsViewModel (protótipo 2.4)", () => {
  it("carrega a tarefa pelo id da rota, com início e término em texto", async () => {
    mockParams = { id: "t1" };
    const useCases = createUseCases(baseTask);
    const { result } = await renderHook(() => useTaskDetailsViewModel(undefined, useCases));

    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0].task).toMatchObject({
      id: "t1",
      title: "Estudar para IHC",
      startLabel: "20/10/2026 · 14:00",
      endLabel: "20/10/2026 · 15:00",
      category: "programming",
      completed: false,
    });
  });

  it("conclui e reabre a tarefa pelo botão do rodapé", async () => {
    const useCases = createUseCases(baseTask);
    const { result } = await renderHook(() => useTaskDetailsViewModel("t1", useCases));
    await waitFor(() => expect(result.current[0].task).not.toBeNull());

    await act(async () => result.current[1].toggleCompleted());
    await waitFor(() => expect(result.current[0].task?.completed).toBe(true));
    expect(useCases.toggleTaskCompletion).toHaveBeenCalledWith("t1");
  });

  it("sem a tarefa, mostra o aviso de não encontrada", async () => {
    const useCases = createUseCases(null);
    const { result } = await renderHook(() => useTaskDetailsViewModel("sumiu", useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0].task).toBeNull();
    expect(result.current[0].errorKey).toBe("error.load");
  });

  it("volta para Tarefas e abre a edição da tarefa", async () => {
    const useCases = createUseCases(baseTask);
    const { result } = await renderHook(() => useTaskDetailsViewModel("t1", useCases));
    await waitFor(() => expect(result.current[0].task).not.toBeNull());

    result.current[1].handleEdit();
    expect(mockNavigate).toHaveBeenCalledWith({ pathname: "/new-task", params: { id: "t1" } });
    result.current[1].handleBack();
    expect(mockNavigate).toHaveBeenCalledWith("/tasks");
  });
});
