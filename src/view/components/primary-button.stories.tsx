import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { fn } from "storybook/test";
import { PrimaryButton } from "./primary-button";
import { themes } from "../theme/tokens";

const meta = {
  title: "Design System/Botão primário",
  component: PrimaryButton,
  tags: ["autodocs"],
  args: { label: "+ Nova tarefa", disabled: false, onPress: fn() },
  argTypes: {
    theme: { control: false, table: { disable: true } },
    onPress: { control: false },
    label: {
      control: "text",
      description: "Rótulo visível e nome anunciado pelo leitor de tela.",
    },
    accessibilityHint: {
      control: "text",
      description: "Use somente quando a consequência não estiver clara no rótulo.",
    },
    disabled: {
      control: "boolean",
      description:
        "Bloqueia a ação e anuncia o estado. A aparência ainda depende de tokens próprios.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Ação principal da lista de tarefas. Possui alvo mínimo de 48 × 48 dp, " +
          "foco visível de 2 dp com afastamento de 2 dp, escala de texto e estado " +
          "desabilitado anunciado. Use Tab para inspecionar o foco no Storybook.",
      },
    },
  },
  render: (args, context) => (
    <PrimaryButton
      {...args}
      theme={themes[context.globals.theme === "dark" ? "dark" : "light"]}
    />
  ),
} satisfies Meta<typeof PrimaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NovaTarefa: Story = {};
export const RotuloLongo: Story = {
  name: "Rótulo longo e texto ampliado",
  args: { label: "Criar uma nova tarefa para organizar meus estudos" },
};
export const ComDicaAcessivel: Story = {
  name: "Com dica acessível",
  args: {
    label: "Continuar",
    accessibilityHint: "Abre o formulário para criar uma tarefa",
  },
};
export const Desabilitado: Story = {
  name: "Desabilitado (visual pendente)",
  args: { disabled: true },
};
