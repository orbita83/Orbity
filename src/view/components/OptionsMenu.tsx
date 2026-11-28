import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { cosmicBorders, themes } from "../theme/tokens";
import { MaterialSymbol, type MaterialSymbolName } from "./MaterialSymbol";

const theme = themes.cosmic;

/** Largura do menu (menu-opcoes.md, 200 dp). */
const MENU_WIDTH = theme.target.minSize * 4 + theme.space.sm;

export type OptionsMenuAnchor = { x: number; y: number; width: number; height: number };

export type OptionsMenuItem = {
  id: string;
  label: string;
  icon: MaterialSymbolName;
  onPress: () => void;
  /** Ação destrutiva: vem depois de um divisor, com o ícone em color.error. */
  destructive?: boolean;
};

export type OptionsMenuProps = {
  visible: boolean;
  /** Posição do "•••" na janela; o menu abre logo abaixo, alinhado à direita. Sem posição
   * (leitor de tela, teclado), abre no alto, à direita. */
  anchor: OptionsMenuAnchor | null;
  /** Nome do menu para o leitor de tela (ex.: "Opções da tarefa: Estudar PDM"). */
  accessibilityLabel: string;
  items: readonly OptionsMenuItem[];
  onClose: () => void;
};

/** Menu de opções ancorado ao "•••" (menu-opcoes.md, adaptado do Menu do Material 3). */
export const OptionsMenu = ({ visible, anchor, accessibilityLabel, items, onClose }: OptionsMenuProps) => {
  const window = useWindowDimensions();
  const regular = items.filter((item) => !item.destructive);
  const destructive = items.filter((item) => item.destructive);
  const itemsHeight = items.length * theme.target.minSize + theme.space.md * 2;
  const below = anchor ? anchor.y + anchor.height : 0;
  // Abre abaixo do "•••"; se não couber, abre acima.
  const top = anchor
    ? below + itemsHeight > window.height
      ? Math.max(theme.space.md, anchor.y - itemsHeight)
      : below
    : theme.size.headerHeight * 2;
  const right = anchor ? Math.max(theme.space.md, window.width - (anchor.x + anchor.width)) : theme.space.md;

  const renderItem = (item: OptionsMenuItem) => (
    <Pressable
      key={item.id}
      accessibilityRole="menuitem"
      accessibilityLabel={item.label}
      onPress={() => {
        onClose();
        item.onPress();
      }}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <MaterialSymbol
        name={item.icon}
        color={item.destructive ? theme.color.error : theme.color["on-surface-variant"]}
        size={theme.navbar.iconSize}
      />
      <Text allowFontScaling style={styles.label}>
        {item.label}
      </Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar menu" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View accessibilityRole="menu" accessibilityLabel={accessibilityLabel} style={[styles.menu, { top, right }]}>
        {regular.map(renderItem)}
        {regular.length > 0 && destructive.length > 0 ? <View style={styles.divider} /> : null}
        {destructive.map(renderItem)}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    width: MENU_WIDTH,
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: theme.color["surface-variant"],
    boxShadow: theme.shadow.barTop,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    minHeight: theme.target.minSize,
    paddingHorizontal: theme.space.md,
  },
  label: { ...theme.font.body, color: theme.color["on-surface"], flex: 1 },
  divider: { height: theme.divider.width, marginVertical: theme.space.sm, backgroundColor: theme.color["border-subtle"] },
  pressed: { opacity: theme.motion.opacityPressed },
});
