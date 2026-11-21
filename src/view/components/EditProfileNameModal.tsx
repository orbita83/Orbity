import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialSymbol } from "./MaterialSymbol";
import { PrimaryButton } from "./PrimaryButton";
import { TextField } from "./TextField";
import { cosmicBorders, themes, type OrbityTheme } from "../theme/tokens";

/** Limite do nome do estudante, o mesmo validado pelo caso de uso. */
const MAX_NAME_LENGTH = 60;

export type EditProfileNameModalProps = {
  readonly visible: boolean;
  readonly name: string;
  readonly saving?: boolean;
  readonly validationError?: string | null;
  readonly onChangeName: (name: string) => void;
  readonly onSave: () => void;
  readonly onClose: () => void;
  readonly theme?: OrbityTheme;
};

/**
 * Edição do nome (protótipo, tela 5.1), na superfície do Modal do ODS (modal.md): véu, raio de painel,
 * ✕ visível e ações empilhadas, com Salvar em destaque e Cancelar secundário.
 */
export const EditProfileNameModal = ({
  visible,
  name,
  saving = false,
  validationError = null,
  onChangeName,
  onSave,
  onClose,
  theme = themes.cosmic,
}: EditProfileNameModalProps) => {
  const styles = createStyles(theme);
  const close = saving ? () => undefined : onClose;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.scrim} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View accessibilityViewIsModal aria-modal style={styles.surface}>
          <View style={styles.header}>
            <Text accessibilityRole="header" allowFontScaling style={styles.title}>
              Editar nome
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar modal de edição"
              accessibilityHint="Fecha sem salvar"
              disabled={saving}
              onPress={onClose}
              style={({ pressed }) => [styles.close, pressed && styles.pressed]}
            >
              <MaterialSymbol name="close" color={theme.color["on-surface"]} size={theme.navbar.iconSize} />
            </Pressable>
          </View>

          <View style={styles.field}>
            <TextField
              label="Nome do estudante"
              requirement="required"
              value={name}
              onChangeText={(value) => onChangeName(value.slice(0, MAX_NAME_LENGTH))}
              placeholder="Digite seu nome"
              helper="Como você quer ser chamado no Orbity."
              error={validationError}
              onSubmitEditing={saving ? undefined : onSave}
            />
            <Text allowFontScaling accessibilityLiveRegion="polite" style={styles.counter}>
              {name.length}/{MAX_NAME_LENGTH}
            </Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              theme={theme}
              label={saving ? "Salvando..." : "Salvar"}
              accessibilityHint="Salva o novo nome do perfil"
              disabled={saving}
              busy={saving}
              onPress={onSave}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar edição do nome"
              disabled={saving}
              onPress={onClose}
              style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
            >
              <Text allowFontScaling style={styles.secondaryLabel}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (theme: OrbityTheme) =>
  StyleSheet.create({
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
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.space.sm },
    title: { ...theme.font.title, color: theme.color["on-surface"], paddingTop: theme.space.sm, flex: 1 },
    close: {
      width: theme.target.minSize,
      height: theme.target.minSize,
      marginRight: -theme.space.sm,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
    },
    field: { gap: theme.primitive["space-4"] },
    counter: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"], textAlign: "right" },
    actions: { gap: theme.space.sm },
    secondary: {
      minHeight: theme.target.minSize,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.space.md,
      borderRadius: theme.radius.md,
      borderWidth: theme.border.widthThin,
      borderColor: cosmicBorders.sheet,
    },
    secondaryLabel: { ...theme.font.label, color: theme.color["on-surface"] },
    pressed: { opacity: theme.motion.opacityPressed, transform: [{ scale: theme.motion.scalePressed }] },
  });
