import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { useState } from "react";
import { Text, View } from "react-native";
import { expect, userEvent, within } from "storybook/test";
import { CardTarefa } from "./card-tarefa";
import { FilterChips, type TaskFilter } from "./filter-chips";
import { NavBar, type NavTabId } from "./nav-bar";
import { PrimaryButton } from "./primary-button";
import { themes, type OrbityTheme } from "../theme/tokens";

const ThemeExample = ({ theme }: { theme: OrbityTheme }) => {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [completed, setCompleted] = useState(false);
  const [tab, setTab] = useState<NavTabId>("tarefas");
  return (
    <View style={{ backgroundColor: theme.color.surface, gap: theme.space.md, padding: theme.space.md }}>
      <Text style={{ ...theme.font.title, color: theme.color["on-surface"] }}>Tarefas</Text>
      <FilterChips selectedFilter={filter} onSelectFilter={setFilter} theme={theme} />
      <PrimaryButton label="+ Nova tarefa" onPress={() => {}} theme={theme} />
      <CardTarefa title="Estudar para prova" dueDate="Hoje, 10:45" completed={completed}
        onToggleCompleted={() => setCompleted(!completed)} onOptionsPress={() => {}} theme={theme} />
      <NavBar activeTab={tab} onSelectTab={setTab} theme={theme} />
    </View>
  );
};

const meta = { title: "Design System/Tema global", component: ThemeExample } satisfies Meta<typeof ThemeExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Cosmico: Story = { args: { theme: themes.cosmic } };
export const ClaroLegado: Story = { args: { theme: themes.light } };
export const EscuroLegado: Story = { args: { theme: themes.dark } };
export const InteracaoCosmica: Story = {
  name: "Interação no tema cósmico",
  args: { theme: themes.cosmic },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Filtrar por Pendentes" }));
    await expect(canvas.getByRole("radio", { name: "Filtrar por Pendentes" })).toHaveAttribute("aria-checked", "true");
    await expect(canvas.getByRole("radio", { name: "Filtrar por Todos" })).toHaveAttribute("aria-checked", "false");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Concluir tarefa: Estudar para prova" }));
    await expect(canvas.getByRole("checkbox", { name: "Desmarcar tarefa: Estudar para prova" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(canvas.getByRole("tab", { name: /Aba Início/ }));
    await expect(canvas.getByRole("tab", { name: /Aba Início/ })).toHaveAttribute("aria-selected", "true");
  },
};
