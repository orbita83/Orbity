import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { useRoutineDetailsViewModel } from "../viewmodel/useRoutineDetailsViewModel";
import { RoutineDetailsScreenContent } from "./routine-details-content";

/** Tela Detalhe da rotina: carrega a rotina pelo `id` da rota e volta para a lista ao sair ou excluir. */
const RoutineDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const vm = useRoutineDetailsViewModel(id);
  const router = useRouter();
  const { reload } = vm;

  // Recarrega ao ganhar foco: a ocorrência de hoje pode ter mudado pela lista, e a rotina pela edição.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return (
    <RoutineDetailsScreenContent
      {...vm}
      onBack={() => router.navigate("/routines")}
      onEdit={(routineId) => router.navigate({ pathname: "/new-routine", params: { id: routineId } })}
      onDeleted={(routineId) => router.navigate({ pathname: "/routines", params: { deleted: routineId } })}
    />
  );
};

export default RoutineDetailsScreen;
