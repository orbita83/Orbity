import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { cosmicColors, themes } from "../theme/tokens";
import { MaterialSymbol, type MaterialSymbolName } from "./MaterialSymbol";

const theme = themes.cosmic;
/** Linhas visíveis do campo de várias linhas antes de rolar. */
const MULTILINE_ROWS = 3;

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Marca o rótulo com "(obrigatório)" ou "(opcional)". */
  requirement?: "required" | "optional";
  /** Mensagem de erro; quando presente, aparece com ícone e o valor digitado é mantido. */
  error?: string | null;
  helper?: string;
  multiline?: boolean;
  onSubmitEditing?: () => void;
  keyboardType?: TextInputProps["keyboardType"];
  maxLength?: TextInputProps["maxLength"];
  testID?: string;
  /** Botão acessório à direita do campo (ex.: abrir seletor de data/hora sem impedir digitação). */
  trailingIcon?: MaterialSymbolName;
  trailingLabel?: string;
  onTrailingPress?: () => void;
};

const REQUIREMENT_LABEL = { required: "(obrigatório)", optional: "(opcional)" } as const;

/** Campo de texto do ODS (campos-formulario.md): rótulo visível, foco de 2 dp e erro com ícone. */
export const TextField = ({
  label,
  value,
  onChangeText,
  placeholder,
  requirement,
  error,
  helper,
  multiline = false,
  onSubmitEditing,
  keyboardType,
  maxLength,
  testID,
  trailingIcon,
  trailingLabel,
  onTrailingPress,
}: TextFieldProps) => {
  const [focused, setFocused] = useState(false);
  const accessibleLabel = requirement ? `${label}, ${REQUIREMENT_LABEL[requirement]}` : label;
  const hasTrailing = Boolean(trailingIcon && onTrailingPress);

  const inputNode = (
    <TextInput
      testID={testID}
      accessibilityLabel={accessibleLabel}
      accessibilityHint={error ?? helper}
      aria-invalid={Boolean(error)}
      allowFontScaling
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={cosmicColors.inactive}
      multiline={multiline}
      numberOfLines={multiline ? MULTILINE_ROWS : 1}
      textAlignVertical={multiline ? "top" : "center"}
      onSubmitEditing={onSubmitEditing}
      keyboardType={keyboardType}
      maxLength={maxLength}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        hasTrailing ? styles.fieldInline : styles.field,
        multiline && styles.multiline,
        !hasTrailing && focused && styles.focused,
      ]}
    />
  );

  return (
    <View style={styles.group}>
      <Text allowFontScaling style={styles.label}>
        {label}
        {requirement ? <Text style={styles.requirement}> {REQUIREMENT_LABEL[requirement]}</Text> : null}
      </Text>
      {hasTrailing && trailingIcon ? (
        <View style={[styles.fieldRow, focused && styles.focused]}>
          {inputNode}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={trailingLabel ?? label}
            onPress={onTrailingPress}
            style={({ pressed }) => [styles.trailingButton, pressed && styles.trailingPressed]}
          >
            <MaterialSymbol name={trailingIcon} color={cosmicColors.inactive} size={theme.navbar.iconSize} />
          </Pressable>
        </View>
      ) : (
        inputNode
      )}
      {error ? (
        <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.message}>
          <MaterialSymbol name="error" filled color={theme.color.error} size={theme.navbar.iconSize} />
          <Text allowFontScaling style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text allowFontScaling style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  group: { gap: theme.space.sm },
  label: { ...theme.font.label, color: theme.color["on-surface-variant"] },
  requirement: { color: theme.color["on-surface-variant"] },
  field: {
    ...theme.font.body,
    minHeight: theme.target.minSize,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color["border-subtle"],
    backgroundColor: theme.color["surface-variant"],
    color: theme.color["on-surface"],
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: theme.target.minSize,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color["border-subtle"],
    backgroundColor: theme.color["surface-variant"],
    overflow: "hidden",
  },
  fieldInline: {
    ...theme.font.body,
    flex: 1,
    minWidth: 0,
    minHeight: theme.target.minSize,
    paddingLeft: theme.space.md,
    paddingRight: theme.primitive["space-4"],
    paddingVertical: theme.space.sm,
    color: theme.color["on-surface"],
  },
  trailingButton: {
    width: theme.target.minSize,
    height: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
  },
  trailingPressed: { opacity: theme.motion.opacityPressed },
  multiline: { minHeight: theme.font.body.lineHeight * MULTILINE_ROWS + theme.space.md * 2 },
  focused: { borderWidth: theme.focus.ringWidth, borderColor: theme.color.focus },
  message: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
  errorText: { ...theme.font.label, color: theme.color["on-surface"], flex: 1 },
  helper: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"] },
});
