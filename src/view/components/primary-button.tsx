import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { themes, type OrbityTheme } from "../theme/tokens";
import { useReduceMotion } from "../theme/use-reduce-motion";

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
  disabled?: boolean;
  theme?: OrbityTheme;
  /** Ícone decorativo antes do rótulo (ex.: play no Iniciar foco). */
  icon?: ReactNode;
};

export const PrimaryButton = ({
  label,
  onPress,
  accessibilityHint,
  disabled = false,
  theme = themes.light,
  icon,
}: PrimaryButtonProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const reduceMotion = useReduceMotion();
  const styles = createStyles(theme, isFocused, disabled);

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
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          pressed && !reduceMotion && styles.buttonPressedScale,
        ]}
      >
        <View style={styles.content}>
          {icon}
          <Text allowFontScaling style={styles.label}>
            {label}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const createStyles = (theme: OrbityTheme, isFocused: boolean, disabled: boolean) =>
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
      backgroundColor: disabled ? theme.button.bgDisabled : theme.button.bg,
      borderRadius: theme.button.radius,
      justifyContent: "center",
      minHeight: theme.button.minHeight,
      minWidth: theme.button.minWidth,
      paddingHorizontal: theme.space.md,
      paddingVertical: theme.space.sm,
      boxShadow: theme.button.shadow,
    },
    // 1.2: o pressionado usa escala e opacidade, sem cor nova.
    buttonPressed: {
      opacity: theme.button.opacityPressed,
    },
    buttonPressedScale: {
      transform: [{ scale: theme.button.scalePressed }],
    },
    content: {
      alignItems: "center",
      flexDirection: "row",
      gap: theme.space.sm,
      justifyContent: "center",
    },
    label: {
      ...theme.font.label,
      color: disabled ? theme.button.labelDisabled : theme.button.label,
      textAlign: "center",
    },
  });
