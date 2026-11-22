import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { fn } from "storybook/test";
import { themes } from "../theme/tokens";
import { CheckCircle } from "./CheckCircle";
import { IconTile } from "./IconTile";
import { ScreenHeader } from "./ScreenHeader";
import { TextField } from "./TextField";

const theme = themes.cosmic;

const Frame = ({ children }: { children: React.ReactNode }) => <View style={styles.frame}>{children}</View>;

const meta = {
  title: "Design System/Campos e controles das telas",
  component: TextField,
  parameters: { layout: "fullscreen" },
  args: { label: "Nome da rotina", value: "", onChangeText: fn() },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveField = (props: Partial<React.ComponentProps<typeof TextField>>) => {
  const [value, setValue] = useState(props.value ?? "");
  return <TextField label="Nome da rotina" {...props} value={value} onChangeText={setValue} />;
};

export const CampoDeTexto: Story = {
  name: "TextField · padrão, ajuda, erro e várias linhas",
  render: () => (
    <Frame>
      <InteractiveField requirement="required" placeholder="Ex.: Matemática" />
      <InteractiveField label="Descrição" requirement="optional" placeholder="Ex.: Rotina diária de estudos" multiline />
      <InteractiveField helper="A rotina aparece nos dias escolhidos." placeholder="Ex.: Inglês" />
      <InteractiveField requirement="required" error="Dê um nome para a rotina." />
    </Frame>
  ),
};

const InteractiveCheck = ({ initial }: { initial: boolean }) => {
  const [checked, setChecked] = useState(initial);
  return (
    <CheckCircle
      checked={checked}
      onToggle={() => setChecked((value) => !value)}
      accessibilityLabel={checked ? "Desmarcar item" : "Concluir item"}
    />
  );
};

export const CirculoDeConcluir: Story = {
  name: "CheckCircle · pendente e concluído",
  render: () => (
    <Frame>
      <View style={styles.row}>
        <InteractiveCheck initial={false} />
        <InteractiveCheck initial />
      </View>
    </Frame>
  ),
};

export const QuadroDeIcone: Story = {
  name: "IconTile · ícones de rotina",
  render: () => (
    <Frame>
      <View style={styles.row}>
        {(["track_changes", "menu_book", "calculate", "translate", "science", "code", "music_note"] as const).map((icon) => (
          <IconTile key={icon} icon={icon} />
        ))}
      </View>
    </Frame>
  ),
};

export const Cabecalho: Story = {
  name: "ScreenHeader · voltar e fechar",
  render: () => (
    <Frame>
      <ScreenHeader title="Matemática" backLabel="Voltar para Rotinas" onBack={fn()} />
      <ScreenHeader title="Nova tarefa" variant="close" backLabel="Fechar sem criar" onBack={fn()} />
    </Frame>
  ),
};

const styles = StyleSheet.create({
  frame: { flex: 1, gap: theme.space.lg, padding: theme.space.md, backgroundColor: theme.color.surface },
  row: { flexDirection: "row", flexWrap: "wrap", gap: theme.space.sm },
});
