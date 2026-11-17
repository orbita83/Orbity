import { useLocalSearchParams, useRouter } from "expo-router";
import { useNewTaskViewModel } from "../viewmodel/useNewTaskViewModel";
import { NewTaskScreenContent } from "./new-task-content";

/** Tela Nova/Editar tarefa: abre por cima de Tarefas e volta para a lista ao fechar ou depois de salvar. */
const NewTaskScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const taskId = Array.isArray(id) ? id[0] : id;
  const vm = useNewTaskViewModel(undefined, undefined, taskId);
  const router = useRouter();
  const backToTasks = () => {
    vm.reset();
    router.setParams({ id: "" });
    router.navigate("/tasks");
  };

  return <NewTaskScreenContent {...vm} onClose={backToTasks} onFinish={backToTasks} />;
};

export default NewTaskScreen;
