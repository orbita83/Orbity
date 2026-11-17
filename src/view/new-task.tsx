import { useNewTaskViewModel } from "../viewmodel/useNewTaskViewModel";
import { NewTaskScreenContent } from "./new-task-content";

/** Tela Nova/Editar tarefa: abre por cima de Tarefas. A ViewModel lê o `id` da rota e volta para a lista. */
const NewTaskScreen = () => {
  const vm = useNewTaskViewModel();

  return <NewTaskScreenContent {...vm} onClose={vm.handleClose} onFinish={vm.handleClose} />;
};

export default NewTaskScreen;
