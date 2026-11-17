import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, View } from "react-native";
import { themes } from "../theme/tokens";
import { PlanetStreakView, type PlanetStreakViewProps } from "./PlanetStreakView";

const meta = {
  title: "Design System/Planeta e sequência",
  component: PlanetStreakView,
  args: { days: 12, size: 390 },
  parameters: { cosmicHome: true },
  argTypes: {
    days: { control: { type: "number", min: 0 } },
    size: { control: { type: "range", min: 240, max: 432, step: 8 } },
  },
  render: (args) => (
    <View style={styles.preview}>
      <PlanetStreakView {...args} />
    </View>
  ),
} satisfies Meta<PlanetStreakViewProps>;

export default meta;
type Story = StoryObj<PlanetStreakViewProps>;

export const DozeDias: Story = { name: "12 dias de sequência" };
export const UmDia: Story = { name: "1 dia de sequência", args: { days: 1 } };
export const InicioDaJornada: Story = { name: "Início da jornada", args: { days: 0 } };
export const SequenciaLonga: Story = { name: "Sequência longa", args: { days: 365 } };

const styles = StyleSheet.create({
  preview: {
    minHeight: 520,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themes.cosmic.color.surface,
    padding: themes.cosmic.space.lg,
  },
});
