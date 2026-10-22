import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialSymbol, type MaterialSymbolName } from "./material-symbol";
import { cosmicTokens as t, themes, type OrbityTheme } from "../theme/tokens";
import { GradientSurface } from "./gradient-surface";
import { CosmicIcon } from "./cosmic-icon";

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  iconName?: MaterialSymbolName;
  accessibilityHint?: string;
  disabled?: boolean;
  theme?: OrbityTheme;
  appearance?: "default" | "cosmic";
};

export const PrimaryButton = ({
  label,
  onPress,
  iconName,
  accessibilityHint,
  disabled = false,
  theme = themes.light,
  appearance = "default",
}: PrimaryButtonProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cosmic = appearance === "cosmic";
  const styles = cosmic ? createCosmicStyles(isFocused) : createStyles(theme, isFocused);

  return (
    <View style={styles.focusContainer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }) => [
          styles.button,
          pressed && !disabled && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
      >
        {cosmic ? <GradientSurface from={hovered && !disabled ? t.color.actionHover : t.color.action} to={t.color.actionEnd} horizontal /> : null}
        {cosmic && iconName === "play_arrow" ? <CosmicIcon name="play" color={t.color.text} size={20} /> : iconName ? (
          <MaterialSymbol
            name={iconName}
            filled
            color={theme.button.label}
            size={theme.primitive["space-24"]}
          />
        ) : null}
        <Text allowFontScaling style={styles.label}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
};

const createStyles = (theme: OrbityTheme, isFocused: boolean) =>
  StyleSheet.create({
    focusContainer: {
      borderColor: theme.button.focusColor,
      borderRadius:
        theme.button.radius +
        theme.button.focusOffset +
        theme.button.focusWidth,
      borderWidth: isFocused ? theme.button.focusWidth : 0,
      padding: isFocused
        ? theme.button.focusOffset
        : theme.button.focusOffset + theme.button.focusWidth,
    },
    button: {
      alignItems: "center",
      backgroundColor: theme.button.bg,
      borderRadius: theme.button.radius,
      flexDirection: "row",
      gap: theme.space.sm,
      justifyContent: "center",
      minHeight: theme.button.minHeight,
      minWidth: theme.button.minWidth,
      paddingHorizontal: theme.space.md,
      paddingVertical: theme.space.sm,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    buttonDisabled: {
      opacity: theme.button.opacityDisabled,
    },
    label: {
      ...theme.font.label,
      color: theme.button.label,
      textAlign: "center",
    },
  });

const createCosmicStyles = (focused: boolean) => StyleSheet.create({
  focusContainer: { borderRadius: t.radius.button + t.border.focus, borderColor: focused ? t.color.focus : t.color.transparent, borderWidth: t.border.focus },
  button: { alignItems: "center", borderRadius: t.radius.button, flexDirection: "row", gap: t.space.sm, justifyContent: "center", minHeight: t.layout.buttonHeight, paddingHorizontal: t.space.lg, paddingVertical: t.space.md, backgroundColor: t.color.action, overflow: "hidden" },
  buttonPressed: { opacity: t.motion.pressedOpacity },
  buttonDisabled: { opacity: t.motion.disabledOpacity },
  label: { ...t.font.button, color: t.color.text, flexShrink: 1, textAlign: "center" },
});
