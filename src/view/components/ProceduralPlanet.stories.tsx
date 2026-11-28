import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { StyleSheet, Text, View } from "react-native";
import { themes } from "../theme/tokens";
import { PlanetIllustration } from "./PlanetIllustration";
import { ProceduralPlanet, type ProceduralPlanetProps } from "./ProceduralPlanet";

const theme = themes.cosmic;

type StoryArgs = ProceduralPlanetProps & { days: number };

// Contador como texto real por cima do planeta, como na Tela Inicial.
const Counter = ({ days }: { days: number }) => (
  <View style={styles.counter} pointerEvents="none">
    <Text style={styles.days}>{days}</Text>
    <Text style={styles.label}>dias de sequência</Text>
  </View>
);

const meta = {
  title: "Design System/Planeta procedural (#221)",
  component: ProceduralPlanet,
  args: { size: 320, days: 12, showRing: true, still: false },
  parameters: { cosmicHome: true },
  argTypes: {
    size: { control: { type: "range", min: 200, max: 400, step: 8 } },
    days: { control: { type: "number", min: 0 } },
  },
  render: ({ days, ...args }) => (
    <View style={styles.preview}>
      <View style={{ width: args.size, height: args.size }}>
        <ProceduralPlanet {...args} />
        <Counter days={days} />
      </View>
    </View>
  ),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Nebulosa: Story = { name: "Nebulosa contida (girando)" };
export const MovimentoReduzido: Story = { name: "Movimento reduzido (parado)", args: { still: true } };
export const SemAnel: Story = { name: "Sem anel", args: { showRing: false } };
export const Comparacao: Story = {
  name: "Comparação com o planeta atual",
  render: ({ days, ...args }) => (
    <View style={[styles.preview, styles.row]}>
      <View style={styles.column}>
        <View style={{ width: args.size, height: args.size }}>
          <PlanetIllustration />
          <Counter days={days} />
        </View>
        <Text style={styles.caption}>Atual (SVG, PlanetIllustration)</Text>
      </View>
      <View style={styles.column}>
        <View style={{ width: args.size, height: args.size }}>
          <ProceduralPlanet {...args} />
          <Counter days={days} />
        </View>
        <Text style={styles.caption}>Procedural (shader no Skia)</Text>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  preview: {
    minHeight: 480,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.space.lg,
    backgroundColor: theme.color.surface,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: theme.space.lg },
  column: { alignItems: "center", gap: theme.space.sm },
  counter: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" },
  days: { ...theme.font.streak, color: theme.color["on-surface"] },
  label: { ...theme.font.label, color: theme.color["on-surface"] },
  caption: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"] },
});
