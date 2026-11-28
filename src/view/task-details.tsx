import { useTaskDetailsViewModel } from "../viewmodel/useTaskDetailsViewModel";
import { TaskDetailsScreenContent } from "./task-details-content";

/** Tela Detalhe da tarefa: a ViewModel carrega a tarefa pelo `id` da rota (protótipo 2.4). */
const TaskDetailsScreen = () => {
  const [state, actions] = useTaskDetailsViewModel();

  return <TaskDetailsScreenContent {...state} {...actions} onBack={actions.handleBack} onEdit={actions.handleEdit} />;
};

export default TaskDetailsScreen;
