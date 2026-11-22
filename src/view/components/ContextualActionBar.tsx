import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { themes } from "../theme/tokens";
import { MaterialSymbol, type MaterialSymbolName } from "./MaterialSymbol";

const theme = themes.cosmic;

export type ContextualHeaderProps = {
  /** Texto do contador, já no singular ou no plural (ex.: "2 selecionadas"). */
  countLabel: string;
  onCancel: () => void;
};

/** Cabeçalho da seleção múltipla (barra-acoes-contextuais.md): ✕ e contador anunciado. */
export const ContextualHeader = ({ countLabel, onCancel }: ContextualHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cancelar seleção"
        onPress={onCancel}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <MaterialSymbol name="close" color={theme.color["on-surface"]} size={theme.navbar.iconSize} />
      </Pressable>
      <Text accessibilityLiveRegion="polite" allowFontScaling style={styles.count}>
        {countLabel}
      </Text>
    </View>
  );
};

export type ContextualAction = {
  id: string;
  label: string;
  icon: MaterialSymbolName;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

export type ContextualActionBarProps = {
  actions: readonly ContextualAction[];
};

/** Barra inferior da seleção múltipla: ocupa o lugar da navbar, com ícone e rótulo em cada ação. */
export const ContextualActionBar = ({ actions }: ContextualActionBarProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityRole="toolbar" style={[styles.bar, { paddingBottom: insets.bottom + theme.space.sm }]}>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          accessibilityState={{ disabled: Boolean(action.disabled) }}
          disabled={action.disabled}
          onPress={action.onPress}
          style={({ pressed }) => [styles.action, action.disabled && styles.disabled, pressed && styles.pressed]}
        >
          <MaterialSymbol
            name={action.icon}
            color={action.destructive ? theme.color.error : theme.color.focus}
            size={theme.navbar.iconSize}
          />
          <Text allowFontScaling style={styles.actionLabel}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    paddingHorizontal: theme.space.sm,
    paddingBottom: theme.space.sm,
    backgroundColor: theme.navbar.bg,
    borderBottomWidth: theme.border.widthThin,
    borderBottomColor: theme.color["border-subtle"],
    boxShadow: theme.shadow.barTop,
  },
  iconButton: {
    width: theme.target.minSize,
    height: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
  },
  count: { ...theme.font.label, color: theme.color["on-surface"], flex: 1 },
  bar: {
    flexDirection: "row",
    gap: theme.space.sm,
    paddingTop: theme.space.sm,
    paddingHorizontal: theme.space.md,
    backgroundColor: theme.navbar.bg,
    borderTopWidth: theme.border.widthThin,
    borderTopColor: theme.color["border-subtle"],
    boxShadow: theme.shadow.bar,
  },
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.primitive["space-4"],
    borderRadius: theme.radius.lg,
  },
  actionLabel: { ...theme.font.label, color: theme.color["on-surface"], textAlign: "center" },
  disabled: { opacity: theme.button.opacityDisabled },
  pressed: { opacity: theme.motion.opacityPressed, transform: [{ scale: theme.motion.scalePressed }] },
});
