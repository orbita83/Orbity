import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BackHandler } from "react-native";
import { container, resolveUseCase } from "@/di/container";
import { createDefaultCategories, type Category } from "@/model/entities/category";
import { ROUTINE_ICONS, type NextActiveDay, type RoutineIcon, type RoutineOverview } from "@/model/entities/routine";
import type { IRoutineUseCases } from "@/usecase/iRoutineUseCases";

export { ROUTINE_ICONS, type RoutineIcon };

/** Tempo (ms) em que o "Desfazer" fica disponível depois de excluir. Regra de comportamento, não token visual. */
export const UNDO_WINDOW_MS = 8000;

export type RoutinesErrorKey = "error.load" | "error.save";

/** Rotina como a lista a apresenta (view data preparada pela ViewModel). */
export type RoutineListItem = {
  id: string;
  title: string;
  icon: RoutineIcon;
  /** Dias da semana ativos, 0 = domingo (RF-0012). */
  days: number[];
  taskCount: number;
  /** Hoje é um dos dias da rotina; fora deles, a conclusão fica bloqueada (rotinas.md, R6). */
  activeToday: boolean;
  /** Ocorrência de hoje concluída (RF-0011). */
  doneToday: boolean;
  /** Próximo dia em que a rotina volta (issue #210). */
  nextActiveDay?: NextActiveDay;
};

export type RoutinesState = {
  visibleRoutines: RoutineListItem[];
  /** Rotinas de hoje: base do resumo "X de Y concluídas" (R6). */
  totalCount: number;
  doneTodayCount: number;
  query: string;
  /** Última rotina excluída, enquanto o aviso com "Desfazer" está na tela. */
  lastDeleted: RoutineListItem | null;
  /** Categorias salvas no DataSource para resolver o ícone de cada rotina (issue #213). */
  categories?: readonly Category[];
  loading: boolean;
  errorKey: RoutinesErrorKey | null;
  /** Seleção múltipla aberta pelo toque longo (protótipo 3.5). */
  selectionMode: boolean;
  selectedIds: string[];
  /** Rotinas que a confirmação vai excluir, com o total de tarefas que saem junto; `null` sem confirmação aberta. */
  pendingDelete: { ids: string[]; title: string; taskCount: number } | null;
};

export type RoutinesActions = {
  setQuery: (query: string) => void;
  toggleDoneToday: (id: string) => void;
  deleteRoutine: (id: string) => void;
  undoDelete: () => void;
  dismissDeleted: () => void;
  reload: () => Promise<void>;
  startSelection: (id: string) => void;
  toggleSelected: (id: string) => void;
  cancelSelection: () => void;
  selectAll: () => void;
  /** "•••" → Excluir uma rotina, ou Excluir (n) na seleção: abre a confirmação. */
  requestDelete: (ids?: readonly string[]) => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
  /** "•••" → Editar: abre o formulário da rotina. */
  handleEditRoutine: (id: string) => void;
  /** Abre o formulário de Nova rotina. */
  handleCreateRoutine: () => void;
  /** Abre o detalhe da rotina. */
  handleOpenRoutine: (id: string) => void;
};

const toListItem = ({ routine, taskCount, activeToday, doneToday, nextActiveDay }: RoutineOverview): RoutineListItem => ({
  id: routine.id,
  title: routine.title,
  icon: routine.icon,
  days: [...routine.days],
  taskCount,
  activeToday,
  doneToday,
  ...(nextActiveDay ? { nextActiveDay } : {}),
});

const DEFAULT_FALLBACK_CATEGORIES: readonly Category[] = createDefaultCategories();

/**
 * Estado da lista de Rotinas: busca, conclusão do dia e exclusão com desfazer, pelo `IRoutineUseCases`.
 * Com um array, funciona só em memória (histórias do Storybook e testes de apresentação).
 * Cuida também da navegação: recarrega ao ganhar foco, conclui a exclusão confirmada no detalhe
 * (`/routines?deleted=<id>`, com "Desfazer" do protótipo 3.4) e abre o detalhe e a Nova rotina.
 */
export const useRoutinesViewModel = (
  source?: IRoutineUseCases | readonly RoutineListItem[],
): [RoutinesState, RoutinesActions] => {
  const isPrototypeMode = Array.isArray(source);
  const injectedUseCases = isPrototypeMode ? undefined : (source as IRoutineUseCases | undefined);
  const useCases = resolveUseCase(injectedUseCases, container.useCases.routines);

  const [routines, setRoutines] = useState<RoutineListItem[]>(() => (isPrototypeMode ? [...source] : []));
  const [categories, setCategories] = useState<readonly Category[]>(DEFAULT_FALLBACK_CATEGORIES);
  const [query, setQuery] = useState("");
  const [lastDeleted, setLastDeleted] = useState<{ item: RoutineListItem; index: number } | null>(null);
  const [loading, setLoading] = useState(!isPrototypeMode);
  const [errorKey, setErrorKey] = useState<RoutinesErrorKey | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const mounted = useRef(true);
  const latestRequest = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Os setState ficam só nos callbacks da promessa; a resposta mais nova vence.
  const reload = useCallback((): Promise<void> => {
    if (isPrototypeMode) return Promise.resolve();
    const request = ++latestRequest.current;
    const isCurrent = () => mounted.current && request === latestRequest.current;
    return Promise.all([
      useCases.listRoutines(),
      useCases.listCategories(),
    ]).then(
      ([loaded, loadedCategories]) => {
        if (!isCurrent()) return;
        setRoutines(loaded.map(toListItem));
        setCategories(loadedCategories);
        setErrorKey(null);
        setLoading(false);
      },
      () => {
        if (!isCurrent()) return;
        setErrorKey("error.load");
        setLoading(false);
      },
    );
  }, [isPrototypeMode, useCases]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (isPrototypeMode || !useCases.subscribeDayChange) return;
    return useCases.subscribeDayChange(() => {
      void reload();
    });
  }, [isPrototypeMode, reload, useCases]);

  /** Roda uma ação do caso de uso; em falha, mostra o aviso e recarrega o estado verdadeiro. */
  const runAction = useCallback(
    (action: () => Promise<unknown>) => {
      void action().then(
        () => reload(),
        () => {
          if (!mounted.current) return;
          setErrorKey("error.save");
          return reload().then(() => {
            if (mounted.current) setErrorKey("error.save");
          });
        },
      );
    },
    [reload],
  );

  const visibleRoutines = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    return term === "" ? routines : routines.filter((routine) => routine.title.toLocaleLowerCase("pt-BR").includes(term));
  }, [query, routines]);

  const toggleDoneToday = useCallback(
    (id: string) => {
      const target = routines.find((routine) => routine.id === id);
      if (!target || !target.activeToday) return;
      // Resposta imediata na tela; o caso de uso confirma em seguida.
      setRoutines((current) => current.map((routine) => (routine.id === id ? { ...routine, doneToday: !routine.doneToday } : routine)));
      if (isPrototypeMode) return;
      runAction(() => (target.doneToday ? useCases.reopenOccurrence(id) : useCases.completeOccurrence(id)));
    },
    [isPrototypeMode, routines, runAction, useCases],
  );

  const deleteRoutine = useCallback(
    (id: string) => {
      const index = routines.findIndex((routine) => routine.id === id);
      if (index < 0) return;
      setLastDeleted({ item: routines[index], index });
      setRoutines(routines.filter((routine) => routine.id !== id));
      if (isPrototypeMode) return;
      runAction(() => useCases.deleteRoutine(id));
    },
    [isPrototypeMode, routines, runAction, useCases],
  );

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return;
    setRoutines((current) => {
      const next = [...current];
      next.splice(Math.min(lastDeleted.index, next.length), 0, lastDeleted.item);
      return next;
    });
    setLastDeleted(null);
    if (isPrototypeMode) return;
    runAction(() => useCases.restoreRoutine(lastDeleted.item.id));
  }, [isPrototypeMode, lastDeleted, runAction, useCases]);

  const dismissDeleted = useCallback(() => setLastDeleted(null), []);

  // O aviso com "Desfazer" fica na tela por um tempo e some sozinho (snackbar.md).
  useEffect(() => {
    if (!lastDeleted) return;
    const timer = setTimeout(() => setLastDeleted(null), UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [lastDeleted]);

  // Recarrega ao voltar para a aba, para refletir o que mudou no detalhe ou em Nova rotina.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  // A exclusão confirmada no detalhe volta para cá com `?deleted=<id>`: ao ganhar foco, exclui,
  // mostra o aviso com "Desfazer" e tira o parâmetro da rota.
  const { deleted } = useLocalSearchParams<{ deleted?: string }>();
  useFocusEffect(
    useCallback(() => {
      if (!deleted) return;
      deleteRoutine(deleted);
      router.setParams({ deleted: undefined });
    }, [deleteRoutine, deleted]),
  );

  const selectionMode = selectedIds !== null;
  const startSelection = useCallback((id: string) => setSelectedIds([id]), []);
  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((current) => {
      const ids = current ?? [];
      return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
    });
  }, []);
  const cancelSelection = useCallback(() => {
    setSelectedIds(null);
    setDeleteIds(null);
  }, []);
  const selectAll = useCallback(() => setSelectedIds(visibleRoutines.map((routine) => routine.id)), [visibleRoutines]);

  const requestDelete = useCallback(
    (ids?: readonly string[]) => {
      const targets = [...(ids ?? selectedIds ?? [])];
      if (targets.length > 0) setDeleteIds(targets);
    },
    [selectedIds],
  );
  const cancelDelete = useCallback(() => setDeleteIds(null), []);
  const confirmDelete = useCallback(() => {
    const ids = deleteIds ?? [];
    setDeleteIds(null);
    setSelectedIds(null);
    if (ids.length === 0) return;
    if (ids.length === 1) {
      // Uma rotina: mantém o "Desfazer" do protótipo 3.4.
      deleteRoutine(ids[0]);
      return;
    }
    setLastDeleted(null);
    setRoutines((current) => current.filter((routine) => !ids.includes(routine.id)));
    if (isPrototypeMode) return;
    runAction(() => Promise.all(ids.map((id) => useCases.deleteRoutine(id))));
  }, [deleteIds, deleteRoutine, isPrototypeMode, runAction, useCases]);

  const pendingDelete = useMemo(() => {
    if (!deleteIds) return null;
    const targets = routines.filter((routine) => deleteIds.includes(routine.id));
    return {
      ids: deleteIds,
      title: targets.length === 1 ? targets[0].title : "",
      taskCount: targets.reduce((sum, routine) => sum + routine.taskCount, 0),
    };
  }, [deleteIds, routines]);

  // A barra de abas some durante a seleção, para dar lugar à barra de ações (como em Tarefas).
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ tabBarStyle: selectionMode ? { display: "none" } : undefined });
  }, [navigation, selectionMode]);

  // No Android, o voltar do sistema sai da seleção antes de sair da tela.
  useEffect(() => {
    if (!selectionMode) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      cancelSelection();
      return true;
    });
    return () => subscription.remove();
  }, [cancelSelection, selectionMode]);

  const handleEditRoutine = useCallback((id: string) => {
    router.navigate({ pathname: "/new-routine", params: { id } });
  }, []);

  const handleCreateRoutine = useCallback(() => {
    router.navigate("/new-routine");
  }, []);

  const handleOpenRoutine = useCallback((id: string) => {
    router.navigate({ pathname: "/routine-details", params: { id } });
  }, []);

  const today = routines.filter((routine) => routine.activeToday);
  return [
    {
      visibleRoutines,
      totalCount: today.length,
      doneTodayCount: today.filter((routine) => routine.doneToday).length,
      query,
      lastDeleted: lastDeleted?.item ?? null,
      categories,
      loading,
      errorKey,
      selectionMode,
      selectedIds: selectedIds ?? [],
      pendingDelete,
    },
    {
      setQuery,
      toggleDoneToday,
      deleteRoutine,
      undoDelete,
      dismissDeleted,
      reload,
      startSelection,
      toggleSelected,
      cancelSelection,
      selectAll,
      requestDelete,
      cancelDelete,
      confirmDelete,
      handleEditRoutine,
      handleCreateRoutine,
      handleOpenRoutine,
    },
  ];
};
