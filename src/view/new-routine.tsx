import { useNewRoutineViewModel } from "../viewmodel/useNewRoutineViewModel";
import { NewRoutineScreenContent } from "./new-routine-content";

/**
 * Tela Nova/Editar rotina. Sem `id` na rota, cria e volta para a lista; com `id`, edita (RF-0009, #137)
 * e volta para o detalhe atualizado (FL-0007, passo 4). A ViewModel lê a rota e navega. Lista e detalhe
 * recarregam ao ganhar foco (05-padroes.md, F7; protótipo 3.1 → 3).
 */
const NewRoutineScreen = () => {
  const vm = useNewRoutineViewModel();

  return <NewRoutineScreenContent {...vm} onBack={vm.handleLeave} onFinish={vm.handleLeave} />;
};

export default NewRoutineScreen;
