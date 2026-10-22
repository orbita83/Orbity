import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, View } from "react-native";
import { cosmicTokens as t } from "../theme/tokens";
import { PlanetStreakView, type PlanetStreakViewProps } from "./planet-streak-view";

const meta = {
  title: "Design System/Planeta e sequência",
  component: PlanetStreakView,
  args: { streakDays: 12, size: 390, isFocusMode: false },
  parameters: { cosmicHome: true },
  argTypes: {
    streakDays: { control: { type: "number", min: 0 } },
    size: { control: { type: "range", min: 240, max: 430, step: 10 } },
  },
  render: (args) => <View style={styles.preview}><PlanetStreakView {...args} /></View>,
} satisfies Meta<PlanetStreakViewProps>;

export default meta;
type Story = StoryObj<PlanetStreakViewProps>;

export const DozeDias: Story = { name: "12 dias de sequência" };
export const InicioDaJornada: Story = { name: "Início da jornada", args: { streakDays: 0 } };
export const EmFoco: Story = { name: "Modo foco", args: { isFocusMode: true } };
export const SequenciaLonga: Story = { name: "Sequência longa", args: { streakDays: 365 } };

const styles = StyleSheet.create({
  preview: { minHeight: 520, alignItems: "center", justifyContent: "center", backgroundColor: t.color.background, padding: t.space.xxl },
});
