import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { cosmicBorders, themes } from "../theme/tokens";
import { MaterialSymbol, type MaterialSymbolName } from "./material-symbol";
import { PrimaryButton } from "./primary-button";

const theme = themes.cosmic;

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  /** Ícone central de 96 dp. Em confirmações destrutivas, aparece em `color.error`. */
  icon: MaterialSymbolName;
  /** Ação segura e em destaque (ex.: "Manter rotina"). Também é o que o ✕ e o voltar fazem. */
  cancelLabel: string;
  /** Ação destrutiva, secundária, com ícone em `color.error` e texto claro (ex.: "Excluir rotina"). */
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** Conteúdo extra entre o texto e as ações (ex.: aviso de que a sequência não muda). */
  children?: ReactNode;
};

/**
 * Variante "Confirmação" do Modal do ODS (modal.md): véu, superfície com raio de painel, ✕ visível
 * e ações empilhadas. A ação segura vem primeiro e em destaque, para evitar exclusões por engano.
 */
export const ConfirmDialog = ({
  visible,
  title,
  message,
  icon,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  children,
}: ConfirmDialogProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
    <View style={styles.scrim}>
      <View accessibilityViewIsModal accessibilityRole="alert" aria-modal style={styles.surface}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          onPress={onCancel}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <MaterialSymbol name="close" color={theme.color["on-surface"]} size={theme.navbar.iconSize} />
        </Pressable>
        <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.icon}>
          <MaterialSymbol name={icon} color={theme.color.error} size={theme.size.dialogIcon / 2} />
        </View>
        <View style={styles.texts}>
          <Text accessibilityRole="header" allowFontScaling style={styles.title}>
            {title}
          </Text>
          <Text allowFontScaling style={styles.message}>
            {message}
          </Text>
        </View>
        {children}
        <View style={styles.actions}>
          <PrimaryButton theme={theme} label={cancelLabel} onPress={onCancel} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
            onPress={onConfirm}
            style={({ pressed }) => [styles.destructive, pressed && styles.pressed]}
          >
            <MaterialSymbol name={icon} color={theme.color.error} size={theme.navbar.iconSize} />
            <Text allowFontScaling style={styles.destructiveLabel}>
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: theme.color.scrim,
    justifyContent: "center",
    padding: theme.space.lg,
  },
  surface: {
    // Ocupa a largura entre as margens do véu; sem isso, o Modal da Web encolhe a superfície ao texto.
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
    borderColor: theme.color.error,
    backgroundColor: theme.color["action-subtle"],
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { gap: theme.space.sm },
  title: { ...theme.font.title, color: theme.color["on-surface"], textAlign: "center" },
  message: { ...theme.font.body, color: theme.color["on-surface-variant"], textAlign: "center" },
  actions: { gap: theme.space.sm },
  destructive: {
    minHeight: theme.target.minSize,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space.sm,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
  },
  destructiveLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  pressed: { opacity: theme.motion.opacityPressed, transform: [{ scale: theme.motion.scalePressed }] },
});
