import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { cosmicBorders, themes } from "../theme/tokens";
import { MaterialSymbol, type MaterialSymbolName } from "./MaterialSymbol";
import { PrimaryButton } from "./PrimaryButton";

const theme = themes.cosmic;

export type ConfirmDialogProps = {
  /** Controla se o diálogo está aberto. */
  visible: boolean;
  /** Título centralizado do diálogo (`font.title`). */
  title: string;
  /** Mensagem explicativa centralizada (`font.body`). */
  message: string;
  /** Ícone central de 96 dp. Em confirmações destrutivas, aparece em `color.error`. */
  icon: MaterialSymbolName;
  /** Rótulo da ação secundária de cancelamento (ex.: "Manter rotina", "Cancelar"). Também é o que o ✕ e o voltar fazem. */
  cancelLabel: string;
  /** Rótulo da ação primária de confirmação (ex.: "Excluir", "Excluir rotina"). Recebe o destaque de `PrimaryButton`. */
  confirmLabel: string;
  /** Callback acionado ao cancelar (botão secundário, ✕ ou gesto de voltar). */
  onCancel: () => void;
  /** Callback acionado ao confirmar explicitamente pela ação primária. */
  onConfirm: () => void;
  /** Conteúdo extra entre o texto e as ações (ex.: aviso de que a sequência não muda). */
  children?: ReactNode;
};

/**
 * Variante "Confirmação" do Modal do ODS (modal.md): véu, superfície com raio de painel, ✕ visível
 * e ações empilhadas. A confirmação usa o estilo primário existente (`PrimaryButton`) e o cancelamento
 * usa o estilo secundário com borda, mantendo o componente reutilizável entre Tarefas, Rotinas e futuras telas.
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
          <PrimaryButton theme={theme} label={confirmLabel} onPress={onConfirm} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            onPress={onCancel}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          >
            <Text allowFontScaling style={styles.secondaryLabel}>
              {cancelLabel}
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
    // Ocupa a largura disponível entre as margens do véu.
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
  secondary: {
    minHeight: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
  },
  secondaryLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  pressed: { opacity: theme.motion.opacityPressed, transform: [{ scale: theme.motion.scalePressed }] },
});
