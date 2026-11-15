import { Pressable, StyleSheet, Text, View } from "react-native";
import { cosmicBorders, themes } from "../theme/tokens";

const theme = themes.cosmic;

export type SnackbarProps = {
  message: string;
  /** Ação opcional, como "Desfazer". */
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Aviso curto depois de uma ação (snackbar.md), anunciado de forma educada pelo leitor de tela.
 * Quem usa decide onde posicionar e quando esconder; o tempo de exibição fica na ViewModel.
 */
export const Snackbar = ({ message, actionLabel, onAction }: SnackbarProps) => (
  <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.bar}>
    <Text allowFontScaling style={styles.message}>
      {message}
    </Text>
    {actionLabel && onAction ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        onPress={onAction}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Text allowFontScaling style={styles.actionLabel}>
          {actionLabel}
        </Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  bar: {
    minHeight: theme.target.minSize,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    paddingLeft: theme.space.md,
    paddingRight: theme.primitive["space-4"],
    paddingVertical: theme.primitive["space-4"],
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: theme.color["surface-variant"],
    boxShadow: theme.shadow.modal,
  },
  message: { ...theme.font["body-sm"], color: theme.color["on-surface"], flex: 1 },
  action: {
    minWidth: theme.target.minSize,
    minHeight: theme.target.minSize,
    paddingHorizontal: theme.space.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
  },
  actionLabel: { ...theme.font.label, color: theme.color.focus },
  pressed: { opacity: theme.motion.opacityPressed, transform: [{ scale: theme.motion.scalePressed }] },
});
