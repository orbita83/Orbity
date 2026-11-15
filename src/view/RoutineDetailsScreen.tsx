import { useRouter } from "expo-router";
import { useRoutineDetailsViewModel } from "../viewmodel/RoutineDetailsViewModel";
import { RoutineDetailsScreenContent } from "./RoutineDetailsScreenContent";

/**
 * Tela Detalhe da rotina. Sem o domínio de Rotinas ainda não há de onde carregar a rotina pelo `id`
 * da rota, então a tela mostra o estado "Rotina indisponível" até o caso de uso ser ligado.
 */
const RoutineDetailsScreen = () => {
  const vm = useRoutineDetailsViewModel();
  const router = useRouter();

  return (
    <RoutineDetailsScreenContent
      {...vm}
      onBack={() => router.navigate("/routines")}
      onDeleted={(id) => router.navigate({ pathname: "/routines", params: { deleted: id } })}
    />
  );
};

export default RoutineDetailsScreen;
