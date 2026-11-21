import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, View } from "react-native";
import { expect, within } from "storybook/test";
import { CategoryTag } from "./CategoryTag";
import { themes } from "../theme/tokens";

const meta = {
  title: "Design System/Tag de categoria",
  component: CategoryTag,
  tags: ["autodocs"],
  args: { label: "Programação", symbol: "code", theme: themes.cosmic },
  argTypes: {
    theme: { control: false, table: { disable: true } },
    label: { control: "text", description: "Rótulo visível da categoria." },
    symbol: { control: "text", description: "Ícone do Material Symbols que acompanha o rótulo." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Tag informativa da categoria de estudo, usada no card de tarefa. Não é interativa: " +
          "não recebe toque nem foco. Texto e ícone em `color.on-surface` sobre `color.action-subtle`.",
      },
    },
  },
} satisfies Meta<typeof CategoryTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cosmico: Story = {
  name: "Cósmico",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Categoria: Programação")).toBeTruthy();
  },
};
export const Escuro: Story = { args: { theme: themes.dark } };
export const Claro: Story = { args: { theme: themes.light } };

const CATEGORIES = [
  { label: "Matemática", symbol: "calculate" },
  { label: "Leitura", symbol: "menu_book" },
  { label: "Idiomas", symbol: "translate" },
  { label: "Ciências", symbol: "science" },
  { label: "Programação", symbol: "code" },
  { label: "Música", symbol: "music_note" },
] as const;

export const TodasAsCategorias: Story = {
  name: "Todas as categorias",
  render: (args) => (
    <View style={styles.row}>
      {CATEGORIES.map((category) => (
        <CategoryTag key={category.label} {...category} theme={args.theme} />
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: themes.cosmic.space.sm },
});
