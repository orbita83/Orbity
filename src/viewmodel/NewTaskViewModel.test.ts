import { act, renderHook } from "@testing-library/react-native";
import { useNewTaskViewModel } from "@/viewmodel/NewTaskViewModel";

describe("useNewTaskViewModel", () => {
  it("sem título, criar mostra o erro e mantém o que foi digitado", async () => {
    const { result } = await renderHook(() => useNewTaskViewModel());
    await act(async () => result.current.setField("description", "Capítulo 3"));
    expect(result.current.titleError).toBe(false);

    await act(async () => result.current.submit());
    expect(result.current.titleError).toBe(true);
    expect(result.current.created).toBe(false);
    expect(result.current.fields.description).toBe("Capítulo 3");
  });

  it("com título, criar mostra a confirmação, e reset limpa o formulário", async () => {
    const { result } = await renderHook(() => useNewTaskViewModel());
    await act(async () => result.current.setField("title", "Revisar SOLID"));
    await act(async () => result.current.submit());
    expect(result.current.created).toBe(true);

    await act(async () => result.current.reset());
    expect(result.current.created).toBe(false);
    expect(result.current.fields.title).toBe("");
  });
});
