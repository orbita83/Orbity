import type { TextStyle } from "react-native";

// Valores definidos em design-system/02-tokens.md.
export const primitives = {
  "blue-600": "#4F46E5",
  "purple-400": "#C084FC",
  "neutral-0": "#FFFFFF",
  "neutral-900": "#1B1B1F",
  "space-4": 4,
  "space-8": 8,
  "space-16": 16,
  "space-24": 24,
} as const;

export type ThemeMode = "light" | "dark";

const sharedTokens = {
  target: { minSize: 48 },
  focus: { ringWidth: 2, ringOffset: 2 },
  radius: { md: 12, lg: 16 },
  elevation: { card: 2 },
} as const;

function createTheme(mode: ThemeMode) {
  const dark = mode === "dark";
  const color = {
    action: dark ? primitives["purple-400"] : primitives["blue-600"],
    "on-action": dark ? primitives["neutral-900"] : primitives["neutral-0"],
    surface: dark ? primitives["neutral-900"] : primitives["neutral-0"],
    "on-surface": dark ? primitives["neutral-0"] : primitives["neutral-900"],
    focus: dark ? primitives["purple-400"] : primitives["blue-600"],
  };

  return {
    color,
    space: {
      sm: primitives["space-8"],
      md: primitives["space-16"],
      lg: primitives["space-24"],
    },
    target: sharedTokens.target,
    focus: sharedTokens.focus,
    radius: sharedTokens.radius,
    elevation: sharedTokens.elevation,
    primitive: primitives,
    font: {
      body: {
        fontFamily: "Roboto",
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 24,
      } satisfies TextStyle,
      label: {
        fontFamily: "Roboto",
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 20,
      } satisfies TextStyle,
    },
    button: {
      bg: color.action,
      label: color["on-action"],
      radius: sharedTokens.radius.md,
      minHeight: sharedTokens.target.minSize,
      minWidth: sharedTokens.target.minSize,
      focusColor: color.focus,
      focusWidth: sharedTokens.focus.ringWidth,
      focusOffset: sharedTokens.focus.ringOffset,
    },
  };
}

export const themes = {
  light: createTheme("light"),
  dark: createTheme("dark"),
};

export type OrbityTheme = ReturnType<typeof createTheme>;
