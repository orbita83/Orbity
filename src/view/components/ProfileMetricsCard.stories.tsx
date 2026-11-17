import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { ProfileMetricsCard } from "./ProfileMetricsCard";
import { themes } from "../theme/tokens";

const meta = { title: "Perfil/ProfileMetricsCard", component: ProfileMetricsCard, tags: ["autodocs"], args: { metrics: { streakDays: 12, achievementsCount: 5, studyHours: 42 }, loading: false, theme: themes.cosmic }, argTypes: { theme: { control: false } } } satisfies Meta<typeof ProfileMetricsCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Success: Story = { name: "Sucesso",};
export const Loading: Story = { name: "Carregando", args: { loading: true } };
export const Empty: Story = { name: "Vazio", args: { metrics: { streakDays: 0, achievementsCount: 0, studyHours: 0 } } };
export const Unavailable: Story = { name: "Indisponível", args: { metrics: null } };
export const LargeValues: Story = { name: "Valores extensos", args: { metrics: { streakDays: 123456789, achievementsCount: 123456789, studyHours: 123456789 } } };
export const Light: Story = { name: "Claro", args: { theme: themes.light } };
export const Dark: Story = { name: "Escuro", args: { theme: themes.dark } };
