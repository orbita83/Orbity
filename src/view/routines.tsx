import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { useRoutinesViewModel } from "../viewmodel/useRoutinesViewModel";
import { RoutinesScreenContent } from "./routines-content";

/**
 * Tela Rotinas: liga a ViewModel à apresentação. A exclusão confirmada no detalhe volta para cá com
 * `?deleted=<id>`; a lista exclui e mostra o aviso com "Desfazer" (protótipo 3.4).
 */
const RoutinesScreen = () => {
  const vm = useRoutinesViewModel();
  const router = useRouter();
  const { deleted } = useLocalSearchParams<{ deleted?: string }>();
  const { deleteRoutine, reload } = vm;

  // Recarrega ao voltar para a aba, para refletir o que mudou no detalhe ou em Nova rotina.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    if (!deleted) return;
    deleteRoutine(deleted);
    router.setParams({ deleted: undefined });
  }, [deleteRoutine, deleted, router]);

  return (
    <RoutinesScreenContent
      {...vm}
      onCreateRoutine={() => router.navigate("/new-routine")}
      onOpenRoutine={(id) => router.navigate({ pathname: "/routine-details", params: { id } })}
    />
  );
};

export default RoutinesScreen;
