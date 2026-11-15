import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useRoutinesViewModel } from "../viewmodel/RoutinesViewModel";
import { RoutinesScreenContent } from "./RoutinesScreenContent";

/**
 * Tela Rotinas: liga a ViewModel à apresentação. A exclusão confirmada no detalhe volta para cá com
 * `?deleted=<id>`; a lista exclui e mostra o aviso com "Desfazer" (protótipo 3.4).
 */
const RoutinesScreen = () => {
  const vm = useRoutinesViewModel();
  const router = useRouter();
  const { deleted } = useLocalSearchParams<{ deleted?: string }>();
  const { deleteRoutine } = vm;

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
