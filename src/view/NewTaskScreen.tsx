import { useRouter } from "expo-router";
import { useNewTaskViewModel } from "../viewmodel/NewTaskViewModel";
import { NewTaskScreenContent } from "./NewTaskScreenContent";

/** Tela Nova tarefa: abre por cima de Tarefas e volta para a lista ao fechar ou depois de criar. */
const NewTaskScreen = () => {
  const vm = useNewTaskViewModel();
  const router = useRouter();
  const backToTasks = () => {
    vm.reset();
    router.navigate("/tasks");
  };

  return <NewTaskScreenContent {...vm} onClose={backToTasks} onFinish={backToTasks} />;
};

export default NewTaskScreen;
