import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { themes } from "../theme/tokens";
import { MaterialSymbol } from "./material-symbol";
import { PrimaryButton } from "./primary-button";

const theme = themes.cosmic;

export type SuccessDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  actionLabel: string;
  /** Chamado pela ação principal, pelo ✕ e pelo voltar do sistema. */
  onClose: () => void;
};

/** Variante de sucesso do Modal do ODS (ex.: "Tarefa criada!", protótipo 2.2). */
export const SuccessDialog = ({ visible, title, message, actionLabel, onClose }: SuccessDialogProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
    <View style={styles.scrim}>
      <View accessibilityViewIsModal aria-modal style={styles.surface}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          onPress={onClose}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <MaterialSymbol name="close" color={theme.color["on-surface"]} size={theme.navbar.iconSize} />
        </Pressable>
        <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.icon}>
          <MaterialSymbol name="check" color={theme.color.success} size={theme.size.dialogIcon / 2} />
        </View>
        <View style={styles.texts}>
          <Text accessibilityRole="header" allowFontScaling style={styles.title}>
            {title}
          </Text>
          <Text allowFontScaling style={styles.message}>
            {message}
          </Text>
        </View>
        <PrimaryButton theme={theme} label={actionLabel} onPress={onClose} />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: theme.color.scrim, justifyContent: "center", padding: theme.space.lg },
  surface: {
    width: "100%",
    gap: theme.space.md,
    padding: theme.space.lg,
    paddingTop: theme.space.sm,
    borderRadius: theme.sheet.radius,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color["border-subtle"],
    backgroundColor: theme.color["surface-variant"],
    boxShadow: theme.shadow.modal,
  },
  close: {
    alignSelf: "flex-end",
    width: theme.target.minSize,
    height: theme.target.minSize,
    marginRight: -theme.space.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
  },
  icon: {
    alignSelf: "center",
    width: theme.size.dialogIcon,
    height: theme.size.dialogIcon,
    borderRadius: theme.size.dialogIcon / 2,
    borderWidth: theme.focus.ringWidth,
    borderColor: theme.color.success,
    backgroundColor: theme.color["action-subtle"],
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { gap: theme.primitive["space-4"] },
  title: { ...theme.font.title, color: theme.color["on-surface"], textAlign: "center" },
  message: { ...theme.font.body, color: theme.color["on-surface-variant"], textAlign: "center" },
  pressed: { opacity: theme.motion.opacityPressed, transform: [{ scale: theme.motion.scalePressed }] },
});
