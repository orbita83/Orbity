import { useCallback, useEffect, useMemo, useState } from "react";

/** Tempo (ms) em que o "Desfazer" fica disponível depois de excluir. Regra de comportamento, não token visual. */
export const UNDO_WINDOW_MS = 8000;

/** Ícones que o estudante pode escolher para uma rotina (Nova rotina). */
export const ROUTINE_ICONS = ["track_changes", "menu_book", "calculate", "translate", "science", "code", "music_note"] as const;
export type RoutineIcon = (typeof ROUTINE_ICONS)[number];

/**
 * Rotina como a lista a apresenta. Provisório: vira o resultado do caso de uso de Rotinas
 * (RF-0008) quando o domínio existir; por enquanto a lista começa vazia em produção.
 */
export type RoutineListItem = {
  id: string;
  title: string;
  icon: RoutineIcon;
  /** Dias da semana ativos, 0 = domingo (RF-0012). */
  days: number[];
  taskCount: number;
  /** Ocorrência de hoje concluída (RF-0011). */
  doneToday: boolean;
};

export type RoutinesState = {
  visibleRoutines: RoutineListItem[];
  totalCount: number;
  doneTodayCount: number;
  query: string;
  /** Última rotina excluída, enquanto o aviso com "Desfazer" está na tela. */
  lastDeleted: RoutineListItem | null;
};

export type RoutinesActions = {
  setQuery: (query: string) => void;
  toggleDoneToday: (id: string) => void;
  deleteRoutine: (id: string) => void;
  undoDelete: () => void;
  dismissDeleted: () => void;
};

/**
 * Estado de apresentação da lista de Rotinas: busca, conclusão do dia e exclusão com desfazer.
 * As mudanças ficam só em memória até o caso de uso de Rotinas ser ligado aqui.
 */
export const useRoutinesViewModel = (initialRoutines: readonly RoutineListItem[] = []): RoutinesState & RoutinesActions => {
  const [routines, setRoutines] = useState<RoutineListItem[]>(() => [...initialRoutines]);
  const [query, setQuery] = useState("");
  const [lastDeleted, setLastDeleted] = useState<{ item: RoutineListItem; index: number } | null>(null);

  const visibleRoutines = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    return term === "" ? routines : routines.filter((routine) => routine.title.toLocaleLowerCase("pt-BR").includes(term));
  }, [query, routines]);

  const toggleDoneToday = useCallback((id: string) => {
    setRoutines((current) => current.map((routine) => (routine.id === id ? { ...routine, doneToday: !routine.doneToday } : routine)));
  }, []);

  const deleteRoutine = useCallback(
    (id: string) => {
      const index = routines.findIndex((routine) => routine.id === id);
      if (index < 0) return;
      setLastDeleted({ item: routines[index], index });
      setRoutines(routines.filter((routine) => routine.id !== id));
    },
    [routines],
  );

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return;
    setRoutines((current) => {
      const next = [...current];
      next.splice(Math.min(lastDeleted.index, next.length), 0, lastDeleted.item);
      return next;
    });
    setLastDeleted(null);
  }, [lastDeleted]);

  const dismissDeleted = useCallback(() => setLastDeleted(null), []);

  // O aviso com "Desfazer" fica na tela por um tempo e some sozinho (snackbar.md).
  useEffect(() => {
    if (!lastDeleted) return;
    const timer = setTimeout(() => setLastDeleted(null), UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [lastDeleted]);

  return {
    visibleRoutines,
    totalCount: routines.length,
    doneTodayCount: routines.filter((routine) => routine.doneToday).length,
    query,
    lastDeleted: lastDeleted?.item ?? null,
    setQuery,
    toggleDoneToday,
    deleteRoutine,
    undoDelete,
    dismissDeleted,
  };
};
