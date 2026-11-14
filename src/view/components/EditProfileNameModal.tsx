import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialSymbol } from "./material-symbol";
import { themes, type OrbityTheme } from "../theme/tokens";

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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isCancelFocused, setIsCancelFocused] = useState(false);
  const [isSaveFocused, setIsSaveFocused] = useState(false);
  const [isCloseFocused, setIsCloseFocused] = useState(false);

  const characterCount = name.length;
  const maxCharacters = 60;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <KeyboardAvoidingView
        style={styles.camadaSobreposicao}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.panoFundo}
          onPress={saving ? undefined : onClose}
          accessible={false}
          aria-hidden={true}
        />

        <View
          style={[
            styles.cartaoDialogo,
            {
              backgroundColor:
                theme.componentOverrides?.cardSurface ??
                theme.color["surface-variant"],
              borderRadius: theme.radius.lg,
              padding: theme.space.lg,
              gap: theme.space.md,
            },
          ]}
          aria-modal={true}
          accessibilityLabel="Editar nome do perfil"
        >
          {/* Cabeçalho do Modal */}
          <View style={styles.linhaCabecalho}>
            <Text
              style={[
                styles.tituloModal,
                {
                  color: theme.color["on-surface"],
                  fontSize: theme.font.title.fontSize,
                  fontWeight: theme.font.title.fontWeight,
                  lineHeight: theme.font.title.lineHeight,
                },
              ]}
              accessibilityRole="header"
            >
              Editar nome
            </Text>

            <Pressable
              onPress={saving ? undefined : onClose}
              onFocus={() => setIsCloseFocused(true)}
              onBlur={() => setIsCloseFocused(false)}
              disabled={saving}
              style={({ pressed }) => [
                styles.botaoFechar,
                {
                  width: theme.target.minSize,
                  height: theme.target.minSize,
                  borderRadius: theme.radius.md,
                },
                pressed && { opacity: 0.7 },
                isCloseFocused && {
                  borderWidth: theme.focus.ringWidth,
                  borderColor: theme.color.focus,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Fechar modal de edição"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialSymbol
                name="close"
                size={24}
                color={theme.color["on-surface-variant"]}
              />
            </Pressable>
          </View>

          {/* Campo de Entrada */}
          <View style={styles.secaoFormulario}>
            <Text
              style={[
                styles.rotuloCampo,
                {
                  color: theme.color["on-surface-variant"],
                  fontSize: theme.font.label.fontSize,
                  fontWeight: theme.font.label.fontWeight,
                  lineHeight: theme.font.label.lineHeight,
                },
              ]}
              nativeID="label-nome-estudante"
            >
              Nome do estudante
            </Text>

            <TextInput
              style={[
                styles.campoTexto,
                {
                  backgroundColor: theme.color.surface,
                  color: theme.color["on-surface"],
                  borderRadius: theme.radius.md,
                  paddingHorizontal: theme.space.md,
                  fontSize: theme.font.body.fontSize,
                  lineHeight: theme.font.body.lineHeight,
                  borderColor: validationError
                    ? theme.color.error
                    : isInputFocused
                      ? theme.color.focus
                      : theme.color.border,
                  borderWidth: validationError || isInputFocused ? 2 : 1,
                },
              ]}
              value={name}
              onChangeText={onChangeName}
              placeholder="Digite seu nome"
              placeholderTextColor={theme.color["on-surface-variant"]}
              maxLength={maxCharacters}
              autoFocus={true}
              editable={!saving}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              accessibilityLabel="Nome do estudante"
              accessibilityRole="none"
              aria-labelledby="label-nome-estudante"
            />

            {/* Linha de apoio: erro de validação e contador de caracteres */}
            <View style={styles.linhaApoio}>
              <View style={styles.areaErro}>
                {validationError ? (
                  <Text
                    style={[
                      styles.textoErro,
                      {
                        color: theme.color.error,
                        fontSize: theme.font.label.fontSize,
                        lineHeight: theme.font.label.lineHeight,
                      },
                    ]}
                    accessibilityLiveRegion="polite"
                    accessibilityRole="alert"
                  >
                    {validationError}
                  </Text>
                ) : null}
              </View>

              <Text
                style={[
                  styles.contadorCaracteres,
                  {
                    color: theme.color["on-surface-variant"],
                    fontSize: theme.font.label.fontSize,
                    lineHeight: theme.font.label.lineHeight,
                  },
                ]}
              >
                {characterCount}/{maxCharacters}
              </Text>
            </View>
          </View>

          {/* Botões de Ação */}
          <View style={styles.linhaAcoes}>
            <Pressable
              onPress={onClose}
              onFocus={() => setIsCancelFocused(true)}
              onBlur={() => setIsCancelFocused(false)}
              disabled={saving}
              style={({ pressed }) => [
                styles.botaoCancelar,
                {
                  minHeight: theme.target.minSize,
                  borderRadius: theme.radius.md,
                  borderColor: theme.color.border,
                  borderWidth: 1,
                  paddingHorizontal: theme.space.md,
                },
                pressed && { opacity: 0.75 },
                isCancelFocused && {
                  borderWidth: theme.focus.ringWidth,
                  borderColor: theme.color.focus,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancelar edição do nome"
            >
              <Text
                style={[
                  styles.textoBotaoCancelar,
                  {
                    color: theme.color["on-surface"],
                    fontSize: theme.font.label.fontSize,
                    fontWeight: "600",
                  },
                ]}
              >
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              onPress={onSave}
              onFocus={() => setIsSaveFocused(true)}
              onBlur={() => setIsSaveFocused(false)}
              disabled={saving}
              style={({ pressed }) => [
                styles.botaoSalvar,
                {
                  backgroundColor: theme.color.action,
                  minHeight: theme.target.minSize,
                  borderRadius: theme.radius.md,
                  paddingHorizontal: theme.space.lg,
                },
                (pressed || saving) && { opacity: 0.8 },
                isSaveFocused && {
                  borderWidth: theme.focus.ringWidth,
                  borderColor: theme.color.focus,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Salvar novo nome"
              accessibilityState={{ busy: saving, disabled: saving }}
            >
              <Text
                style={[
                  styles.textoBotaoSalvar,
                  {
                    color: theme.color["on-action"],
                    fontSize: theme.font.label.fontSize,
                    fontWeight: "600",
                  },
                ]}
              >
                {saving ? "Salvando..." : "Salvar"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  camadaSobreposicao: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  panoFundo: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  cartaoDialogo: {
    width: "100%",
    maxWidth: 440,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  linhaCabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tituloModal: {
    letterSpacing: -0.2,
  },
  botaoFechar: {
    alignItems: "center",
    justifyContent: "center",
  },
  secaoFormulario: {
    gap: 8,
  },
  rotuloCampo: {
    letterSpacing: 0.1,
  },
  campoTexto: {
    height: 56,
  },
  linhaApoio: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    minHeight: 20,
  },
  areaErro: {
    flex: 1,
    paddingRight: 8,
  },
  textoErro: {
    fontWeight: "500",
  },
  contadorCaracteres: {
    textAlign: "right",
  },
  linhaAcoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  botaoCancelar: {
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotaoCancelar: {
    textAlign: "center",
  },
  botaoSalvar: {
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotaoSalvar: {
    textAlign: "center",
  },
});
