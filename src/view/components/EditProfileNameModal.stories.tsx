import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { fn } from "storybook/test";
import { EditProfileNameModal } from "./EditProfileNameModal";
import { themes } from "../theme/tokens";

const meta = {
  title: "Perfil/EditProfileNameModal",
  component: EditProfileNameModal,
  tags: ["autodocs"],
  args: {
    visible: true,
    name: "Alex Silva",
    saving: false,
    validationError: null,
    onChangeName: fn(),
    onSave: fn(),
    onClose: fn(),
  },
  argTypes: {
    theme: { control: false, table: { disable: true } },
    onChangeName: { control: false },
    onSave: { control: false },
    onClose: { control: false },
    name: {
      control: "text",
      description: "Valor digitado no campo de texto de edição de nome.",
    },
    visible: {
      control: "boolean",
      description: "Controla a visibilidade do modal.",
    },
    saving: {
      control: "boolean",
      description: "Indica se o salvamento assíncrono está em andamento.",
    },
    validationError: {
      control: "text",
      description: "Mensagem de erro de validação de negócio.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Modal acessível para edição do nome do estudante na tela Meu perfil. " +
          "Possui campo com altura padrão de 56 dp do ODS/Material 3, validação com " +
          "anúncio acessível, contador de caracteres e alvos de toque mínimos de 48 × 48 dp.",
      },
    },
  },
  render: (args, context) => (
    <EditProfileNameModal
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
} satisfies Meta<typeof EditProfileNameModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};

export const ComErroValidacao: Story = {
  args: {
    validationError: "O nome deve ter no máximo 60 caracteres.",
    name: "Nome muito longo excedendo os limites estipulados de sessenta caracteres",
  },
};

export const Salvando: Story = {
  args: {
    saving: true,
  },
};
