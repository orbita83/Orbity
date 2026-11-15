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

// Paleta global opt-in da versão 1.1; os temas 1.0 permanecem compatíveis.
export const cosmicColors = {
  background: "#030417",
  card: "#141332",
  sheet: "#0D0D29",
  text: "#FAF9FF",
  muted: "#BBB6E3",
  inactive: "#9990CB",
  action: "#7137F5",
  actionEnd: "#703BF6",
  actionHover: "#8648FA",
  focus: "#D4A3FF",
  track: "#232052",
  progress: "#8A42FA",
  progressEnd: "#8648FA",
} as const;

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

function createTheme(mode: ThemeMode, cosmic = false) {
  const dark = mode === "dark";
  const color = {
    action: cosmic ? cosmicColors.action : dark ? primitives["purple-400"] : primitives["blue-600"],
    "on-action": cosmic ? cosmicColors.text : dark ? primitives["neutral-900"] : primitives["neutral-0"],
    "action-subtle": cosmic ? cosmicColors.track : dark ? primitives["purple-600"] : primitives["purple-200"],
    surface: cosmic ? cosmicColors.background : dark ? primitives["neutral-900"] : primitives["neutral-0"],
    "surface-variant": cosmic ? cosmicColors.card : dark ? primitives["neutral-900"] : primitives["neutral-100"],
    "on-surface": cosmic ? cosmicColors.text : dark ? primitives["neutral-0"] : primitives["neutral-900"],
    "on-surface-variant": cosmic ? cosmicColors.muted : dark ? primitives["neutral-200"] : primitives["neutral-500"],
    border: cosmic ? cosmicColors.focus : dark ? primitives["neutral-500"] : primitives["neutral-200"],
    error: primitives["error-500"],
    success: primitives["success-500"],
    warning: primitives["warning-500"],
    info: primitives["info-500"],
    focus: cosmic ? cosmicColors.focus : dark ? primitives["purple-400"] : primitives["blue-600"],
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
      bg: cosmic ? cosmicColors.sheet : color.surface,
      itemActive: cosmic ? color["on-surface"] : color.action,
      itemInactive: cosmic ? cosmicColors.inactive : color["on-surface"],
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

export type OrbityTheme = ReturnType<typeof createTheme> & {
  componentOverrides?: { cardSurface?: string; checkboxMark?: string; navbarBorder?: string };
};

export const themes: Record<"light" | "dark" | "cosmic", OrbityTheme> = {
  light: createTheme("light"),
  dark: createTheme("dark"),
  cosmic: {
    ...createTheme("dark", true),
    componentOverrides: {
      cardSurface: cosmicColors.card,
      checkboxMark: cosmicColors.text,
      navbarBorder: cosmicColors.focus,
    },
  },
};
