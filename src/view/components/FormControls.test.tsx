import { fireEvent, render, screen } from "@testing-library/react-native";
import { CheckCircle } from "@/view/components/CheckCircle";
import { ScreenHeader } from "@/view/components/ScreenHeader";
import { TextField } from "@/view/components/TextField";

describe("CheckCircle", () => {
  it("anuncia o estado e alterna ao tocar", async () => {
    const onToggle = jest.fn();
    await render(<CheckCircle checked={false} onToggle={onToggle} accessibilityLabel="Concluir tarefa Revisar SOLID" />);

    const box = screen.getByRole("checkbox", { name: "Concluir tarefa Revisar SOLID" });
    expect(box.props.accessibilityState.checked).toBe(false);
    await fireEvent.press(box);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("marcado, expõe checked verdadeiro", async () => {
    await render(<CheckCircle checked onToggle={jest.fn()} accessibilityLabel="Desmarcar tarefa" />);
    expect(screen.getByRole("checkbox").props.accessibilityState.checked).toBe(true);
  });
});

describe("ScreenHeader", () => {
  it("mostra o título como cabeçalho e volta pelo botão nomeado", async () => {
    const onBack = jest.fn();
    await render(<ScreenHeader title="Nova rotina" backLabel="Voltar sem criar" onBack={onBack} />);

    expect(screen.getByRole("header", { name: "Nova rotina" })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Voltar sem criar" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe("TextField", () => {
  it("tem rótulo visível, indica obrigatório e repassa o texto digitado", async () => {
    const onChangeText = jest.fn();
    await render(<TextField label="Nome da rotina" requirement="required" value="" onChangeText={onChangeText} />);

    expect(screen.getByText(/Nome da rotina/)).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText("Nome da rotina, (obrigatório)"), "Matemática");
    expect(onChangeText).toHaveBeenCalledWith("Matemática");
  });

  it("com erro, mostra a mensagem como alerta e mantém o valor", async () => {
    await render(<TextField label="Nome da rotina" value="Mat" error="Dê um nome para a rotina." onChangeText={jest.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Dê um nome para a rotina.");
    expect(screen.getByLabelText("Nome da rotina").props.value).toBe("Mat");
  });

  it("sem erro, mostra o texto de ajuda", async () => {
    await render(<TextField label="Descrição" value="" helper="Ajuda a lembrar o objetivo." onChangeText={jest.fn()} />);
    expect(screen.getByText("Ajuda a lembrar o objetivo.")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
