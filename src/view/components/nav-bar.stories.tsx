import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { fn } from "storybook/test";
import { NavBar, type NavTabId } from "./nav-bar";
import { themes } from "../theme/tokens";

const meta = {
  title: "Design System/Barra de navegação",
  component: NavBar,
  tags: ["autodocs"],
  args: {
    activeTab: "inicio",
    onSelectTab: fn(),
    visible: true,
  },
  argTypes: {
    theme: { control: false, table: { disable: true } },
    tabs: { control: false, table: { disable: true } },
    onSelectTab: { control: false },
    activeTab: {
      control: "select",
      options: ["inicio", "tarefas", "rotinas", "cosmos", "perfil"] satisfies NavTabId[],
      description: "Identificador da aba atualmente selecionada.",
    },
    visible: {
      control: "boolean",
      description:
        "Visibilidade da barra. Oculta-se durante o Modo Foco (F2) ou Seleção Múltipla (F6).",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Barra de navegação primária inferior (NavBar) do Orbity. Possui 5 destinos fixos com " +
          "glifos oficiais do Material Symbols (home, check_circle, autorenew, auto_awesome, person), " +
          "rótulos sempre visíveis, alvos de toque mínimos de 48 × 48 dp, anel de foco externo de 2 dp " +
          "para teclado (Tab) e suporte completo aos modos claro e escuro.",
      },
    },
  },
  render: (args, context) => (
    <NavBar
      {...args}
      theme={themes[context.globals.theme === "dark" ? "dark" : "light"]}
    />
  ),
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InicioAtivo: Story = {
  name: "1. Início ativo (Padrão)",
  args: { activeTab: "inicio" },
};

export const TarefasAtiva: Story = {
  name: "2. Tarefas ativa",
  args: { activeTab: "tarefas" },
};

export const RotinasAtiva: Story = {
  name: "3. Rotinas ativa",
  args: { activeTab: "rotinas" },
};

export const CosmosAtivo: Story = {
  name: "4. Cosmos ativo",
  args: { activeTab: "cosmos" },
};

export const PerfilAtivo: Story = {
  name: "5. Perfil ativo",
  args: { activeTab: "perfil" },
};

export const Interativa: Story = {
  name: "6. Navegação interativa (Controlada)",
  render: (args, context) => {
    const InteractiveNavBar = () => {
      const [currentTab, setCurrentTab] = useState<NavTabId>("inicio");
      const activeTheme =
        themes[context.globals.theme === "dark" ? "dark" : "light"];

      return (
        <NavBar
          {...args}
          activeTab={currentTab}
          onSelectTab={(tabId) => {
            args.onSelectTab?.(tabId);
            setCurrentTab(tabId);
          }}
          theme={activeTheme}
        />
      );
    };

    return <InteractiveNavBar />;
  },
};
