import { router, useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BackHandler } from "react-native";
import { container, resolveUseCase } from "@/di/container";
import {
  type Task,
  type TaskFilter as DomainTaskFilter,
  filterAndSortTasks,
  formatTaskDueLabel,
  getTaskCategoryOption,
} from "@/model/entities/task";
import { DomainError } from "@/model/errors/domain-error";
import type { ITaskUseCases } from "@/usecase/i-task-use-cases";

/** Tarefa como a lista a apresenta (view data preparada pela ViewModel). */
export type TaskListItem = {
  id: string;
  title: string;
  /** Prazo já formatado, no padrão "19/10 · 08:00–09:00". */
  dueLabel?: string;
  /** Rótulo legível da categoria (ex.: "Programação"). */
  categoryLabel?: string;
  completed: boolean;
  pinned: boolean;
};

export type TaskFilter = DomainTaskFilter;

export type TasksState = {
  /** Tarefas do filtro atual, com as fixadas primeiro. */
  visibleTasks: TaskListItem[];
  pendingCount: number;
  totalCount: number;
  filter: TaskFilter;
  selectionMode: boolean;
  selectedIds: string[];
  /** Verdadeiro quando todas as selecionadas estão fixadas; a ação passa a desafixar. */
  allSelectedPinned: boolean;
  confirmDeleteVisible: boolean;
  loading: boolean;
  errorKey: "error.load" | "error.save" | null;
};

export type TasksActions = {
  selectFilter: (filter: TaskFilter) => void;
  toggleCompleted: (id: string) => void;
  startSelection: (id: string) => void;
  toggleSelected: (id: string) => void;
  cancelSelection: () => void;
  selectAll: () => void;
  pinSelected: () => void;
  requestDelete: () => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
  reload: () => Promise<void>;
  /** Abre o formulário de Nova tarefa. */
  handleCreateTask: () => void;
  /** Abre o formulário de edição da tarefa. */
  handleEditTask: (id: string) => void;
};

const toTaskListItem = (task: Task): TaskListItem => ({
  id: task.id,
  title: task.title,
  dueLabel: formatTaskDueLabel(task),
  categoryLabel: getTaskCategoryOption(task.category)?.label,
  completed: task.completed,
  pinned: task.pinned,
});

const resolveErrorKey = (caught: unknown, fallback: "error.load" | "error.save"): "error.load" | "error.save" => {
  if (caught instanceof DomainError) {
    return fallback;
  }
  return fallback;
};

/**
 * Estado da tela Tarefas. Usa `ITaskUseCases` em produção/testes e aceita uma lista inicial
 * em memória quando chamada com um array (compatível com histórias isoladas do Storybook).
 * Cuida também da navegação da tela: recarrega ao ganhar foco, esconde a barra de abas na
 * seleção múltipla, trata o voltar do Android e abre o formulário de tarefa.
 */
export const useTasksViewModel = (
  source?: ITaskUseCases | readonly TaskListItem[],
): [TasksState, TasksActions] => {
  const isPrototypeMode = Array.isArray(source);
  const injectedUseCases = isPrototypeMode ? undefined : (source as ITaskUseCases | undefined);
  const useCases = resolveUseCase(injectedUseCases, container.useCases.tasks);

  const [items, setItems] = useState<TaskListItem[]>(() => (isPrototypeMode ? [...source] : []));
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [loading, setLoading] = useState(!isPrototypeMode);
  const [errorKey, setErrorKey] = useState<"error.load" | "error.save" | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    if (isPrototypeMode) {
      return;
    }
    setErrorKey(null);
    try {
      const loaded = await useCases.listTasks();
      if (mountedRef.current) {
        setItems(loaded.map(toTaskListItem));
      }
    } catch (caught) {
      if (mountedRef.current) {
        setErrorKey(resolveErrorKey(caught, "error.load"));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [isPrototypeMode, useCases]);

  useEffect(() => {
    if (isPrototypeMode) {
      return;
    }
    let active = true;
    useCases.listTasks().then(
      (loaded) => {
        if (active) {
          setItems(loaded.map(toTaskListItem));
          setErrorKey(null);
          setLoading(false);
        }
      },
      (caught: unknown) => {
        if (active) {
          setErrorKey(resolveErrorKey(caught, "error.load"));
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [isPrototypeMode, useCases]);

  const visibleTasks = useMemo(() => filterAndSortTasks(items, filter), [filter, items]);

  const allSelectedPinned = useMemo(() => {
    if (!selectedIds || selectedIds.length === 0) {
      return false;
    }
    const selectedSet = new Set(selectedIds);
    const selectedItems = items.filter((item) => selectedSet.has(item.id));
    return selectedItems.length > 0 && selectedItems.every((item) => item.pinned);
  }, [items, selectedIds]);

  const toggleCompleted = useCallback(
    (id: string) => {
      if (isPrototypeMode) {
        setItems((current) => current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
        return;
      }
      void (async () => {
        setErrorKey(null);
        try {
          const updated = await useCases.toggleTaskCompletion(id);
          if (mountedRef.current) {
            const mapped = toTaskListItem(updated);
            setItems((current) => current.map((task) => (task.id === id ? mapped : task)));
          }
        } catch (caught) {
          if (mountedRef.current) {
            setErrorKey(resolveErrorKey(caught, "error.save"));
          }
        }
      })();
    },
    [isPrototypeMode, useCases],
  );

  const startSelection = useCallback((id: string) => setSelectedIds([id]), []);
  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((current) => {
      const ids = current ?? [];
      return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
    });
  }, []);
  const cancelSelection = useCallback(() => {
    setSelectedIds(null);
    setConfirmDeleteVisible(false);
  }, []);
  const selectAll = useCallback(() => setSelectedIds(visibleTasks.map((task) => task.id)), [visibleTasks]);

  const pinSelected = useCallback(() => {
    const ids = selectedIds ?? [];
    setSelectedIds(null);
    if (ids.length === 0) {
      return;
    }
    if (isPrototypeMode) {
      setItems((current) => {
        const selectedSet = new Set(ids);
        const targets = current.filter((task) => selectedSet.has(task.id));
        const nextPinned = !targets.every((task) => task.pinned);
        return current.map((task) => (selectedSet.has(task.id) ? { ...task, pinned: nextPinned } : task));
      });
      return;
    }
    void (async () => {
      setErrorKey(null);
      try {
        await useCases.togglePinTasks(ids);
        const loaded = await useCases.listTasks();
        if (mountedRef.current) {
          setItems(loaded.map(toTaskListItem));
        }
      } catch (caught) {
        if (mountedRef.current) {
          setErrorKey(resolveErrorKey(caught, "error.save"));
        }
      }
    })();
  }, [isPrototypeMode, selectedIds, useCases]);

  const requestDelete = useCallback(() => {
    if ((selectedIds ?? []).length > 0) setConfirmDeleteVisible(true);
  }, [selectedIds]);
  const cancelDelete = useCallback(() => setConfirmDeleteVisible(false), []);

  const confirmDelete = useCallback(() => {
    const ids = selectedIds ?? [];
    setConfirmDeleteVisible(false);
    setSelectedIds(null);
    if (ids.length === 0) {
      return;
    }
    if (isPrototypeMode) {
      setItems((current) => current.filter((task) => !ids.includes(task.id)));
      return;
    }
    void (async () => {
      setErrorKey(null);
      try {
        await useCases.deleteTasks(ids);
        const loaded = await useCases.listTasks();
        if (mountedRef.current) {
          setItems(loaded.map(toTaskListItem));
        }
      } catch (caught) {
        if (mountedRef.current) {
          setErrorKey(resolveErrorKey(caught, "error.save"));
        }
      }
    })();
  }, [isPrototypeMode, selectedIds, useCases]);

  const selectionMode = selectedIds !== null;
  const navigation = useNavigation();

  // Recarrega ao voltar para a aba, para refletir o que mudou em Nova tarefa.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  // A barra de abas some durante a seleção múltipla, para dar lugar à barra de ações.
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

  const handleCreateTask = useCallback(() => {
    router.navigate({ pathname: "/new-task", params: { id: "" } });
  }, []);

  const handleEditTask = useCallback((id: string) => {
    router.navigate({ pathname: "/new-task", params: { id } });
  }, []);

  return [
    {
      visibleTasks,
      pendingCount: items.filter((task) => !task.completed).length,
      totalCount: items.length,
      filter,
      selectionMode,
      selectedIds: selectedIds ?? [],
      allSelectedPinned,
      confirmDeleteVisible,
      loading,
      errorKey,
    },
    {
      selectFilter: setFilter,
      toggleCompleted,
      startSelection,
      toggleSelected,
      cancelSelection,
      selectAll,
      pinSelected,
      requestDelete,
      cancelDelete,
      confirmDelete,
      reload,
      handleCreateTask,
      handleEditTask,
    },
  ];
};
