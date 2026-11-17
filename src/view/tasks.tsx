import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect } from "react";
import { BackHandler } from "react-native";
import { useTasksViewModel } from "../viewmodel/useTasksViewModel";
import { TasksScreenContent } from "./tasks-content";

/** Tela Tarefas: liga a ViewModel à apresentação e esconde a barra de abas na seleção múltipla. */
const TasksScreen = () => {
  const vm = useTasksViewModel();
  const router = useRouter();
  const navigation = useNavigation();

  const { selectionMode, cancelSelection, reload } = vm;
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({ tabBarStyle: selectionMode ? { display: "none" } : undefined });
  }, [navigation, selectionMode]);

  // No Android, o voltar do sistema sai da seleção antes de sair da tela.
  useEffect(() => {
    if (!selectionMode) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      cancelSelection();
      return true;
    });
    return () => subscription.remove();
  }, [cancelSelection, selectionMode]);

  return (
    <TasksScreenContent
      {...vm}
      onCreateTask={() => router.navigate({ pathname: "/new-task", params: { id: "" } })}
      onEditTask={(id) => router.navigate({ pathname: "/new-task", params: { id } })}
    />
  );
};

export default TasksScreen;
