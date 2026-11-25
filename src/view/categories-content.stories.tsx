import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fn } from "storybook/test";
import { createCategoryFixture } from "../model/__fixtures__/category.fixture";
import { DEFAULT_CATEGORY_IDS, type Category } from "../model/entities/category";
import { useCategoriesViewModel } from "../viewmodel/useCategoriesViewModel";
import { CategoriesScreenContent, type CategoriesScreenContentProps } from "./categories-content";
import { themes } from "./theme/tokens";

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
};
const noop = () => undefined;

const STORY_CATEGORIES: readonly Category[] = [
  ...DEFAULT_CATEGORY_IDS.map((id) =>
    createCategoryFixture({ id, name: undefined, icon: id, isDefault: true }),
  ),
  createCategoryFixture({ id: "cat-physics", name: "Física", icon: "rocket", isDefault: false }),
];

const baseArgs: CategoriesScreenContentProps = {
  categories: STORY_CATEGORIES,
  loading: false,
  errorKey: null,
  formVisible: false,
  editingId: null,
  nameInput: "",
  selectedIcon: "tag",
  nameError: null,
  submitting: false,
  deletingCategory: null,
  onReturn: fn(),
  reload: fn(async () => undefined),
  openCreate: fn(),
  openEdit: fn(),
  closeForm: fn(),
  setNameInput: fn(),
  selectIcon: fn(),
  submitForm: fn(async () => undefined),
  requestDelete: fn(),
  cancelDelete: fn(),
  confirmDelete: fn(async () => undefined),
};

const meta = {
  title: "Telas/Categorias",
  component: CategoriesScreenContent,
  args: baseArgs,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <SafeAreaProvider initialMetrics={metrics}>
        <View style={styles.frame}>
          <Story />
        </View>
      </SafeAreaProvider>
    ),
  ],
} satisfies Meta<CategoriesScreenContentProps>;

export default meta;
type Story = StoryObj<CategoriesScreenContentProps>;

export const Lista: Story = { name: "5.2 · Categorias" };

export const NovaCategoria: Story = {
  name: "5.2 · Modal Nova categoria",
  args: {
    formVisible: true,
    editingId: null,
    nameInput: "Química Orgânica",
    selectedIcon: "science",
  },
};

export const EditarCategoria: Story = {
  name: "5.2 · Modal Editar categoria",
  args: {
    formVisible: true,
    editingId: "music",
    nameInput: "Violão",
    selectedIcon: "star",
  },
};

export const ConfirmarExclusao: Story = {
  name: "5.2 · Confirmar exclusão",
  args: {
    deletingCategory: STORY_CATEGORIES[2],
  },
};

export const Vazia: Story = {
  name: "5.2 · Sem categorias",
  args: {
    categories: [],
  },
};

export const Carregando: Story = {
  name: "5.2 · Carregando (esqueleto)",
  args: {
    categories: [],
    loading: true,
  },
};

export const ErroAoCarregar: Story = {
  name: "5.2 · Erro ao carregar",
  args: {
    categories: [],
    errorKey: "error.load",
  },
};

const InteractiveCategories = () => {
  const [state, actions] = useCategoriesViewModel(STORY_CATEGORIES);
  return <CategoriesScreenContent {...state} {...actions} onReturn={noop} />;
};

export const Interativa: Story = {
  name: "Interativa · criar, editar e excluir",
  render: () => <InteractiveCategories />,
};

const styles = StyleSheet.create({
  frame: { width: 390, height: 844, backgroundColor: themes.cosmic.color.surface },
});
