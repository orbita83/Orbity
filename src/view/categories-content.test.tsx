import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createCategoryFixture } from "@/model/__fixtures__/category.fixture";
import { DEFAULT_CATEGORY_IDS, type Category } from "@/model/entities/category";
import { CategoriesScreenContent, type CategoriesScreenContentProps } from "@/view/categories-content";
import { CATEGORIES_COPY } from "@/view/categoryCopy";
import { cosmicBorders, themes } from "@/view/theme/tokens";

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
};

const renderInSafeArea = (node: React.ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{node}</SafeAreaProvider>);

const DEFAULT_CATEGORIES: readonly Category[] = DEFAULT_CATEGORY_IDS.map((id) =>
  createCategoryFixture({ id, name: undefined, icon: id, isDefault: true }),
);

const buildProps = (
  overrides: Partial<CategoriesScreenContentProps> = {},
): CategoriesScreenContentProps => ({
  categories: DEFAULT_CATEGORIES,
  loading: false,
  errorKey: null,
  formVisible: false,
  editingId: null,
  nameInput: "",
  selectedIcon: "tag",
  nameError: null,
  submitting: false,
  deletingCategory: null,
  onReturn: jest.fn(),
  reload: jest.fn(async () => undefined),
  openCreate: jest.fn(),
  openEdit: jest.fn(),
  closeForm: jest.fn(),
  setNameInput: jest.fn(),
  selectIcon: jest.fn(),
  submitForm: jest.fn(async () => undefined),
  requestDelete: jest.fn(),
  cancelDelete: jest.fn(),
  confirmDelete: jest.fn(async () => undefined),
  ...overrides,
});

describe("CategoriesScreenContent", () => {
  it("lista as categorias com ícone, nome e botões de editar/excluir com alvo mínimo de 48 dp", async () => {
    const custom = createCategoryFixture({ id: "cat-1", name: "Física", icon: "rocket", isDefault: false });
    const props = buildProps({ categories: [...DEFAULT_CATEGORIES, custom] });
    await renderInSafeArea(<CategoriesScreenContent {...props} />);

    expect(screen.getByRole("header", { name: CATEGORIES_COPY.title })).toBeTruthy();
    expect(screen.getByText("Matemática")).toBeTruthy();
    expect(screen.getByText("Física")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: CATEGORIES_COPY.backLabel }));
    expect(props.onReturn).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole("button", { name: CATEGORIES_COPY.new }));
    expect(props.openCreate).toHaveBeenCalledTimes(1);

    const editPhysics = screen.getByRole("button", { name: "Editar categoria Física" });
    const deletePhysics = screen.getByRole("button", { name: "Excluir categoria Física" });
    expect(StyleSheet.flatten(editPhysics.props.style).minHeight).toBe(themes.cosmic.target.minSize);
    expect(StyleSheet.flatten(deletePhysics.props.style).minHeight).toBe(themes.cosmic.target.minSize);

    await fireEvent.press(editPhysics);
    expect(props.openEdit).toHaveBeenCalledWith(custom, "Física");

    await fireEvent.press(deletePhysics);
    expect(props.requestDelete).toHaveBeenCalledWith(custom);
  });

  it("abre o modal de criação e edição com campo de texto, seletor de 14 ícones e validação", async () => {
    const props = buildProps({
      formVisible: true,
      editingId: null,
      nameInput: "Química",
      selectedIcon: "science",
      nameError: "Já existe uma categoria com esse nome.",
    });
    await renderInSafeArea(<CategoriesScreenContent {...props} />);

    expect(screen.getByRole("header", { name: CATEGORIES_COPY["form.createTitle"] })).toBeTruthy();
    expect(screen.getByRole("alert")).toHaveTextContent("Já existe uma categoria com esse nome.");
    expect(screen.getByText("7/24")).toBeTruthy();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(14);

    await fireEvent.press(screen.getByRole("radio", { name: "Foguete" }));
    expect(props.selectIcon).toHaveBeenCalledWith("rocket");

    await fireEvent.press(screen.getByRole("button", { name: CATEGORIES_COPY["form.save"] }));
    expect(props.submitForm).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole("button", { name: CATEGORIES_COPY["form.cancel"] }));
    expect(props.closeForm).toHaveBeenCalledTimes(1);
  });

  it("pede confirmação antes de excluir com ConfirmDialog no padrão da #151", async () => {
    const target = createCategoryFixture({ id: "languages", name: undefined, icon: "languages", isDefault: true });
    const props = buildProps({ deletingCategory: target });
    await renderInSafeArea(<CategoriesScreenContent {...props} />);

    expect(screen.getByRole("header", { name: "Excluir a categoria Idiomas?" })).toBeTruthy();
    expect(screen.getByText(CATEGORIES_COPY["delete.message"])).toBeTruthy();

    const confirmBtn = screen.getByRole("button", { name: CATEGORIES_COPY["delete.confirm"] });
    const cancelBtn = screen.getByRole("button", { name: CATEGORIES_COPY["delete.cancel"] });
    expect(StyleSheet.flatten(confirmBtn.props.style).backgroundColor).toBe(themes.cosmic.button.bg);
    expect(StyleSheet.flatten(cancelBtn.props.style).borderColor).toBe(cosmicBorders.sheet);

    await fireEvent.press(cancelBtn);
    expect(props.cancelDelete).toHaveBeenCalledTimes(1);

    await fireEvent.press(confirmBtn);
    expect(props.confirmDelete).toHaveBeenCalledTimes(1);
  });

  it("exibe estados de carregamento, vazio e erro com botão Tentar novamente", async () => {
    const view = await renderInSafeArea(
      <CategoriesScreenContent {...buildProps({ categories: [], loading: true })} />,
    );
    expect(screen.getByLabelText(CATEGORIES_COPY.loading)).toBeTruthy();
    expect(screen.queryByText(CATEGORIES_COPY["empty.title"])).toBeNull();

    await view.rerender(
      <SafeAreaProvider initialMetrics={metrics}>
        <CategoriesScreenContent {...buildProps({ categories: [], loading: false })} />
      </SafeAreaProvider>,
    );
    expect(screen.getByText(CATEGORIES_COPY["empty.title"])).toBeTruthy();

    const errorProps = buildProps({ categories: [], loading: false, errorKey: "error.load" });
    await view.rerender(
      <SafeAreaProvider initialMetrics={metrics}>
        <CategoriesScreenContent {...errorProps} />
      </SafeAreaProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(CATEGORIES_COPY["error.load"]);
    await fireEvent.press(screen.getByRole("button", { name: CATEGORIES_COPY["error.retry"] }));
    expect(errorProps.reload).toHaveBeenCalledTimes(1);
  });
});
