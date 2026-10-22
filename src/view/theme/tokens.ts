import type { TextStyle } from "react-native";

// Valores definidos em design-system/02-tokens.md.
export const primitives = {
  // Cores primitivas
  "blue-600": "#4F46E5",
  "purple-500": "#8B5CF6",
  "purple-600": "#9333EA",
  "purple-400": "#C084FC",
  "purple-200": "#E9D5FF",
  "neutral-0": "#FFFFFF",
  "neutral-100": "#F3F4F6",
  "neutral-200": "#E5E7EB",
  "neutral-500": "#6B7280",
  "neutral-900": "#1B1B1F",
  "success-500": "#22C55E",
  "warning-500": "#F59E0B",
  "error-500": "#EF4444",
  "info-500": "#3B82F6",
  // Espaçamentos primitivos
  "space-4": 4,
  "space-8": 8,
  "space-16": 16,
  "space-24": 24,
  "space-32": 32,
} as const;

export type ThemeMode = "light" | "dark";

export const accessibilityTokens = {
  target: { minSize: 48 },
  focus: { ringWidth: 2, ringOffset: 2 },
} as const;

export const sharedTokens = {
  target: accessibilityTokens.target,
  focus: accessibilityTokens.focus,
  radius: { md: 12, lg: 16 },
  elevation: { card: 2 },
} as const;

function createTheme(mode: ThemeMode) {
  const dark = mode === "dark";
  const color = {
    action: dark ? primitives["purple-400"] : primitives["blue-600"],
    "on-action": dark ? primitives["neutral-900"] : primitives["neutral-0"],
    "action-subtle": dark ? primitives["purple-600"] : primitives["purple-200"],
    surface: dark ? primitives["neutral-900"] : primitives["neutral-0"],
    "surface-variant": dark ? primitives["neutral-900"] : primitives["neutral-100"],
    "on-surface": dark ? primitives["neutral-0"] : primitives["neutral-900"],
    "on-surface-variant": dark ? primitives["neutral-200"] : primitives["neutral-500"],
    border: dark ? primitives["neutral-500"] : primitives["neutral-200"],
    error: primitives["error-500"],
    success: primitives["success-500"],
    warning: primitives["warning-500"],
    info: primitives["info-500"],
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
      title: {
        fontFamily: "Roboto",
        fontSize: 24,
        fontWeight: "700",
        lineHeight: 32,
      } satisfies TextStyle,
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
    navbar: {
      bg: color.surface,
      itemActive: color.action,
      itemInactive: color["on-surface"],
      indicatorBg: color["action-subtle"],
      minHeight: sharedTokens.target.minSize,
      elevation: sharedTokens.elevation.card,
      focusColor: color.focus,
      focusWidth: sharedTokens.focus.ringWidth,
      focusOffset: sharedTokens.focus.ringOffset,
      iconSize: 24,
    },
  };
}

export const themes = {
  light: createTheme("light"),
  dark: createTheme("dark"),
};

export type OrbityTheme = ReturnType<typeof createTheme>;
