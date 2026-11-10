import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { themes, type OrbityTheme } from "../theme/tokens";
import { useReduceMotion } from "../theme/use-reduce-motion";

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
  disabled?: boolean;
  theme?: OrbityTheme;
};

export const PrimaryButton = ({
  label,
  onPress,
  accessibilityHint,
  disabled = false,
  theme = themes.light,
}: PrimaryButtonProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const reduceMotion = useReduceMotion();
  const styles = createStyles(theme, isFocused);

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
    label: {
      ...theme.font.label,
      color: theme.button.label,
      textAlign: "center",
    },
  });
