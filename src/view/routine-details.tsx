import { useRoutineDetailsViewModel } from "../viewmodel/useRoutineDetailsViewModel";
import { RoutineDetailsScreenContent } from "./routine-details-content";

/** Tela Detalhe da rotina: a ViewModel carrega a rotina pelo `id` da rota e volta para a lista ao sair ou excluir. */
const RoutineDetailsScreen = () => {
  const [state, actions] = useRoutineDetailsViewModel();

  return (
    <RoutineDetailsScreenContent
      {...state}
      {...actions}
      onBack={actions.handleBack}
      onEdit={actions.handleEdit}
      onDeleted={actions.handleDeleted}
    />
  );
};

export default RoutineDetailsScreen;
