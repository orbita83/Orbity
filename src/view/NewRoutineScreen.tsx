import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useNewRoutineViewModel } from "../viewmodel/NewRoutineViewModel";
import { NewRoutineScreenContent } from "./NewRoutineScreenContent";

/** Tela Nova rotina: abre por cima de Rotinas e volta para a lista ao sair ou depois de criar. */
const NewRoutineScreen = () => {
  const vm = useNewRoutineViewModel();
  const router = useRouter();
  const { created, reset } = vm;

  const backToRoutines = () => {
    reset();
    router.navigate("/routines");
  };

  // Depois de salvar pelo caso de uso, volta para a lista, que recarrega ao ganhar foco (protótipo 3.1 → 3).
  useEffect(() => {
    if (!created) return;
    reset();
    router.navigate("/routines");
  }, [created, reset, router]);

  return <NewRoutineScreenContent {...vm} onBack={backToRoutines} />;
};

export default NewRoutineScreen;
