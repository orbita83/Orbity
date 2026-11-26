import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { Text, View } from "react-native";
import { SafeInputArea } from "./SafeInputArea";
import { TextField } from "./TextField";
import { themes } from "../theme/tokens";

const meta = {
  title: "Formulários/SafeInputArea",
  component: SafeInputArea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Envolve formulários e modais com campos de texto para que o conteúdo suba junto com o teclado do Android. Na prévia web não há teclado: confira o comportamento em aparelho real.",
      },
    },
  },
} satisfies Meta<typeof SafeInputArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Formulario: Story = {
  name: "Formulário",
  args: {
    children: (
      <View style={{ flex: 1, backgroundColor: themes.cosmic.color.surface, padding: themes.cosmic.space.md, gap: themes.cosmic.space.md }}>
        <Text style={{ ...themes.cosmic.font.label, color: themes.cosmic.color["on-surface"] }}>Nova tarefa</Text>
        <TextField label="Nome" requirement="required" value="" onChangeText={() => undefined} placeholder="Ex.: Estudar cálculo" />
      </View>
    ),
    style: { height: 320 },
  },
};
