import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { fn } from "storybook/test";
import { ProfileHeaderCard } from "./ProfileHeaderCard";
import { themes } from "../theme/tokens";

const meta = {
  title: "Perfil/ProfileHeaderCard",
  component: ProfileHeaderCard,
  tags: ["autodocs"],
  args: {
    name: "Alex Silva",
    loading: false,
    onEditPress: fn(),
  },
  argTypes: {
    theme: { control: false, table: { disable: true } },
    onEditPress: { control: false },
    name: {
      control: "text",
      description: "Nome completo do estudante exibido no cartão de identificação.",
    },
    loading: {
      control: "boolean",
      description: "Exibe o estado de esqueleto enquanto as informações são carregadas.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Cartão de identificação do estudante para o cabeçalho da tela Meu perfil. " +
          "Possui avatar circular de 48 × 48 dp, nome com tipografia formal do ODS, " +
          "esqueletos dimensionados e botão acessível com alvo mínimo de 48 × 48 dp.",
      },
    },
  },
  render: (args, context) => (
    <ProfileHeaderCard
      {...args}
      theme={
        themes[
          context.globals.theme === "light"
            ? "light"
            : context.globals.theme === "dark"
              ? "dark"
              : "cosmic"
        ]
      }
    />
  ),
} satisfies Meta<typeof ProfileHeaderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};

export const Carregando: Story = {
  args: {
    loading: true,
  },
};

export const NomeLongo: Story = {
  args: {
    name: "Alexandre Henrique de Alencar Mendonça dos Santos",
  },
};
