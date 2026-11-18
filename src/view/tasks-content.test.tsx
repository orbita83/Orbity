import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LocalDate } from "@/model/entities/local-date";
import { PROTOTYPE_TASKS } from "@/view/__fixtures__/task-list.fixture";
import { NewTaskScreenContent, type NewTaskScreenContentProps } from "@/view/new-task-content";
import { TASKS_COPY } from "@/view/tasks-copy";
import { TasksScreenContent, type TasksScreenContentProps } from "@/view/tasks-content";
import { cosmicBorders, themes } from "@/view/theme/tokens";
import {
  CATEGORY_PICKER_OPTIONS,
  TIME_PICKER_OPTIONS,
  buildDatePickerOptions,
} from "@/viewmodel/useNewTaskViewModel";

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } };

const listProps = (overrides: Partial<TasksScreenContentProps> = {}): TasksScreenContentProps => ({
  visibleTasks: [...PROTOTYPE_TASKS],
  pendingCount: 3,
  totalCount: 4,
  filter: "all",
  selectionMode: false,
  selectedIds: [],
  allSelectedPinned: false,
  confirmDeleteVisible: false,
  loading: false,
  errorKey: null,
  selectFilter: jest.fn(),
  toggleCompleted: jest.fn(),
  startSelection: jest.fn(),
  toggleSelected: jest.fn(),
  cancelSelection: jest.fn(),
  selectAll: jest.fn(),
  pinSelected: jest.fn(),
  requestDelete: jest.fn(),
  cancelDelete: jest.fn(),
  confirmDelete: jest.fn(),
  reload: jest.fn(async () => undefined),
  onCreateTask: jest.fn(),
  onEditTask: jest.fn(),
  ...overrides,
});

const renderInSafeArea = (node: React.ReactElement) => render(<SafeAreaProvider initialMetrics={metrics}>{node}</SafeAreaProvider>);

describe("TasksScreenContent", () => {
  it("2: mostra título, resumo, filtros em grupo de rádio, Nova tarefa e os cards", async () => {
    const props = listProps();
    await renderInSafeArea(<TasksScreenContent {...props} />);

    expect(screen.getByRole("header", { name: TASKS_COPY.title })).toBeTruthy();
    expect(screen.getByText("3 tarefas pendentes")).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByText("Estudar para a prova de Cálculo")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: TASKS_COPY.new }));
    expect(props.onCreateTask).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole("checkbox", { name: "Concluir tarefa: Estudar para PDM" }));
    expect(props.toggleCompleted).toHaveBeenCalledWith("b");
  });

  it("sem tarefas, mostra o estado vazio acolhedor", async () => {
    await renderInSafeArea(<TasksScreenContent {...listProps({ visibleTasks: [], pendingCount: 0, totalCount: 0 })} />);
    expect(screen.getByText(TASKS_COPY["empty.title"])).toBeTruthy();
    expect(screen.getByText(TASKS_COPY["summary.empty"])).toBeTruthy();
  });

  it("com erro, exibe alerta e aciona reload ao tentar novamente", async () => {
    const props = listProps({ errorKey: "error.load", visibleTasks: [], pendingCount: 0, totalCount: 0 });
    await renderInSafeArea(<TasksScreenContent {...props} />);

    expect(screen.getByRole("alert")).toHaveTextContent(TASKS_COPY["error.load"]);
    await fireEvent.press(screen.getByRole("button", { name: TASKS_COPY["error.retry"] }));
    expect(props.reload).toHaveBeenCalledTimes(1);
  });

  it("2.3: na seleção, troca o cabeçalho, mostra a barra de ações e alterna rótulo de fixar/desafixar", async () => {
    const props = listProps({ selectionMode: true, selectedIds: ["a"] });
    await renderInSafeArea(<TasksScreenContent {...props} />);

    expect(screen.getByText("1 selecionada")).toBeTruthy();
    expect(screen.queryByRole("button", { name: TASKS_COPY.new })).toBeNull();
    expect(screen.getByRole("checkbox", { name: "Selecionar tarefa: Estudar para a prova de Cálculo" }).props.accessibilityState.checked).toBe(true);
    expect(screen.getByRole("button", { name: TASKS_COPY["action.pin"] })).toBeTruthy();

    const editButton = screen.getByRole("button", { name: TASKS_COPY["action.edit"] });
    expect(editButton.props.accessibilityState.disabled).toBe(false);
    await fireEvent.press(editButton);
    expect(props.cancelSelection).toHaveBeenCalledTimes(1);
    expect(props.onEditTask).toHaveBeenCalledWith("a");

    await fireEvent.press(screen.getByRole("checkbox", { name: "Selecionar tarefa: Estudar para PDM" }));
    expect(props.toggleSelected).toHaveBeenCalledWith("b");

    await fireEvent.press(screen.getByRole("button", { name: "Excluir (1)" }));
    expect(props.requestDelete).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByRole("button", { name: "Cancelar seleção" }));
    expect(props.cancelSelection).toHaveBeenCalledTimes(2);

    await renderInSafeArea(<TasksScreenContent {...listProps({ selectionMode: true, selectedIds: ["a"], allSelectedPinned: true })} />);
    expect(screen.getByRole("button", { name: TASKS_COPY["action.unpin"] })).toBeTruthy();

    await renderInSafeArea(<TasksScreenContent {...listProps({ selectionMode: true, selectedIds: ["a", "b"] })} />);
    expect(screen.getByRole("button", { name: TASKS_COPY["action.edit"] }).props.accessibilityState.disabled).toBe(true);
  });

  it("a confirmação de exclusão individual e múltipla destaca Excluir como primário e Cancelar como secundário", async () => {
    const singleProps = listProps({ selectionMode: true, selectedIds: ["a"], confirmDeleteVisible: true });
    const view = await renderInSafeArea(<TasksScreenContent {...singleProps} />);

    expect(screen.getByRole("header", { name: TASKS_COPY["delete.title.one"] })).toBeTruthy();
    const singleConfirm = screen.getByRole("button", { name: TASKS_COPY["delete.confirm"] });
    const singleCancel = screen.getByRole("button", { name: TASKS_COPY["delete.cancel"] });
    expect(StyleSheet.flatten(singleConfirm.props.style).backgroundColor).toBe(themes.cosmic.button.bg);
    expect(StyleSheet.flatten(singleCancel.props.style).backgroundColor).toBeUndefined();
    expect(StyleSheet.flatten(singleCancel.props.style).borderColor).toBe(cosmicBorders.sheet);

    const props = listProps({ selectionMode: true, selectedIds: ["a", "b"], confirmDeleteVisible: true });
    await view.rerender(
      <SafeAreaProvider initialMetrics={metrics}>
        <TasksScreenContent {...props} />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole("header", { name: "Excluir 2 tarefas?" })).toBeTruthy();
    const batchConfirm = screen.getByRole("button", { name: TASKS_COPY["delete.confirm"] });
    const batchCancel = screen.getByRole("button", { name: TASKS_COPY["delete.cancel"] });
    expect(StyleSheet.flatten(batchConfirm.props.style).backgroundColor).toBe(themes.cosmic.button.bg);
    expect(StyleSheet.flatten(batchCancel.props.style).backgroundColor).toBeUndefined();
    expect(StyleSheet.flatten(batchCancel.props.style).borderColor).toBe(cosmicBorders.sheet);

    await fireEvent.press(batchCancel);
    expect(props.cancelDelete).toHaveBeenCalledTimes(1);
    await fireEvent.press(batchConfirm);
    expect(props.confirmDelete).toHaveBeenCalledTimes(1);
  });
});

const sampleDateOptions = buildDatePickerOptions(LocalDate.parse("2026-11-15"));

const formProps = (overrides: Partial<NewTaskScreenContentProps> = {}): NewTaskScreenContentProps => ({
  fields: {
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    category: undefined,
  },
  titleError: false,
  formError: null,
  activePicker: null,
  dateOptions: sampleDateOptions,
  timeOptions: TIME_PICKER_OPTIONS,
  categoryOptions: CATEGORY_PICKER_OPTIONS,
  selectedCategory: null,
  submitting: false,
  created: false,
  setField: jest.fn(),
  selectCategory: jest.fn(),
  openPicker: jest.fn(),
  closePicker: jest.fn(),
  submit: jest.fn(),
  reset: jest.fn(),
  onClose: jest.fn(),
  onFinish: jest.fn(),
  ...overrides,
});

describe("NewTaskScreenContent", () => {
  it("2.1: campos com rótulo, fechar sem criar, abrir seletores e criar pelo rodapé", async () => {
    const props = formProps();
    await renderInSafeArea(<NewTaskScreenContent {...props} />);

    expect(screen.getByRole("header", { name: TASKS_COPY["form.title"] })).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText("Título da tarefa, (obrigatório)"), "Revisar SOLID");
    expect(props.setField).toHaveBeenCalledWith("title", "Revisar SOLID");

    const dateInputs = screen.getAllByLabelText(TASKS_COPY["form.date"]);
    const timeInputs = screen.getAllByLabelText(TASKS_COPY["form.time"]);
    expect(dateInputs[0].props.maxLength).toBe(10);
    expect(dateInputs[0].props.keyboardType).toBe("numeric");
    expect(timeInputs[0].props.maxLength).toBe(5);
    expect(timeInputs[0].props.keyboardType).toBe("numeric");

    await fireEvent.changeText(dateInputs[0], "16112026");
    expect(props.setField).toHaveBeenCalledWith("startDate", "16112026");

    await fireEvent.changeText(timeInputs[0], "0830");
    expect(props.setField).toHaveBeenCalledWith("startTime", "0830");

    await fireEvent.press(screen.getByRole("button", { name: "Escolher data de Início na lista" }));
    expect(props.openPicker).toHaveBeenCalledWith("startDate");

    await fireEvent.press(screen.getByRole("button", { name: "Escolher horário de Início na lista" }));
    expect(props.openPicker).toHaveBeenCalledWith("startTime");

    await fireEvent.press(screen.getByRole("button", { name: "Categoria: Sem categoria" }));
    expect(props.openPicker).toHaveBeenCalledWith("category");

    await fireEvent.press(screen.getByRole("button", { name: TASKS_COPY["form.submit"] }));
    expect(props.submit).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByRole("button", { name: TASKS_COPY["form.close"] }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("abre o seletor ativo e repassa a escolha", async () => {
    const props = formProps({ activePicker: "category" });
    await renderInSafeArea(<NewTaskScreenContent {...props} />);

    expect(screen.getByRole("header", { name: TASKS_COPY["picker.category.title"] })).toBeTruthy();
    await fireEvent.press(screen.getByRole("radio", { name: "Programação" }));
    expect(props.selectCategory).toHaveBeenCalledWith("programacao");
  });

  it("com erro, mostra a mensagem do título ou erro do formulário", async () => {
    await renderInSafeArea(<NewTaskScreenContent {...formProps({ titleError: true })} />);
    expect(screen.getByRole("alert")).toHaveTextContent(TASKS_COPY["form.name.error"]);

    await renderInSafeArea(<NewTaskScreenContent {...formProps({ formError: "Data inválida." })} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Data inválida.");
  });

  it("2.2: depois de criar, mostra a confirmação e volta para a lista", async () => {
    const props = formProps({ created: true });
    await renderInSafeArea(<NewTaskScreenContent {...props} />);

    expect(screen.getByRole("header", { name: TASKS_COPY["created.title"] })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: TASKS_COPY["created.action"] }));
    expect(props.onFinish).toHaveBeenCalledTimes(1);
  });

  it("no modo de edição, exibe cabeçalho, botão e diálogo de atualização", async () => {
    const props = formProps({ editing: true });
    await renderInSafeArea(<NewTaskScreenContent {...props} />);

    expect(screen.getByRole("header", { name: TASKS_COPY["form.editTitle"] })).toBeTruthy();
    expect(screen.getByRole("button", { name: TASKS_COPY["form.editClose"] })).toBeTruthy();
    expect(screen.getByRole("button", { name: TASKS_COPY["form.editSubmit"] })).toBeTruthy();

    await renderInSafeArea(<NewTaskScreenContent {...formProps({ editing: true, created: true })} />);
    expect(screen.getByRole("header", { name: TASKS_COPY["updated.title"] })).toBeTruthy();
    expect(screen.getByText(TASKS_COPY["updated.message"])).toBeTruthy();
    expect(screen.getByRole("button", { name: TASKS_COPY["updated.action"] })).toBeTruthy();
  });
});
