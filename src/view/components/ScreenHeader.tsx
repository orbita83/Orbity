import { Pressable, StyleSheet, Text, View } from "react-native";
import { themes } from "../theme/tokens";
import { MaterialSymbol } from "./MaterialSymbol";

const theme = themes.cosmic;

export type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  /** "back" para telas empilhadas (seta) e "close" para formulários que podem ser descartados (✕). */
  variant?: "back" | "close";
  /** Nome do botão no leitor de tela (ex.: "Voltar para Rotinas", "Fechar sem criar"). */
  backLabel: string;
};

/** Cabeçalho das telas que abrem por cima de uma aba: botão de 48 dp e título da tela. */
export const ScreenHeader = ({ title, onBack, variant = "back", backLabel }: ScreenHeaderProps) => (
  <View style={styles.header}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={backLabel}
      onPress={onBack}
      style={({ pressed }) => [styles.back, pressed && styles.pressed]}
    >
      <MaterialSymbol
        name={variant === "close" ? "close" : "arrow_back"}
        color={theme.color["on-surface"]}
        size={theme.navbar.iconSize}
      />
    </Pressable>
    <Text accessibilityRole="header" allowFontScaling numberOfLines={2} style={styles.title}>
      {title}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.primitive["space-4"],
    paddingTop: theme.space.lg,
    paddingBottom: theme.space.sm,
    paddingLeft: theme.primitive["space-4"],
    paddingRight: theme.space.md,
  },
  back: {
    width: theme.target.minSize,
    height: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
  },
  pressed: { opacity: theme.motion.opacityPressed, transform: [{ scale: theme.motion.scalePressed }] },
  title: { ...theme.font.title, color: theme.color["on-surface"], flex: 1 },
});
