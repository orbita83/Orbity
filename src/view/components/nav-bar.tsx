import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { MaterialSymbol, type MaterialSymbolName } from "./material-symbol";
import { themes, type OrbityTheme } from "../theme/tokens";

export type NavTabId = "inicio" | "tarefas" | "rotinas" | "cosmos" | "perfil";

export type NavTabItem = {
  id: NavTabId;
  label: string;
  iconSymbol: MaterialSymbolName;
  accessibilityHint: string;
};

export const DEFAULT_NAV_TABS: readonly NavTabItem[] = [
  {
    id: "inicio",
    label: "Início",
    iconSymbol: "home",
    accessibilityHint: "Acessa o painel inicial e resumo de estudos",
  },
  {
    id: "tarefas",
    label: "Tarefas",
    iconSymbol: "description",
    accessibilityHint: "Acessa a lista e acompanhamento de tarefas",
  },
  {
    id: "rotinas",
    label: "Rotinas",
    iconSymbol: "autorenew",
    accessibilityHint: "Acessa hábitos diários e ciclos de estudo",
  },
  {
    id: "cosmos",
    label: "Cosmos",
    iconSymbol: "star",
    accessibilityHint: "Acessa o mapa de constelações e evolução positiva",
  },
  {
    id: "perfil",
    label: "Perfil",
    iconSymbol: "person",
    accessibilityHint: "Acessa suas métricas, histórico e preferências",
  },
] as const;

export type NavBarProps = {
  activeTab: NavTabId;
  onSelectTab: (tabId: NavTabId) => void;
  visible?: boolean;
  theme?: OrbityTheme;
  tabs?: readonly NavTabItem[];
};

export const NavBar = ({
  activeTab,
  onSelectTab,
  visible = true,
  theme = themes.light,
  tabs = DEFAULT_NAV_TABS,
}: NavBarProps) => {
  const [focusedTabId, setFocusedTabId] = useState<NavTabId | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((enabled) => mounted && setReduceMotion(enabled))
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener?.("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  // Ocultação dinâmica durante o Modo Foco (F2) ou Seleção Múltipla (F6)
  if (!visible) {
    return null;
  }

  const styles = createStyles(theme);

  return (
    <View accessibilityRole="tablist" style={styles.container}>
      <View style={styles.tabRow}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isFocused = focusedTabId === tab.id;

          return (
            <View
              key={tab.id}
              style={[
                styles.focusContainer,
                isFocused && styles.focusContainerActive,
              ]}
            >
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={`Aba ${tab.label}, ${index + 1} de ${tabs.length}`}
                accessibilityState={{ selected: isActive }}
                aria-selected={isActive}
                accessibilityHint={tab.accessibilityHint}
                onPress={() => onSelectTab(tab.id)}
                onFocus={() => setFocusedTabId(tab.id)}
                onBlur={() => setFocusedTabId(null)}
                style={({ pressed }) => [
                  styles.tabItem,
                  isActive && styles.tabItemActive,
                  pressed && styles.tabItemPressed,
                  pressed && !reduceMotion && styles.tabItemPressedScale,
                ]}
              >
                {/* Na 1.2 o indicador ativo ocupa a aba inteira; o ícone fica centralizado. */}
                <View style={styles.iconIndicator}>
                  <MaterialSymbol
                    name={tab.iconSymbol}
                    filled={isActive}
                    color={
                      isActive
                        ? theme.navbar.itemActive
                        : theme.navbar.itemInactive
                    }
                    size={theme.navbar.iconSize}
                  />
                </View>

                {/* Rótulo textual sempre visível com allowFontScaling */}
                <Text
                  allowFontScaling
                  style={[
                    styles.label,
                    isActive ? styles.labelActive : styles.labelInactive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme: OrbityTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.navbar.bg,
      borderTopColor: theme.componentOverrides?.navbarBorder ?? theme.navbar.border,
      borderTopWidth: 1,
      boxShadow: theme.navbar.shadow,
      elevation: theme.navbar.elevation,
      paddingHorizontal: theme.space.sm,
      width: "100%",
    },
    tabRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.space.sm,
      minHeight: theme.navbar.minHeight,
      paddingVertical: theme.space.sm,
    },
    focusContainer: {
      borderRadius:
        theme.navbar.indicatorRadius +
        theme.navbar.focusOffset +
        theme.navbar.focusWidth,
      borderWidth: theme.navbar.focusWidth,
      borderColor: "transparent",
      flex: 1,
    },
    focusContainerActive: {
      borderColor: theme.navbar.focusColor,
    },
    tabItem: {
      alignItems: "center",
      borderRadius: theme.navbar.indicatorRadius,
      justifyContent: "center",
      minHeight: theme.navbar.minHeight,
      minWidth: theme.target.minSize,
      paddingHorizontal: theme.primitive["space-4"],
      paddingVertical: theme.primitive["space-4"],
    },
    tabItemActive: {
      backgroundColor: theme.navbar.indicatorBg,
    },
    tabItemPressed: {
      opacity: theme.motion.opacityPressed,
    },
    tabItemPressedScale: {
      transform: [{ scale: theme.motion.scalePressed }],
    },
    iconIndicator: {
      alignItems: "center",
      height: theme.primitive["space-32"],
      justifyContent: "center",
      minWidth: theme.target.minSize,
    },
    label: {
      ...theme.font.label,
      marginTop: theme.primitive["space-4"],
      textAlign: "center",
    },
    labelActive: {
      color: theme.navbar.itemActive,
      fontWeight: theme.font.title.fontWeight,
    },
    labelInactive: {
      color: theme.navbar.itemInactive,
      fontWeight: theme.font.label.fontWeight,
    },
  });
