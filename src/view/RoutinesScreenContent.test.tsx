import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PROTOTYPE_ROUTINE_DETAILS, PROTOTYPE_ROUTINES } from "@/view/__fixtures__/routines.fixture";
import { NewRoutineScreenContent, type NewRoutineScreenContentProps } from "@/view/NewRoutineScreenContent";
import { RoutineDetailsScreenContent, type RoutineDetailsScreenContentProps } from "@/view/RoutineDetailsScreenContent";
import { ROUTINES_COPY } from "@/view/routines-copy";
import { RoutinesScreenContent, type RoutinesScreenContentProps } from "@/view/RoutinesScreenContent";

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } };
const inSafeArea = (node: React.ReactElement) => render(<SafeAreaProvider initialMetrics={metrics}>{node}</SafeAreaProvider>);

const listProps = (overrides: Partial<RoutinesScreenContentProps> = {}): RoutinesScreenContentProps => ({
  visibleRoutines: [...PROTOTYPE_ROUTINES],
  totalCount: 3,
  doneTodayCount: 1,
  query: "",
  lastDeleted: null,
  setQuery: jest.fn(),
  toggleDoneToday: jest.fn(),
  deleteRoutine: jest.fn(),
  undoDelete: jest.fn(),
  dismissDeleted: jest.fn(),
  onCreateRoutine: jest.fn(),
  onOpenRoutine: jest.fn(),
  ...overrides,
});

describe("RoutinesScreenContent", () => {
  it("3: título, busca, Nova rotina e cards que abrem e concluem em toques separados", async () => {
    const props = listProps();
    await inSafeArea(<RoutinesScreenContent {...props} />);

    expect(screen.getByRole("header", { name: ROUTINES_COPY.title })).toBeTruthy();
    expect(screen.getByText("1 de 3 concluídas")).toBeTruthy();
    expect(screen.getByText("2 tarefas · Seg, Qua e Sex")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText(ROUTINES_COPY.search), "ing");
    expect(props.setQuery).toHaveBeenCalledWith("ing");

    await fireEvent.press(screen.getByRole("link", { name: "Abrir rotina Inglês, 2 tarefas · Seg, Qua e Sex" }));
    expect(props.onOpenRoutine).toHaveBeenCalledWith("ing");
    await fireEvent.press(screen.getByRole("checkbox", { name: "Concluir rotina Inglês hoje" }));
    expect(props.toggleDoneToday).toHaveBeenCalledWith("ing");

    await fireEvent.press(screen.getByRole("button", { name: ROUTINES_COPY.new }));
    expect(props.onCreateRoutine).toHaveBeenCalledTimes(1);
  });

  it("busca sem resultado e lista vazia têm mensagens próprias", async () => {
    const view = await inSafeArea(<RoutinesScreenContent {...listProps({ visibleRoutines: [], query: "xyz" })} />);
    expect(screen.getByText(ROUTINES_COPY["noResults.title"])).toBeTruthy();

    await view.rerender(
      <SafeAreaProvider initialMetrics={metrics}>
        <RoutinesScreenContent {...listProps({ visibleRoutines: [], totalCount: 0, doneTodayCount: 0 })} />
      </SafeAreaProvider>,
    );
    expect(screen.getByText(ROUTINES_COPY["empty.title"])).toBeTruthy();
  });

  it("3.4: depois de excluir, o aviso oferece Desfazer", async () => {
    const props = listProps({ lastDeleted: PROTOTYPE_ROUTINES[0] });
    await inSafeArea(<RoutinesScreenContent {...props} />);

    expect(screen.getByText("Rotina Matemática excluída.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: ROUTINES_COPY["deleted.undo"] }));
    expect(props.undoDelete).toHaveBeenCalledTimes(1);
  });
});

const formProps = (overrides: Partial<NewRoutineScreenContentProps> = {}): NewRoutineScreenContentProps => ({
  name: "",
  icon: "track_changes",
  description: "",
  days: [],
  tasks: ["Revisar conteúdo de cálculo", "Finalizar anotações da aula"],
  draft: "",
  nameError: false,
  daysError: false,
  created: false,
  setName: jest.fn(),
  setIcon: jest.fn(),
  setDescription: jest.fn(),
  toggleDay: jest.fn(),
  setDraft: jest.fn(),
  addTask: jest.fn(),
  removeTask: jest.fn(),
  moveTaskUp: jest.fn(),
  submit: jest.fn(),
  reset: jest.fn(),
  onBack: jest.fn(),
  ...overrides,
});

describe("NewRoutineScreenContent", () => {
  it("3.1: ícone em grupo de rádio, dias como caixas de seleção e tarefas reordenáveis", async () => {
    const props = formProps();
    await inSafeArea(<NewRoutineScreenContent {...props} />);

    expect(screen.getAllByRole("radio")).toHaveLength(7);
    await fireEvent.press(screen.getByRole("radio", { name: "Ciências" }));
    expect(props.setIcon).toHaveBeenCalledWith("science");

    expect(screen.getAllByRole("checkbox")).toHaveLength(7);
    await fireEvent.press(screen.getByRole("checkbox", { name: "segunda-feira" }));
    expect(props.toggleDay).toHaveBeenCalledWith(1);

    await fireEvent.press(screen.getByRole("button", { name: "Mover Finalizar anotações da aula para cima" }));
    expect(props.moveTaskUp).toHaveBeenCalledWith(1);
    await fireEvent.press(screen.getByRole("button", { name: "Remover Revisar conteúdo de cálculo" }));
    expect(props.removeTask).toHaveBeenCalledWith(0);

    await fireEvent.press(screen.getByRole("button", { name: ROUTINES_COPY["form.submit"] }));
    expect(props.submit).toHaveBeenCalledTimes(1);
  });

  it("com erros, mostra as duas mensagens", async () => {
    await inSafeArea(<NewRoutineScreenContent {...formProps({ nameError: true, daysError: true })} />);
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[1]).toHaveTextContent(ROUTINES_COPY["form.days.error"]);
  });
});

const detailsProps = (overrides: Partial<RoutineDetailsScreenContentProps> = {}): RoutineDetailsScreenContentProps => ({
  routine: PROTOTYPE_ROUTINE_DETAILS,
  completedCount: 1,
  allDone: false,
  confirmDeleteVisible: false,
  toggleTask: jest.fn(),
  moveTaskUp: jest.fn(),
  completeAll: jest.fn(),
  undoAll: jest.fn(),
  requestDelete: jest.fn(),
  cancelDelete: jest.fn(),
  onBack: jest.fn(),
  onDeleted: jest.fn(),
  ...overrides,
});

describe("RoutineDetailsScreenContent", () => {
  it("3.2: resumo, progresso, tarefas e Marcar como concluída", async () => {
    const props = detailsProps();
    await inSafeArea(<RoutineDetailsScreenContent {...props} />);

    expect(screen.getByRole("header", { name: "Matemática" })).toBeTruthy();
    expect(screen.getByText("1 de 3 concluídas")).toBeTruthy();
    expect(screen.getByRole("progressbar").props.accessibilityValue).toMatchObject({ now: 1, max: 3 });

    await fireEvent.press(screen.getByRole("checkbox", { name: "Concluir Resolver a lista de exercícios" }));
    expect(props.toggleTask).toHaveBeenCalledWith("b");
    await fireEvent.press(screen.getByRole("button", { name: ROUTINES_COPY["details.completeAll"] }));
    expect(props.completeAll).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByRole("button", { name: ROUTINES_COPY["details.delete"] }));
    expect(props.requestDelete).toHaveBeenCalledTimes(1);
  });

  it("tudo concluído: comemora e troca o rodapé por Desmarcar todos", async () => {
    const props = detailsProps({ completedCount: 3, allDone: true });
    await inSafeArea(<RoutineDetailsScreenContent {...props} />);

    expect(screen.getByText(ROUTINES_COPY["details.allDone"])).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: ROUTINES_COPY["details.undoAll"] }));
    expect(props.undoAll).toHaveBeenCalledTimes(1);
  });

  it("3.3: confirmar a exclusão volta para a lista com a rotina excluída", async () => {
    const props = detailsProps({ confirmDeleteVisible: true });
    await inSafeArea(<RoutineDetailsScreenContent {...props} />);

    expect(screen.getByRole("header", { name: "Excluir a rotina Matemática?" })).toBeTruthy();
    expect(screen.getByText(ROUTINES_COPY["delete.note"])).toBeTruthy();
    // O botão da página e o do diálogo têm o mesmo nome; o do diálogo vem por último.
    const confirms = screen.getAllByRole("button", { name: ROUTINES_COPY["delete.confirm"] });
    await fireEvent.press(confirms[confirms.length - 1]);
    expect(props.onDeleted).toHaveBeenCalledWith("mat");
  });

  it("sem rotina, mostra o estado indisponível com voltar", async () => {
    const props = detailsProps({ routine: null });
    await inSafeArea(<RoutineDetailsScreenContent {...props} />);
    expect(screen.getByText(ROUTINES_COPY["details.missing.title"])).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: ROUTINES_COPY["details.back"] }));
    expect(props.onBack).toHaveBeenCalledTimes(1);
  });
});
