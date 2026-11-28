import { useRoutinesViewModel } from "../viewmodel/useRoutinesViewModel";
import { RoutinesScreenContent } from "./routines-content";

/**
 * Tela Rotinas: liga a ViewModel à apresentação. A ViewModel recarrega ao ganhar foco, conclui a
 * exclusão confirmada no detalhe (`?deleted=<id>`, com "Desfazer" do protótipo 3.4) e navega.
 */
const RoutinesScreen = () => {
  const [state, actions] = useRoutinesViewModel();

  return (
    <RoutinesScreenContent
      {...state}
      {...actions}
      onCreateRoutine={actions.handleCreateRoutine}
      onOpenRoutine={actions.handleOpenRoutine}
      onEditRoutine={actions.handleEditRoutine}
    />
  );
};

export default RoutinesScreen;
