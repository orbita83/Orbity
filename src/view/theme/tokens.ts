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
    motion: {
      duration: {
        short: 100,
        medium: 300,
      },
      easing: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
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
      opacityDisabled: 0.6,
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

// Direção visual da tela inicial: design-system/07-home-cosmica.md.
// Independente dos temas de componentes existentes para preservar suas variantes.
export const cosmicTokens = {
  color: {
    background: "#030417",
    desktop: "#07081F",
    sheet: "#0D0D29",
    sheetEnd: "#08091D",
    card: "#141332",
    cardEnd: "#0D0E26",
    cardBorder: "#232044",
    sheetBorder: "#373064",
    text: "#FAF9FF",
    muted: "#BBB6E3",
    inactive: "#9990CB",
    icon: "#A56AF4",
    active: "#A16AFF",
    action: "#7137F5",
    actionEnd: "#703BF6",
    actionHover: "#8252FC",
    actionPressed: "#6028DD",
    focus: "#D4A3FF",
    track: "#232052",
    progress: "#8A42FA",
    progressEnd: "#713BF5",
    handle: "#49408C",
    badgeBorder: "#46328D",
    lockedBorder: "#2B2654",
    lockedIcon: "#8C7BCB",
    unlocked: "#C47EFF",
    flame: "#FFB52E",
    flameCore: "#FFE48A",
    scrim: "rgba(1, 2, 15, 0.78)",
    transparent: "transparent",
    toast: "#211A45",
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 32 },
  radius: { button: 15, card: 18, sheet: 32, phone: 38, pill: 999 },
  border: { subtle: 1, sheet: 2, focus: 2 },
  layout: {
    maxWidth: 430,
    maxHeight: 932,
    desktopBreakpoint: 600,
    desktopInset: 24,
    statusHeight: 44,
    headerHeight: 64,
    compactHeaderHeight: 48,
    navHeight: 80,
    intermediateTop: 0.44,
    intermediateArtworkOffset: -0.13,
    expandedArtworkOffset: -0.23,
    planetLabelTop: 0.465,
    artworkAspectRatio: 0.5,
    handleWidth: 48,
    handleHeight: 6,
    handleTargetHeight: 24,
    buttonHeight: 48,
    iconSize: 26,
    featureIconSize: 30,
    achievementSize: 56,
    achievementIconSize: 32,
    progressHeight: 17,
    touchTarget: 48,
    dialogMaxWidth: 370,
  },
  font: {
    brand: { fontSize: 28, lineHeight: 36, fontWeight: "700", letterSpacing: -0.7 },
    streak: { fontSize: 56, lineHeight: 64, fontWeight: "700", letterSpacing: -2 },
    streakLabel: { fontSize: 15, lineHeight: 22, fontWeight: "400" },
    title: { fontSize: 15, lineHeight: 20, fontWeight: "500" },
    body: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
    button: { fontSize: 16, lineHeight: 24, fontWeight: "500" },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
    tab: { fontSize: 11, lineHeight: 16, fontWeight: "400" },
    status: { fontSize: 16, lineHeight: 22, fontWeight: "500" },
  } satisfies Record<string, TextStyle>,
  motion: { sheetDuration: 380, feedbackDuration: 160, pressedOpacity: 0.8, disabledOpacity: 0.5 },
  planet: {
    aspectRatio: 0.85,
    starCount: 80,
    color: {
      highlight: "#EBACFF",
      light: "#BD6AFF",
      surface: "#8840E9",
      continent: "#5320B2",
      shade: "#39149A",
      night: "#17075B",
      rim: "#D08BFF",
      ring: "#A95BFA",
      ringHighlight: "#E8B5FF",
      glow: "#8236D9",
    },
  },
  sheetGesture: {
    activationDistance: 10,
    commitDistance: 48,
    velocityThreshold: 0.55,
    projectionDuration: 160,
  },
} as const;
