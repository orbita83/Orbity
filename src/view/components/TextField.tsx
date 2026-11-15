import { useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { cosmicColors, themes } from "../theme/tokens";
import { MaterialSymbol } from "./material-symbol";

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
  testID?: string;
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
  testID,
}: TextFieldProps) => {
  const [focused, setFocused] = useState(false);
  const accessibleLabel = requirement ? `${label}, ${REQUIREMENT_LABEL[requirement]}` : label;

  return (
    <View style={styles.group}>
      <Text allowFontScaling style={styles.label}>
        {label}
        {requirement ? <Text style={styles.requirement}> {REQUIREMENT_LABEL[requirement]}</Text> : null}
      </Text>
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.field, multiline && styles.multiline, focused && styles.focused]}
      />
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
  multiline: { minHeight: theme.font.body.lineHeight * MULTILINE_ROWS + theme.space.md * 2 },
  focused: { borderWidth: theme.focus.ringWidth, borderColor: theme.color.focus },
  message: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
  errorText: { ...theme.font.label, color: theme.color["on-surface"], flex: 1 },
  helper: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"] },
});
