import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { ConfirmDialog } from "@/view/components/ConfirmDialog";
import { ContextualActionBar, ContextualHeader } from "@/view/components/ContextualActionBar";
import { Snackbar } from "@/view/components/Snackbar";
import { ROUTINES_COPY, formatRoutinesCopy } from "@/view/routines-copy";
import { TASKS_COPY, formatTasksCopy } from "@/view/tasks-copy";
import { cosmicBorders, themes } from "@/view/theme/tokens";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const dialogProps = {
  visible: true,
  title: "Excluir a rotina Matemática?",
  message: "Ela sai da sua lista e não aparece mais nos próximos dias.",
  icon: "delete_outline" as const,
  cancelLabel: "Manter rotina",
  confirmLabel: "Excluir rotina",
};

describe("ConfirmDialog", () => {
  it("a ação secundária e o ✕ cancelam; só a ação primária confirma", async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    await render(<ConfirmDialog {...dialogProps} onCancel={onCancel} onConfirm={onConfirm} />);

    expect(screen.getByRole("header", { name: dialogProps.title })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Manter rotina" }));
    await fireEvent.press(screen.getByRole("button", { name: "Fechar" }));
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole("button", { name: "Excluir rotina" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      scenario: "exclusão individual de tarefa",
      title: TASKS_COPY["delete.title.one"],
      message: TASKS_COPY["delete.message"],
      cancelLabel: TASKS_COPY["delete.cancel"],
      confirmLabel: TASKS_COPY["delete.confirm"],
    },
    {
      scenario: "exclusão múltipla de tarefas",
      title: formatTasksCopy("delete.title.other", { n: 2 }),
      message: TASKS_COPY["delete.message"],
      cancelLabel: TASKS_COPY["delete.cancel"],
      confirmLabel: TASKS_COPY["delete.confirm"],
    },
    {
      scenario: "exclusão de rotina",
      title: formatRoutinesCopy("delete.title", { name: "Matemática" }),
      message: formatRoutinesCopy("delete.message.other", { n: 3 }),
      cancelLabel: ROUTINES_COPY["delete.cancel"],
      confirmLabel: ROUTINES_COPY["delete.confirm"],
    },
  ])("aplica estilo primário na confirmação e secundário no cancelamento ($scenario)", async ({
    title,
    message,
    cancelLabel,
    confirmLabel,
  }) => {
    await render(
      <ConfirmDialog
        visible
        icon="delete_outline"
        title={title}
        message={message}
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    const confirmButton = screen.getByRole("button", { name: confirmLabel });
    const cancelButton = screen.getByRole("button", { name: cancelLabel });
    const confirmStyle = StyleSheet.flatten(confirmButton.props.style);
    const cancelStyle = StyleSheet.flatten(cancelButton.props.style);

    expect(confirmStyle.backgroundColor).toBe(themes.cosmic.button.bg);
    expect(cancelStyle.backgroundColor).toBeUndefined();
    expect(cancelStyle.borderColor).toBe(cosmicBorders.sheet);
    expect(cancelStyle.borderWidth).toBe(themes.cosmic.border.widthThin);

    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.props.accessibilityLabel)).toEqual(["Fechar", confirmLabel, cancelLabel]);
  });

  it("fechado, não mostra nada", async () => {
    await render(<ConfirmDialog {...dialogProps} visible={false} onCancel={jest.fn()} onConfirm={jest.fn()} />);
    expect(screen.queryByText(dialogProps.title)).toBeNull();
  });
});

describe("Snackbar", () => {
  it("mostra a mensagem e dispara a ação", async () => {
    const onAction = jest.fn();
    await render(<Snackbar message="Rotina Matemática excluída." actionLabel="Desfazer" onAction={onAction} />);

    expect(screen.getByText("Rotina Matemática excluída.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Desfazer" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

describe("Barra de ações contextuais", () => {
  it("o ✕ cancela a seleção e o contador aparece", async () => {
    const onCancel = jest.fn();
    await render(<ContextualHeader countLabel="2 selecionadas" onCancel={onCancel} />);

    expect(screen.getByText("2 selecionadas")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Cancelar seleção" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("cada ação tem rótulo, e a desabilitada não dispara", async () => {
    const pin = jest.fn();
    const remove = jest.fn();
    await render(
      <ContextualActionBar
        actions={[
          { id: "pin", label: "Fixar", icon: "push_pin", onPress: pin },
          { id: "delete", label: "Excluir (0)", icon: "delete_outline", onPress: remove, destructive: true, disabled: true },
        ]}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Fixar" }));
    expect(pin).toHaveBeenCalledTimes(1);
    const del = screen.getByRole("button", { name: "Excluir (0)" });
    expect(del.props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(del);
    expect(remove).not.toHaveBeenCalled();
  });
});
