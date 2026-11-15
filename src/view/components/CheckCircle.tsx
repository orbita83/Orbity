import { Pressable, StyleSheet, View } from "react-native";
import { themes } from "../theme/tokens";
import { MaterialSymbol } from "./material-symbol";

const theme = themes.cosmic;

export type CheckCircleProps = {
  checked: boolean;
  onToggle: () => void;
  /** Nome lido pelo leitor de tela, com a ação e o item (ex.: "Concluir tarefa Revisar SOLID"). */
  accessibilityLabel: string;
  disabled?: boolean;
};

/** Círculo de concluir das listas de Tarefas e Rotinas: 24 dp visíveis dentro de um alvo de 48 dp. */
export const CheckCircle = ({ checked, onToggle, accessibilityLabel, disabled = false }: CheckCircleProps) => (
  <Pressable
    accessibilityRole="checkbox"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ checked, disabled }}
    aria-checked={checked}
    disabled={disabled}
    onPress={onToggle}
    style={({ pressed }) => [styles.target, pressed && styles.pressed]}
  >
    <View style={[styles.circle, checked && styles.checked]}>
      {checked ? <MaterialSymbol name="check" color={theme.color["on-action"]} size={theme.space.md} /> : null}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  target: {
    width: theme.target.minSize,
    height: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
  },
  pressed: { opacity: theme.motion.opacityPressed, transform: [{ scale: theme.motion.scalePressed }] },
  circle: {
    width: theme.navbar.iconSize,
    height: theme.navbar.iconSize,
    borderRadius: theme.navbar.iconSize / 2,
    borderWidth: theme.focus.ringWidth,
    borderColor: theme.color.action,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: { backgroundColor: theme.color.action },
});
