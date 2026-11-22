import { StyleSheet, Text, View } from "react-native";
import { themes, type OrbityTheme } from "../theme/tokens";
import { MaterialSymbol, type MaterialSymbolName } from "./MaterialSymbol";

export type CategoryTagProps = {
  /** Rótulo visível da categoria (ex.: "Programação"). */
  label: string;
  /** Ícone do Material Symbols que acompanha o rótulo; a tag nunca depende só da cor. */
  symbol: MaterialSymbolName;
  theme?: OrbityTheme;
};

/**
 * Tag informativa de categoria de estudo (tag-categoria.md). Não é interativa: não recebe toque
 * nem foco, e o leitor de tela anuncia "Categoria: <rótulo>".
 */
export const CategoryTag = ({ label, symbol, theme = themes.cosmic }: CategoryTagProps) => {
  const styles = createStyles(theme);

  return (
    <View accessible accessibilityRole="text" accessibilityLabel={`Categoria: ${label}`} style={styles.tag}>
      <MaterialSymbol name={symbol} filled color={theme.color["on-surface"]} size={theme.space.md} />
      <Text allowFontScaling style={styles.label}>
        {label}
      </Text>
    </View>
  );
};

const createStyles = (theme: OrbityTheme) =>
  StyleSheet.create({
    tag: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: theme.color["action-subtle"],
      borderRadius: theme.radius.md,
      flexDirection: "row",
      flexShrink: 1,
      gap: theme.primitive["space-4"],
      paddingHorizontal: theme.space.sm,
      paddingVertical: theme.primitive["space-4"],
    },
    label: {
      ...theme.font.label,
      color: theme.color["on-surface"],
      flexShrink: 1,
    },
  });
