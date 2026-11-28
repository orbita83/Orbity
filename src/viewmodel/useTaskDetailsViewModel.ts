import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { container, resolveUseCase } from "@/di/container";
import { createDefaultCategories, type Category } from "@/model/entities/category";
import type { Task, TaskCategoryId } from "@/model/entities/task";
import type { ITaskUseCases } from "@/usecase/iTaskUseCases";

/** Tarefa como o detalhe a apresenta (protótipo 2.4), com datas e horários já em texto. */
export type TaskDetails = {
  id: string;
  title: string;
  description?: string;
  /** Início, como "19/10/2026 · 08:00". */
  startLabel?: string;
  /** Término, como "19/10/2026 · 09:00". */
  endLabel?: string;
  category?: TaskCategoryId;
  completed: boolean;
};

export type TaskDetailsErrorKey = "error.load" | "error.save";

export type TaskDetailsState = {
  /** `null` quando a tarefa não existe (excluída ou aberta por um link antigo). */
  task: TaskDetails | null;
  categories: readonly Category[];
  loading: boolean;
  errorKey: TaskDetailsErrorKey | null;
};

export type TaskDetailsActions = {
  toggleCompleted: () => void;
  reload: () => Promise<void>;
  /** Volta para a lista de Tarefas. */
  handleBack: () => void;
  /** Abre o formulário de edição da tarefa. */
  handleEdit: () => void;
};

const joinLabel = (date?: string, time?: string) => [date, time].filter(Boolean).join(" · ") || undefined;

const toDetails = (task: Task): TaskDetails => ({
  id: task.id,
  title: task.title,
  description: task.description,
  startLabel: joinLabel(task.startDate, task.startTime),
  endLabel: joinLabel(task.endDate, task.endTime),
  category: task.category,
  completed: task.completed,
});

const DEFAULT_FALLBACK_CATEGORIES: readonly Category[] = createDefaultCategories();

/**
 * Estado do Detalhe da tarefa (protótipo 2.4, ODS 1.3). Carrega a tarefa pelo `id` da rota,
 * conclui ou reabre pelo botão do rodapé e leva à edição. A exclusão fica na lista ("•••" ou
 * toque longo), como no protótipo.
 * - `source` texto: id da tarefa; `source` objeto: tarefa de protótipo, só em memória (Storybook).
 */
export const useTaskDetailsViewModel = (
  source?: string | TaskDetails | null,
  taskUseCases?: ITaskUseCases,
): [TaskDetailsState, TaskDetailsActions] => {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const resolvedSource = source ?? routeId;
  const isPrototypeMode = typeof resolvedSource === "object" && resolvedSource !== null;
  const taskId = isPrototypeMode ? resolvedSource.id : typeof resolvedSource === "string" && resolvedSource !== "" ? resolvedSource : null;
  const useCases = resolveUseCase(taskUseCases, container.useCases.tasks);

  const [task, setTask] = useState<TaskDetails | null>(isPrototypeMode ? resolvedSource : null);
  const [categories, setCategories] = useState<readonly Category[]>(DEFAULT_FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(!isPrototypeMode && taskId !== null);
  const [errorKey, setErrorKey] = useState<TaskDetailsErrorKey | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    if (isPrototypeMode || taskId === null) {
      setLoading(false);
      return;
    }
    try {
      const [loaded, loadedCategories] = await Promise.all([useCases.getTask(taskId), useCases.listCategories()]);
      if (mounted.current) {
        setTask(toDetails(loaded));
        setCategories(loadedCategories);
        setErrorKey(null);
      }
    } catch {
      if (mounted.current) {
        setTask(null);
        setErrorKey("error.load");
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [isPrototypeMode, taskId, useCases]);

  // Recarrega ao ganhar foco, para refletir o que mudou na edição.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const toggleCompleted = useCallback(() => {
    if (!task) return;
    if (isPrototypeMode) {
      setTask({ ...task, completed: !task.completed });
      return;
    }
    void (async () => {
      setErrorKey(null);
      try {
        const updated = await useCases.toggleTaskCompletion(task.id);
        if (mounted.current) setTask(toDetails(updated));
      } catch {
        if (mounted.current) setErrorKey("error.save");
      }
    })();
  }, [isPrototypeMode, task, useCases]);

  const handleBack = useCallback(() => {
    router.navigate("/tasks");
  }, []);

  const handleEdit = useCallback(() => {
    if (taskId) router.navigate({ pathname: "/new-task", params: { id: taskId } });
  }, [taskId]);

  return [
    { task, categories, loading, errorKey },
    { toggleCompleted, reload, handleBack, handleEdit },
  ];
};
