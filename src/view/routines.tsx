import { useRoutinesViewModel } from "../viewmodel/useRoutinesViewModel";
import { RoutinesScreenContent } from "./routines-content";

/**
 * Tela Rotinas: liga a ViewModel à apresentação. A ViewModel recarrega ao ganhar foco, conclui a
 * exclusão confirmada no detalhe (`?deleted=<id>`, com "Desfazer" do protótipo 3.4) e navega.
 */
const RoutinesScreen = () => {
  const vm = useRoutinesViewModel();

  return (
    <RoutinesScreenContent
      {...vm}
      onCreateRoutine={vm.handleCreateRoutine}
      onOpenRoutine={vm.handleOpenRoutine}
    />
  );
};

export default RoutinesScreen;
