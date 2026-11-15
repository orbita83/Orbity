import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { ProfileShortcutItem } from "./ProfileShortcutItem";
import { themes } from "../theme/tokens";

const meta = { title: "Perfil/ProfileShortcutItem", component: ProfileShortcutItem, tags: ["autodocs"], args: { title: "Conquistas", description: "Acompanhe suas conquistas", icon: "emoji_events", href: "/achievements", theme: themes.cosmic }, argTypes: { theme: { control: false } }, parameters: { docs: { description: { component: "Atalhos internos do Expo Router. Na prévia isolada, inspecione anatomia, foco e estados; valide destinos no aplicativo." } } } } satisfies Meta<typeof ProfileShortcutItem>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Achievements: Story = { name: "Conquistas",};
export const Categories: Story = { name: "Categorias", args: { title: "Categorias", description: "Organize suas categorias de estudo", icon: "category", href: "/categories" } };
export const Settings: Story = { name: "Configurações", args: { title: "Configurações", description: "Acesse as configurações do aplicativo", icon: "settings", href: "/settings" } };
export const Loading: Story = { name: "Carregando", args: { loading: true } };
export const Light: Story = { name: "Claro", args: { theme: themes.light } };
export const Dark: Story = { name: "Escuro", args: { theme: themes.dark } };
