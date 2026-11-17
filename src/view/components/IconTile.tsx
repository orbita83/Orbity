import { StyleSheet, View } from "react-native";
import { cosmicBorders, cosmicColors, themes } from "../theme/tokens";
import { MaterialSymbol, type MaterialSymbolName } from "./MaterialSymbol";

const theme = themes.cosmic;

export type IconTileProps = {
  icon: MaterialSymbolName;
};

/** Quadro decorativo com o ícone de um item (ex.: o ícone escolhido para uma rotina). */
export const IconTile = ({ icon }: IconTileProps) => (
  <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.tile}>
    <MaterialSymbol name={icon} filled color={cosmicColors.focus} size={theme.size.iconLg} />
  </View>
);

const styles = StyleSheet.create({
  tile: {
    width: theme.achievement.size,
    height: theme.achievement.size,
    borderRadius: theme.achievement.radius,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: theme.color["action-subtle"],
    alignItems: "center",
    justifyContent: "center",
  },
});
