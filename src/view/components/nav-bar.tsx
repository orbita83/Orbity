import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
    iconSymbol: "auto_awesome",
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
                accessibilityHint={tab.accessibilityHint}
                onPress={() => onSelectTab(tab.id)}
                onFocus={() => setFocusedTabId(tab.id)}
                onBlur={() => setFocusedTabId(null)}
                style={({ pressed }) => [
                  styles.tabItem,
                  pressed && styles.tabItemPressed,
                ]}
              >
                {/* Indicador visual ativo (Pill) e Ícone Material Symbols */}
                <View
                  style={[
                    styles.iconIndicator,
                    isActive && styles.iconIndicatorActive,
                  ]}
                >
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
      borderTopColor: theme.primitive["neutral-200"],
      borderTopWidth: 1,
      elevation: theme.navbar.elevation,
      paddingHorizontal: theme.space.sm,
      shadowColor: theme.primitive["neutral-900"],
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      width: "100%",
    },
    tabRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      minHeight: theme.navbar.minHeight,
      paddingVertical: theme.space.sm,
    },
    focusContainer: {
      borderRadius:
        theme.radius.md +
        theme.navbar.focusOffset +
        theme.navbar.focusWidth,
      borderWidth: theme.navbar.focusWidth,
      borderColor: "transparent",
      flex: 1,
      marginHorizontal: 2,
    },
    focusContainerActive: {
      borderColor: theme.navbar.focusColor,
    },
    tabItem: {
      alignItems: "center",
      borderRadius: theme.radius.md,
      justifyContent: "center",
      minHeight: theme.navbar.minHeight,
      paddingHorizontal: 2,
      paddingVertical: 4,
    },
    tabItemPressed: {
      opacity: 0.7,
    },
    iconIndicator: {
      alignItems: "center",
      borderRadius: theme.radius.lg,
      height: 32,
      justifyContent: "center",
      minWidth: 56,
      paddingHorizontal: theme.space.sm,
    },
    iconIndicatorActive: {
      backgroundColor: theme.navbar.indicatorBg,
    },
    label: {
      ...theme.font.label,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 2,
      textAlign: "center",
    },
    labelActive: {
      color: theme.navbar.itemActive,
      fontWeight: "700",
    },
    labelInactive: {
      color: theme.navbar.itemInactive,
      fontWeight: "500",
    },
  });
