import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { themes } from "@/view/theme/tokens";
import { MainTabBar } from "@/view/components/MainTabBar";

// Fundo da janela raiz na cor da barra de abas (navbar.bg): é o que o Android mostra atrás da
// barra de navegação do sistema, que assim continua a MainTabBar em vez de ficar branca.
void SystemUI.setBackgroundColorAsync(themes.cosmic.navbar.bg);

const RootLayout = () => (
  <>
    <StatusBar style="light" />
    <Tabs
      initialRouteName="index"
      backBehavior="firstRoute"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <MainTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="tasks" options={{ title: "Tarefas" }} />
      <Tabs.Screen name="routines" options={{ title: "Rotinas" }} />
      <Tabs.Screen name="cosmos" options={{ title: "Cosmos" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      <Tabs.Screen name="achievements" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      {/* Telas empilhadas sobre as abas: sem item na barra, que fica escondida nelas. */}
      <Tabs.Screen name="new-task" options={{ title: "Nova tarefa", href: null }} />
      <Tabs.Screen name="new-routine" options={{ title: "Nova rotina", href: null }} />
      <Tabs.Screen name="routine-details" options={{ title: "Rotina", href: null }} />
      <Tabs.Screen name="focus-session" options={{ title: "Modo Foco", href: null }} />
    </Tabs>
  </>
);

export default RootLayout;
