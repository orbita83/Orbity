import { useTasksViewModel } from "../viewmodel/useTasksViewModel";
import { TasksScreenContent } from "./tasks-content";

/** Tela Tarefas: liga a ViewModel à apresentação. A navegação fica na ViewModel. */
const TasksScreen = () => {
  const [state, actions] = useTasksViewModel();

  return <TasksScreenContent {...state} {...actions} onCreateTask={actions.handleCreateTask} onEditTask={actions.handleEditTask} onOpenTask={actions.handleOpenTask} />;
};

export default TasksScreen;
