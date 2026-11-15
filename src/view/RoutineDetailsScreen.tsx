import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { useRoutineDetailsViewModel } from "../viewmodel/RoutineDetailsViewModel";
import { RoutineDetailsScreenContent } from "./RoutineDetailsScreenContent";

/** Tela Detalhe da rotina: carrega a rotina pelo `id` da rota e volta para a lista ao sair ou excluir. */
const RoutineDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const vm = useRoutineDetailsViewModel(id);
  const router = useRouter();
  const { reload } = vm;

  // Recarrega ao ganhar foco: a ocorrência de hoje pode ter mudado pela lista.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return (
    <RoutineDetailsScreenContent
      {...vm}
      onBack={() => router.navigate("/routines")}
      onDeleted={(routineId) => router.navigate({ pathname: "/routines", params: { deleted: routineId } })}
    />
  );
};

export default RoutineDetailsScreen;
