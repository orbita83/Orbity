import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { View } from "react-native";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent, within } from "storybook/test";
import { CardTarefa } from "./card-tarefa";
import { themes } from "../theme/tokens";

const meta = {
  title: "Design System/Card de tarefa",
  component: CardTarefa,
  tags: ["autodocs"],
  args: {
    title: "Revisar anotações de biologia",
    dueDate: "Hoje, 18:00",
    completed: false,
    onToggleCompleted: fn(),
    onOptionsPress: fn(),
  },
  argTypes: {
    theme: { control: false, table: { disable: true } },
    onToggleCompleted: { control: false },
    onOptionsPress: { control: false },
    title: { control: "text", description: "Título visível da tarefa." },
    dueDate: {
      control: "text",
      description: "Texto de prazo opcional, fornecido pelo chamador.",
    },
    completed: {
      control: "boolean",
      description: "Estado de conclusão controlado pelo chamador.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Apresenta título, prazo opcional e conclusão. O controle de opções delega " +
          "sua ação ao chamador; aparência e comportamento não especificados estão " +
          "registrados no documento do componente.",
      },
    },
  },
  render: (args, context) => (
    <CardTarefa
      {...args}
      theme={themes[context.globals.theme === "dark" ? "dark" : "light"]}
    />
  ),
} satisfies Meta<typeof CardTarefa>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pendente: Story = {};
export const Estados: Story = {
  name: "Comparação dos estados",
  render: (args, context) => {
    const theme = themes[context.globals.theme === "dark" ? "dark" : "light"];
    return (
      <View style={{ gap: theme.space.md }}>
        <CardTarefa {...args} completed={false} theme={theme} />
        <CardTarefa {...args} completed={true} theme={theme} />
      </View>
    );
  },
};

export const Concluida: Story = {
  name: "Concluída",
  args: { completed: true },
};
export const SemPrazo: Story = { args: { dueDate: undefined } };
export const SemOpcoes: Story = { args: { onOptionsPress: undefined } };
export const TituloLongo: Story = {
  name: "Título longo",
  args: {
    title:
      "Preparar resumo completo dos conteúdos estudados durante a semana para a avaliação",
  },
};

export const ListaDoPrototipo: Story = {
  name: "Lista de tarefas do protótipo",
  render: (args, context) => {
    const theme = themes[context.globals.theme === "dark" ? "dark" : "light"];
    const tasks = [
      "Estudar para prova",
      "Estudar para pdm",
      "Estudar para ihc",
    ];

    return (
      <View style={{ gap: theme.space.sm }}>
        {tasks.map((title) => (
          <CardTarefa
            key={title}
            title={title}
            dueDate="termina 19/10 às 10:45"
            completed={args.completed}
            onToggleCompleted={args.onToggleCompleted}
            onOptionsPress={args.onOptionsPress}
            theme={theme}
          />
        ))}
      </View>
    );
  },
};

export const Interativa: Story = {
  name: "Interativa: conclusão e opções",
  render: function Render(args, context) {
    const [, updateArgs] = useArgs();
    const theme = themes[context.globals.theme === "dark" ? "dark" : "light"];

    return (
      <CardTarefa
        {...args}
        onToggleCompleted={() => {
          args.onToggleCompleted();
          updateArgs({ completed: !args.completed });
        }}
        theme={theme}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    await userEvent.click(checkbox);
    await expect(args.onToggleCompleted).toHaveBeenCalledTimes(1);
    await expect(checkbox.getAttribute("aria-checked")).toBe("true");

    await userEvent.click(
      canvas.getByRole("button", {
        name: `Opções da tarefa: ${args.title}`,
      }),
    );
    await expect(args.onOptionsPress).toHaveBeenCalledTimes(1);
  },
};
