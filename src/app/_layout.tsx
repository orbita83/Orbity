import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MainTabBar } from "@/view/components/MainTabBar";

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
      {/* Telas empilhadas sobre as abas: sem item na barra, que fica escondida nelas. */}
      <Tabs.Screen name="new-task" options={{ title: "Nova tarefa", href: null }} />
      <Tabs.Screen name="new-routine" options={{ title: "Nova rotina", href: null }} />
      <Tabs.Screen name="routine-details" options={{ title: "Rotina", href: null }} />
    </Tabs>
  </>
);

export default RootLayout;
