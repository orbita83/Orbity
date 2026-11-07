import type { ComponentProps } from "react";
import type { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavBar, type NavTabId } from "./nav-bar";
import { themes } from "../theme/tokens";

const routeByTab: Record<NavTabId, string> = {
  inicio: "index",
  tarefas: "tasks",
  rotinas: "routines",
  cosmos: "cosmos",
  perfil: "profile",
};

const tabByRoute: Record<string, NavTabId> = {
  index: "inicio",
  tasks: "tarefas",
  routines: "rotinas",
  cosmos: "cosmos",
  profile: "perfil",
};

export type MainTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

export const MainTabBar = ({ state, navigation }: MainTabBarProps) => {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index];
  const activeTab = tabByRoute[activeRoute.name];

  const handleSelectTab = (tabId: NavTabId) => {
    const route = state.routes.find((item) => item.name === routeByTab[tabId]);
    if (!route) return;

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (route.key !== activeRoute.key && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <NavBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        theme={themes.cosmic}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: themes.cosmic.navbar.bg,
  },
});
