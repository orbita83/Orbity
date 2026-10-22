import { Platform, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export type MaterialSymbolName =
  | "home"
  | "check_circle"
  | "description"
  | "assignment"
  | "autorenew"
  | "auto_awesome"
  | "person"
  | "add";

export type MaterialSymbolProps = {
  name: MaterialSymbolName;
  filled?: boolean;
  color: string;
  size?: number;
};

// Coordenadas SVG oficiais do Material Symbols (grade 24x24 dp)
const SYMBOL_PATHS: Record<
  MaterialSymbolName,
  { outlined: string; filled: string }
> = {
  home: {
    outlined:
      "M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z",
    filled: "M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z",
  },
  description: {
    outlined:
      "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 16h8v2H8v-2zm0-4h8v2H8v-2z",
    filled:
      "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  },
  assignment: {
    outlined:
      "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v3h10V5h2v14zm-5-3H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    filled:
      "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  },
  check_circle: {
    outlined:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z",
    filled:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  },
  autorenew: {
    outlined:
      "M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z",
    filled:
      "M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z",
  },
  auto_awesome: {
    outlined:
      "M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM9 16.17L7.93 13.8 5.56 12.73l2.37-1.08L9 9.28l1.07 2.37 2.37 1.07-2.37 1.08L9 16.17zm10 2.33l-1.25 2.75L15 22.5l2.75 1.25L19 26.5l1.25-2.75L23 22.5l-2.75-1.25L19 18.5z",
    filled:
      "M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zm7.5 8.5l-1.25 2.75L15 22l2.75 1.25L19 26l1.25-2.75L23 22l-2.75-1.25L19 18z",
  },
  person: {
    outlined:
      "M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    filled:
      "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  },
  add: {
    outlined: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    filled: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  },
};

export const MaterialSymbol = ({
  name,
  filled = false,
  color,
  size = 24,
}: MaterialSymbolProps) => {
  const pathData = filled
    ? SYMBOL_PATHS[name]?.filled ?? SYMBOL_PATHS[name]?.outlined
    : SYMBOL_PATHS[name]?.outlined;

  if (Platform.OS === "web") {
    return (
      <View
        accessible={false}
        aria-hidden={true}
        style={[styles.container, { width: size, height: size }]}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={color}
          style={{ display: "block" }}
        >
          <path d={pathData} />
        </svg>
      </View>
    );
  }

  // Renderização nativa no Android e iOS via react-native-svg
  return (
    <View
      accessible={false}
      style={[styles.container, { width: size, height: size }]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={pathData} fill={color} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
