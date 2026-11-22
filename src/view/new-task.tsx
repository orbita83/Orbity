import { useNewTaskViewModel } from "../viewmodel/useNewTaskViewModel";
import { NewTaskScreenContent } from "./new-task-content";

/** Tela Nova/Editar tarefa: abre por cima de Tarefas. A ViewModel lê o `id` da rota e volta para a lista. */
const NewTaskScreen = () => {
  const [state, actions] = useNewTaskViewModel();

  return <NewTaskScreenContent {...state} {...actions} onClose={actions.handleClose} onFinish={actions.handleClose} />;
};

export default NewTaskScreen;
