import { useCallback, useState } from "react";
import type { RoutineIcon } from "./RoutinesViewModel";

export type RoutineTaskItem = { id: string; title: string; done: boolean };

/** Rotina como o detalhe a apresenta. Provisório até o caso de uso de Rotinas (RF-0008). */
export type RoutineDetails = {
  id: string;
  title: string;
  description?: string;
  icon: RoutineIcon;
  days: number[];
  /** Horário já formatado, como "07:00–07:45". */
  timeLabel?: string;
  tasks: RoutineTaskItem[];
};

export type RoutineDetailsState = {
  /** `null` quando a rotina não existe (ex.: aberta por um link antigo). */
  routine: RoutineDetails | null;
  completedCount: number;
  allDone: boolean;
  confirmDeleteVisible: boolean;
};

export type RoutineDetailsActions = {
  toggleTask: (id: string) => void;
  moveTaskUp: (index: number) => void;
  completeAll: () => void;
  undoAll: () => void;
  requestDelete: () => void;
  cancelDelete: () => void;
};

/**
 * Estado do detalhe da rotina (protótipo 3.2 e 3.3, padrão F8 e RF-0011): concluir item a item ou
 * tudo de uma vez, desfazer com "Desmarcar todos" e pedir confirmação antes de excluir.
 */
export const useRoutineDetailsViewModel = (initialRoutine: RoutineDetails | null = null): RoutineDetailsState & RoutineDetailsActions => {
  const [routine, setRoutine] = useState<RoutineDetails | null>(initialRoutine);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const updateTasks = useCallback((update: (tasks: RoutineTaskItem[]) => RoutineTaskItem[]) => {
    setRoutine((current) => (current ? { ...current, tasks: update(current.tasks) } : current));
  }, []);

  const toggleTask = useCallback(
    (id: string) => updateTasks((tasks) => tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task))),
    [updateTasks],
  );
  const moveTaskUp = useCallback(
    (index: number) =>
      updateTasks((tasks) => {
        if (index <= 0) return tasks;
        const next = [...tasks];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        return next;
      }),
    [updateTasks],
  );
  const completeAll = useCallback(() => updateTasks((tasks) => tasks.map((task) => ({ ...task, done: true }))), [updateTasks]);
  const undoAll = useCallback(() => updateTasks((tasks) => tasks.map((task) => ({ ...task, done: false }))), [updateTasks]);

  const completedCount = routine?.tasks.filter((task) => task.done).length ?? 0;
  const total = routine?.tasks.length ?? 0;

  return {
    routine,
    completedCount,
    allDone: total > 0 && completedCount === total,
    confirmDeleteVisible,
    toggleTask,
    moveTaskUp,
    completeAll,
    undoAll,
    requestDelete: useCallback(() => setConfirmDeleteVisible(true), []),
    cancelDelete: useCallback(() => setConfirmDeleteVisible(false), []),
  };
};
