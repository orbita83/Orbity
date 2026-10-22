import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, Text, View } from "react-native";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  FilterChips,
  type TaskFilter,
  DEFAULT_TASK_FILTERS,
} from "./filter-chips";
import { CardTarefa } from "./card-tarefa";
import { themes, type OrbityTheme } from "../theme/tokens";

const meta = {
  title: "Design System/Chips de filtro",
  component: FilterChips,
  tags: ["autodocs"],
  args: {
    selectedFilter: "all",
    onSelectFilter: fn(),
    filters: DEFAULT_TASK_FILTERS,
  },
  argTypes: {
    theme: { control: false, table: { disable: true } },
    onSelectFilter: { control: false },
    selectedFilter: {
      control: "select",
      options: ["all", "pending", "completed"] satisfies TaskFilter[],
      description: "Identificador do filtro atualmente ativo.",
    },
    filters: {
      control: false,
      description: "Lista de opções de filtros disponíveis.",
    },
    accessibilityLabel: {
      control: "text",
      description: "Rótulo de acessibilidade para o grupo de filtros.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Chips de filtro para controle de visualização da lista de tarefas. " +
          "Oferece opções para visualizar Todas, Pendentes e Concluídas. " +
          "Segue o Design System com cantos arredondados (radius.md), espaçamento de 8 dp (space.sm), " +
          "alvo mínimo de toque de 48 × 48 dp (target.min-size), anel de foco visível de 2 dp " +
          "e contraste estrito nos modos claro e escuro.",
      },
    },
  },
  render: (args, context) => (
    <FilterChips
      {...args}
      theme={themes[context.globals.theme === "dark" ? "dark" : "light"]}
    />
  ),
} satisfies Meta<typeof FilterChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TodosAtivo: Story = {
  name: "1. Todos selecionado (Padrão)",
  args: { selectedFilter: "all" },
};

export const PendentesAtivo: Story = {
  name: "2. Pendentes selecionado",
  args: { selectedFilter: "pending" },
};

export const ConcluidasAtivo: Story = {
  name: "3. Concluídas selecionado",
  args: { selectedFilter: "completed" },
};

type PrototypeTask = {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
};

const PROTOTYPE_TASKS: readonly PrototypeTask[] = [
  {
    id: "1",
    title: "Estudar para prova",
    dueDate: "termina 19/10 às 10:45",
    completed: false,
  },
  {
    id: "2",
    title: "Estudar para pdm",
    dueDate: "termina 19/10 às 10:45",
    completed: false,
  },
  {
    id: "3",
    title: "Estudar para ihc",
    dueDate: "termina 19/10 às 10:45",
    completed: true,
  },
];

export const ListaDeTarefasFiltrada: Story = {
  name: "4. Integração com listagem de tarefas",
  render: function Render(_args, context) {
    const theme = themes[context.globals.theme === "dark" ? "dark" : "light"];
    const [selectedFilter, setSelectedFilter] = useState<TaskFilter>("all");
    const [tasks, setTasks] = useState<readonly PrototypeTask[]>(PROTOTYPE_TASKS);

    const filteredTasks = tasks.filter((task) => {
      if (selectedFilter === "pending") return !task.completed;
      if (selectedFilter === "completed") return task.completed;
      return true;
    });

    const handleToggleTask = (id: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task,
        ),
      );
    };

    const emptyMessage =
      selectedFilter === "completed"
        ? "Nenhuma tarefa concluída"
        : "Nenhuma tarefa pendente";

    const styles = createStoryStyles(theme);

    return (
      <View style={styles.container}>
        <FilterChips
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          theme={theme}
        />
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text allowFontScaling style={styles.emptyText}>
              {emptyMessage}
            </Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {filteredTasks.map((task) => (
              <CardTarefa
                key={task.id}
                title={task.title}
                dueDate={task.dueDate}
                completed={task.completed}
                onToggleCompleted={() => handleToggleTask(task.id)}
                theme={theme}
              />
            ))}
          </View>
        )}
      </View>
    );
  },
};

export const ListaVazia: Story = {
  name: "5. Estado de lista vazia",
  render: function Render(_args, context) {
    const theme = themes[context.globals.theme === "dark" ? "dark" : "light"];
    const [selectedFilter, setSelectedFilter] = useState<TaskFilter>("completed");
    const styles = createStoryStyles(theme);

    return (
      <View style={styles.container}>
        <FilterChips
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          theme={theme}
        />
        <View style={styles.emptyContainer}>
          <Text allowFontScaling style={styles.emptyText}>
            Nenhuma tarefa concluída
          </Text>
        </View>
      </View>
    );
  },
};

export const ComparacaoTemas: Story = {
  name: "6. Comparação tema claro e escuro",
  render: () => {
    return (
      <View style={{ gap: 24 }}>
        <View
          style={{
            backgroundColor: themes.light.color.surface,
            padding: 16,
            borderRadius: 12,
            gap: 12,
          }}
        >
          <Text
            allowFontScaling
            style={{ ...themes.light.font.label, color: themes.light.color["on-surface"] }}
          >
            Tema Claro:
          </Text>
          <FilterChips
            selectedFilter="all"
            onSelectFilter={() => {}}
            theme={themes.light}
          />
        </View>

        <View
          style={{
            backgroundColor: themes.dark.color.surface,
            padding: 16,
            borderRadius: 12,
            gap: 12,
          }}
        >
          <Text
            allowFontScaling
            style={{ ...themes.dark.font.label, color: themes.dark.color["on-surface"] }}
          >
            Tema Escuro:
          </Text>
          <FilterChips
            selectedFilter="all"
            onSelectFilter={() => {}}
            theme={themes.dark}
          />
        </View>
      </View>
    );
  },
};

export const Interativa: Story = {
  name: "7. Interativa com validação de clique",
  render: function Render(args, context) {
    const theme = themes[context.globals.theme === "dark" ? "dark" : "light"];
    const [filter, setFilter] = useState<TaskFilter>(
      (args.selectedFilter as TaskFilter) ?? "all",
    );

    return (
      <FilterChips<TaskFilter>
        selectedFilter={filter}
        onSelectFilter={(id) => {
          setFilter(id);
          args.onSelectFilter(id);
        }}
        theme={theme}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const pendentesBtn = canvas.getByRole("button", {
      name: "Filtrar por Pendentes",
    });

    await userEvent.click(pendentesBtn);
    await expect(args.onSelectFilter).toHaveBeenCalledWith("pending");
  },
};

const createStoryStyles = (theme: OrbityTheme) =>
  StyleSheet.create({
    container: {
      gap: theme.space.md,
      padding: theme.space.sm,
    },
    taskList: {
      gap: theme.space.sm,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: theme.space.lg,
    },
    emptyText: {
      ...theme.font.body,
      color: theme.color["on-surface"],
      textAlign: "center",
    },
  });
