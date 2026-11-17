import { useRoutineDetailsViewModel } from "../viewmodel/useRoutineDetailsViewModel";
import { RoutineDetailsScreenContent } from "./routine-details-content";

/** Tela Detalhe da rotina: a ViewModel carrega a rotina pelo `id` da rota e volta para a lista ao sair ou excluir. */
const RoutineDetailsScreen = () => {
  const vm = useRoutineDetailsViewModel();

  return (
    <RoutineDetailsScreenContent
      {...vm}
      onBack={vm.handleBack}
      onEdit={vm.handleEdit}
      onDeleted={vm.handleDeleted}
    />
  );
};

export default RoutineDetailsScreen;
