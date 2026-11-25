import { act, renderHook, waitFor } from "@testing-library/react-native";
import { BackHandler, Platform } from "react-native";
import { MemoryCategoryDataSource } from "@/infra/datasources/memoryCategoryDataSource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { LocalDate } from "@/model/entities/localDate";
import { DataSourceError } from "@/model/errors";
import type { IClockService } from "@/model/services/iClockService";
import { CategoryUseCases } from "@/usecase/categoryUseCases";
import type { ICategoryUseCases } from "@/usecase/iCategoryUseCases";
import { useCategoriesViewModel } from "@/viewmodel/useCategoriesViewModel";

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = jest.requireActual<typeof import("react")>("react");
    React.useEffect(() => callback(), [callback]);
  },
}));

const clock: IClockService = {
  now: () => "2026-11-24T10:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-24"),
};

const createUseCases = () => {
  const tasks = new MemoryTaskDataSource();
  const routines = new MemoryRoutineDataSource(tasks);
  const categories = new MemoryCategoryDataSource(tasks, routines);
  let seq = 0;
  const useCases = new CategoryUseCases(categories, clock, () => `cat-${++seq}`);
  return { useCases, categories };
};

describe("useCategoriesViewModel", () => {
  it("volta para Meu perfil pela ação da tela", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useCategoriesViewModel(useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    result.current[1].handleReturnToProfile();
    expect(mockReplace).toHaveBeenCalledWith("/profile");
  });

  it("trata o voltar do Android enquanto a tela está aberta e remove o listener ao sair", async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
    const remove = jest.fn();
    const listener = jest.spyOn(BackHandler, "addEventListener").mockReturnValue({ remove });
    try {
      const { useCases } = createUseCases();
      const view = await renderHook(() => useCategoriesViewModel(useCases));
      await waitFor(() => expect(view.result.current[0].loading).toBe(false));
      expect(listener).toHaveBeenCalledWith("hardwareBackPress", expect.any(Function));
      const handler = listener.mock.calls[0][1];
      expect(handler({} as never)).toBe(true);
      expect(mockReplace).toHaveBeenCalledWith("/profile");
      await view.unmount();
      expect(remove).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(Platform, "OS", { configurable: true, value: original });
      listener.mockRestore();
    }
  });

  it("não registra o voltar do sistema fora do Android", async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
    const listener = jest.spyOn(BackHandler, "addEventListener");
    try {
      const { useCases } = createUseCases();
      const { result } = await renderHook(() => useCategoriesViewModel(useCases));
      await waitFor(() => expect(result.current[0].loading).toBe(false));
      expect(listener).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(Platform, "OS", { configurable: true, value: original });
      listener.mockRestore();
    }
  });

  it("lista as seis categorias padrão, cria uma nova, renomeia, troca o ícone e exclui após confirmação", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useCategoriesViewModel(useCases));

    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0].categories).toHaveLength(6);

    // 1. Criar categoria "Física" com ícone "rocket"
    await act(async () => result.current[1].openCreate());
    expect(result.current[0].formVisible).toBe(true);
    await act(async () => result.current[1].setNameInput("  Física  "));
    await act(async () => result.current[1].selectIcon("rocket"));
    await act(async () => {
      await result.current[1].submitForm();
    });

    expect(result.current[0].formVisible).toBe(false);
    expect(result.current[0].categories).toHaveLength(7);
    const created = result.current[0].categories.find((cat) => cat.id === "cat-1");
    expect(created).toMatchObject({ id: "cat-1", name: "Física", icon: "rocket", isDefault: false });

    // 2. Renomear e trocar ícone de uma categoria padrão ("music" -> "Violão", ícone "star")
    const music = result.current[0].categories.find((cat) => cat.id === "music")!;
    await act(async () => result.current[1].openEdit(music, "Música"));
    expect(result.current[0].editingId).toBe("music");
    expect(result.current[0].nameInput).toBe("Música");

    await act(async () => result.current[1].setNameInput("Violão"));
    await act(async () => result.current[1].selectIcon("star"));
    await act(async () => {
      await result.current[1].submitForm();
    });

    expect(result.current[0].formVisible).toBe(false);
    expect(result.current[0].categories.find((cat) => cat.id === "music")).toMatchObject({
      id: "music",
      name: "Violão",
      icon: "star",
    });

    // 3. Excluir categoria só após confirmar no diálogo
    const languages = result.current[0].categories.find((cat) => cat.id === "languages")!;
    await act(async () => result.current[1].requestDelete(languages));
    expect(result.current[0].deletingCategory?.id).toBe("languages");

    await act(async () => result.current[1].cancelDelete());
    expect(result.current[0].deletingCategory).toBeNull();
    expect(result.current[0].categories.some((cat) => cat.id === "languages")).toBe(true);

    await act(async () => result.current[1].requestDelete(languages));
    await act(async () => {
      await result.current[1].confirmDelete();
    });
    expect(result.current[0].deletingCategory).toBeNull();
    expect(result.current[0].categories.some((cat) => cat.id === "languages")).toBe(false);
  });

  it("exibe ValidationError no formulário sem perder o que foi digitado e trata falhas de DataSource", async () => {
    const { useCases } = createUseCases();
    const { result } = await renderHook(() => useCategoriesViewModel(useCases));
    await waitFor(() => expect(result.current[0].loading).toBe(false));

    await act(async () => result.current[1].openCreate());
    await act(async () => result.current[1].setNameInput("   "));
    await act(async () => {
      await result.current[1].submitForm();
    });

    expect(result.current[0].formVisible).toBe(true);
    expect(result.current[0].nameError).toBe("Informe o nome da categoria.");

    await act(async () => result.current[1].setNameInput("Física"));
    expect(result.current[0].nameError).toBeNull();

    const failingUseCases: ICategoryUseCases = {
      listCategories: jest.fn().mockRejectedValueOnce(new DataSourceError()).mockResolvedValue([]),
      createCategory: jest.fn().mockRejectedValueOnce(new DataSourceError()),
      renameCategory: jest.fn(),
      changeCategoryIcon: jest.fn(),
      deleteCategory: jest.fn().mockRejectedValueOnce(new DataSourceError()),
    };

    const { result: failingResult } = await renderHook(() => useCategoriesViewModel(failingUseCases));
    await waitFor(() => expect(failingResult.current[0].errorKey).toBe("error.load"));

    await act(async () => {
      await failingResult.current[1].reload();
    });
    expect(failingResult.current[0].errorKey).toBeNull();

    await act(async () => failingResult.current[1].openCreate());
    await act(async () => failingResult.current[1].setNameInput("Química"));
    await act(async () => {
      await failingResult.current[1].submitForm();
    });
    expect(failingResult.current[0].errorKey).toBe("error.save");
  });
});
