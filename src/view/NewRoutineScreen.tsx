import { useRouter } from "expo-router";
import { useNewRoutineViewModel } from "../viewmodel/NewRoutineViewModel";
import { NewRoutineScreenContent } from "./NewRoutineScreenContent";

/**
 * Tela Nova rotina: abre por cima de Rotinas. Depois de criar, mostra "Rotina criada!" e volta para a
 * lista, que recarrega ao ganhar foco (05-padroes.md, F7; protótipo 3.1 → 3).
 */
const NewRoutineScreen = () => {
  const vm = useNewRoutineViewModel();
  const router = useRouter();
  const backToRoutines = () => {
    vm.reset();
    router.navigate("/routines");
  };

  return <NewRoutineScreenContent {...vm} onBack={backToRoutines} onFinish={backToRoutines} />;
};

export default NewRoutineScreen;
