import { useTasksViewModel } from "../viewmodel/useTasksViewModel";
import { TasksScreenContent } from "./tasks-content";

/** Tela Tarefas: liga a ViewModel à apresentação. A navegação fica na ViewModel. */
const TasksScreen = () => {
  const vm = useTasksViewModel();

  return <TasksScreenContent {...vm} onCreateTask={vm.handleCreateTask} onEditTask={vm.handleEditTask} />;
};

export default TasksScreen;
