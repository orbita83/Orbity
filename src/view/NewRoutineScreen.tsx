import { useLocalSearchParams, useRouter } from "expo-router";
import { useNewRoutineViewModel } from "../viewmodel/NewRoutineViewModel";
import { NewRoutineScreenContent } from "./NewRoutineScreenContent";

/**
 * Tela Nova/Editar rotina. Sem `id`, cria e volta para a lista; com `id`, edita (RF-0009, #137) e
 * volta para o detalhe atualizado (FL-0007, passo 4). Lista e detalhe recarregam ao ganhar foco
 * (05-padroes.md, F7; protótipo 3.1 → 3).
 */
const NewRoutineScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const routineId = Array.isArray(id) ? id[0] : id;
  const vm = useNewRoutineViewModel(undefined, routineId);
  const router = useRouter();
  const leave = () => {
    vm.reset();
    router.setParams({ id: "" });
    if (vm.editing && routineId) {
      router.navigate({ pathname: "/routine-details", params: { id: routineId } });
    } else {
      router.navigate("/routines");
    }
  };

  return <NewRoutineScreenContent {...vm} onBack={leave} onFinish={leave} />;
};

export default NewRoutineScreen;
