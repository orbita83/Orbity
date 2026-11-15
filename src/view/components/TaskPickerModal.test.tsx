import { fireEvent, render, screen } from "@testing-library/react-native";
import { TaskPickerModal } from "./TaskPickerModal";
import { TextField } from "./TextField";

describe("TaskPickerModal e TextField com seletor", () => {
  it("renderiza opções em radiogroup acessível, marca a opção atual e seleciona pelo toque", async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    await render(
      <TaskPickerModal
        visible
        title="Escolher categoria"
        closeLabel="Fechar seletor"
        selectedValue="programacao"
        options={[
          { id: "none", label: "Sem categoria", value: "", icon: "label" },
          { id: "programacao", label: "Programação", value: "programacao", icon: "code" },
        ]}
        onSelect={onSelect}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("header", { name: "Escolher categoria" })).toBeTruthy();
    expect(screen.getByLabelText("Escolher categoria")).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("radio", { name: "Programação" }).props.accessibilityState.checked).toBe(true);

    await fireEvent.press(screen.getByRole("radio", { name: "Sem categoria" }));
    expect(onSelect).toHaveBeenCalledWith("");

    await fireEvent.press(screen.getByRole("button", { name: "Fechar seletor" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("TextField com botão trailing mantém a digitação e aciona o seletor", async () => {
    const onChangeText = jest.fn();
    const onTrailingPress = jest.fn();

    await render(
      <TextField
        label="Data"
        value="15/11/2026"
        onChangeText={onChangeText}
        trailingIcon="calendar_today"
        trailingLabel="Escolher data na lista"
        onTrailingPress={onTrailingPress}
      />,
    );

    await fireEvent.changeText(screen.getByLabelText("Data"), "16/11/2026");
    expect(onChangeText).toHaveBeenCalledWith("16/11/2026");

    await fireEvent.press(screen.getByRole("button", { name: "Escolher data na lista" }));
    expect(onTrailingPress).toHaveBeenCalledTimes(1);
  });
});
