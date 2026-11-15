import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PROTOTYPE_INACTIVE_ROUTINE, PROTOTYPE_ROUTINE_DETAILS, PROTOTYPE_ROUTINES } from "@/view/__fixtures__/routines.fixture";
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
  loading: false,
  errorKey: null,
  reload: jest.fn(),
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

  it("R6: fora do dia, o círculo fica desabilitado e o motivo aparece em texto", async () => {
    const props = listProps({ visibleRoutines: [PROTOTYPE_INACTIVE_ROUTINE], totalCount: 0, doneTodayCount: 0 });
    await inSafeArea(<RoutinesScreenContent {...props} />);

    expect(screen.getByText(ROUTINES_COPY["inactive.today"])).toBeTruthy();
    expect(screen.getByText(ROUTINES_COPY["summary.noneToday"])).toBeTruthy();
    const circle = screen.getByRole("checkbox", { name: "Concluir rotina Revisão de fim de semana hoje" });
    expect(circle.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(circle);
    expect(props.toggleDoneToday).not.toHaveBeenCalled();
  });

  it("F8: carregando mostra o esqueleto e não o estado vazio; um erro aparece com texto", async () => {
    const view = await inSafeArea(<RoutinesScreenContent {...listProps({ visibleRoutines: [], totalCount: 0, loading: true })} />);
    expect(screen.getByLabelText(ROUTINES_COPY.loading)).toBeTruthy();
    expect(screen.queryByText(ROUTINES_COPY["empty.title"])).toBeNull();

    await view.rerender(
      <SafeAreaProvider initialMetrics={metrics}>
        <RoutinesScreenContent {...listProps({ errorKey: "error.load" })} />
      </SafeAreaProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(ROUTINES_COPY["error.load"]);
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
  formError: null,
  submitting: false,
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
  onFinish: jest.fn(),
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

  it("falha ao salvar: mostra o aviso e bloqueia o envio enquanto salva", async () => {
    const props = formProps({ formError: "Não foi possível salvar a rotina agora. Tente de novo.", submitting: true });
    await inSafeArea(<NewRoutineScreenContent {...props} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível salvar a rotina agora. Tente de novo.");
    expect(screen.getByRole("button", { name: ROUTINES_COPY["form.submit"] }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it("F7, passo 4: depois de criar, mostra Rotina criada! e volta para a lista", async () => {
    const props = formProps({ created: true });
    await inSafeArea(<NewRoutineScreenContent {...props} />);

    expect(screen.getByRole("header", { name: ROUTINES_COPY["created.title"] })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: ROUTINES_COPY["created.action"] }));
    expect(props.onFinish).toHaveBeenCalledTimes(1);
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
  doneToday: false,
  confirmDeleteVisible: false,
  loading: false,
  errorKey: null,
  toggleTask: jest.fn(),
  moveTaskUp: jest.fn(),
  completeAll: jest.fn(),
  undoAll: jest.fn(),
  requestDelete: jest.fn(),
  cancelDelete: jest.fn(),
  reload: jest.fn(),
  onBack: jest.fn(),
  onDeleted: jest.fn(),
  ...overrides,
});

describe("RoutineDetailsScreenContent", () => {
  it("3.2: resumo, progresso, tarefas e Marcar como concluída", async () => {
    const props = detailsProps();
    await inSafeArea(<RoutineDetailsScreenContent {...props} />);

    expect(screen.getByRole("header", { name: "Matemática" })).toBeTruthy();
    // barra-progresso.md: contador e porcentagem em texto, fora da barra.
    expect(screen.getByText("1 / 3 · 33%")).toBeTruthy();
    expect(screen.getByRole("progressbar").props.accessibilityValue).toMatchObject({
      now: 1,
      max: 3,
      text: "1 de 3 concluídas, 33%",
    });

    await fireEvent.press(screen.getByRole("checkbox", { name: "Concluir Resolver a lista de exercícios" }));
    expect(props.toggleTask).toHaveBeenCalledWith("b");
    await fireEvent.press(screen.getByRole("button", { name: ROUTINES_COPY["details.completeAll"] }));
    expect(props.completeAll).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByRole("button", { name: ROUTINES_COPY["details.delete"] }));
    expect(props.requestDelete).toHaveBeenCalledTimes(1);
  });

  it("rotina concluída hoje: comemora e troca o rodapé por Desmarcar todos", async () => {
    const props = detailsProps({ completedCount: 3, doneToday: true });
    await inSafeArea(<RoutineDetailsScreenContent {...props} />);

    expect(screen.getByText(ROUTINES_COPY["details.allDone"])).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: ROUTINES_COPY["details.undoAll"] }));
    expect(props.undoAll).toHaveBeenCalledTimes(1);
  });

  it("R3: com todas as tarefas marcadas mas a rotina não concluída, o rodapé continua em Marcar como concluída", async () => {
    await inSafeArea(<RoutineDetailsScreenContent {...detailsProps({ completedCount: 3, doneToday: false })} />);
    expect(screen.getByRole("button", { name: ROUTINES_COPY["details.completeAll"] })).toBeTruthy();
    expect(screen.queryByText(ROUTINES_COPY["details.allDone"])).toBeNull();
  });

  it("R6: fora do dia, concluir e marcar ficam desabilitados com o motivo em texto", async () => {
    const props = detailsProps({ routine: { ...PROTOTYPE_ROUTINE_DETAILS, activeToday: false } });
    await inSafeArea(<RoutineDetailsScreenContent {...props} />);

    expect(screen.getByText(ROUTINES_COPY["inactive.today"])).toBeTruthy();
    const complete = screen.getByRole("button", { name: ROUTINES_COPY["details.completeAll"] });
    expect(complete.props.accessibilityState).toMatchObject({ disabled: true });
    const circle = screen.getByRole("checkbox", { name: "Concluir Resolver a lista de exercícios" });
    expect(circle.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(complete);
    await fireEvent.press(circle);
    expect(props.completeAll).not.toHaveBeenCalled();
    expect(props.toggleTask).not.toHaveBeenCalled();
  });

  it("F8: sem tarefas, mostra o estado vazio do ODS", async () => {
    await inSafeArea(
      <RoutineDetailsScreenContent {...detailsProps({ completedCount: 0, routine: { ...PROTOTYPE_ROUTINE_DETAILS, tasks: [] } })} />,
    );
    expect(screen.getByText(ROUTINES_COPY["details.tasks.empty"])).toBeTruthy();
    // Sem tarefas não há porcentagem (barra-progresso.md, estado Vazio).
    expect(screen.getByText("0 / 0")).toBeTruthy();
  });

  it("F8: carregando a rotina mostra o esqueleto", async () => {
    await inSafeArea(<RoutineDetailsScreenContent {...detailsProps({ routine: null, loading: true })} />);
    expect(screen.getByLabelText(ROUTINES_COPY["details.loading"])).toBeTruthy();
    expect(screen.queryByText(ROUTINES_COPY["details.missing.title"])).toBeNull();
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
