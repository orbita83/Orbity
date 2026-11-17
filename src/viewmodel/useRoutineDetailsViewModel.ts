import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { container, resolveUseCase } from "@/DI/container";
import type { RoutineIcon, RoutineDetails as RoutineDetailsEntity } from "@/model/entities/routine";
import type { IRoutineUseCases } from "@/usecase/i-routine-use-cases";

export type RoutineTaskItem = { id: string; title: string; done: boolean };

/** Rotina como o detalhe a apresenta (view data preparada pela ViewModel). */
export type RoutineDetails = {
  id: string;
  title: string;
  description?: string;
  icon: RoutineIcon;
  days: number[];
  /** Horário já formatado, como "07:00–07:45". Sem requisito de horário ainda, fica vazio (rotinas.md). */
  timeLabel?: string;
  tasks: RoutineTaskItem[];
  /** Hoje é um dos dias da rotina; fora deles, a conclusão fica bloqueada (R6). */
  activeToday: boolean;
  /** Ocorrência de hoje concluída (RF-0011). Não depende de todas as tarefas estarem marcadas (R3). */
  doneToday: boolean;
};

export type RoutineDetailsErrorKey = "error.load" | "error.save";

export type RoutineDetailsState = {
  /** `null` quando a rotina não existe (ex.: aberta por um link antigo ou excluída). */
  routine: RoutineDetails | null;
  completedCount: number;
  doneToday: boolean;
  confirmDeleteVisible: boolean;
  loading: boolean;
  errorKey: RoutineDetailsErrorKey | null;
};

export type RoutineDetailsActions = {
  toggleTask: (id: string) => void;
  moveTaskUp: (index: number) => void;
  completeAll: () => void;
  undoAll: () => void;
  requestDelete: () => void;
  cancelDelete: () => void;
  reload: () => Promise<void>;
  /** Volta para a lista de Rotinas. */
  handleBack: () => void;
  /** Abre a edição da rotina. */
  handleEdit: (id: string) => void;
  /** Depois de confirmar a exclusão, volta para a lista, que exclui e oferece "Desfazer". */
  handleDeleted: (id: string) => void;
};

const toDetails = (entity: RoutineDetailsEntity): RoutineDetails => ({
  id: entity.routine.id,
  title: entity.routine.title,
  description: entity.routine.description,
  icon: entity.routine.icon,
  days: [...entity.routine.days],
  tasks: entity.tasks.map(({ task, checkedToday }) => ({ id: task.id, title: task.title, done: checkedToday })),
  activeToday: entity.activeToday,
  doneToday: entity.doneToday,
});

const swapUp = <T,>(items: T[], index: number): T[] => {
  if (index <= 0 || index >= items.length) return items;
  const next = [...items];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return next;
};

/**
 * Estado do detalhe da rotina (protótipo 3.2 e 3.3, padrão F8 e RF-0011).
 * - `source` texto: id da rotina, carregado pelo `IRoutineUseCases`.
 * - `source` objeto: rotina de protótipo, só em memória (Storybook e testes de apresentação).
 * - sem `source`: usa o `id` da rota (`/routine-details?id=...`); sem ele, a rotina fica indisponível.
 */
export const useRoutineDetailsViewModel = (
  source?: string | RoutineDetails | null,
  routineUseCases?: IRoutineUseCases,
): [RoutineDetailsState, RoutineDetailsActions] => {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const resolvedSource = source ?? routeId;
  const isPrototypeMode = typeof resolvedSource === "object" && resolvedSource !== null;
  const routineId = typeof resolvedSource === "string" && resolvedSource !== "" ? resolvedSource : null;
  const useCases = resolveUseCase(routineUseCases, container.useCases.routines);

  const [routine, setRoutine] = useState<RoutineDetails | null>(isPrototypeMode ? resolvedSource : null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [loading, setLoading] = useState(routineId !== null);
  const [errorKey, setErrorKey] = useState<RoutineDetailsErrorKey | null>(null);
  const mounted = useRef(true);
  const latestRequest = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** Aplica a resposta mais nova do caso de uso; uma falha vira aviso sem apagar a tela. Diz se deu certo. */
  const track = useCallback((promise: Promise<RoutineDetailsEntity | null>, failure: RoutineDetailsErrorKey): Promise<boolean> => {
    const request = ++latestRequest.current;
    const isCurrent = () => mounted.current && request === latestRequest.current;
    return promise.then(
      (loaded) => {
        if (isCurrent()) {
          setRoutine(loaded ? toDetails(loaded) : null);
          setErrorKey(null);
          setLoading(false);
        }
        return true;
      },
      () => {
        if (isCurrent()) {
          setErrorKey(failure);
          setLoading(false);
        }
        return false;
      },
    );
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    if (routineId === null) return;
    await track(useCases.getRoutine(routineId), "error.load");
  }, [routineId, track, useCases]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Mostra o resultado na hora e confirma pelo caso de uso; em falha, recarrega o estado verdadeiro. */
  const act = useCallback(
    (update: (current: RoutineDetails) => RoutineDetails, call: (id: string) => Promise<RoutineDetailsEntity>) => {
      if (!routine) return;
      setRoutine(update(routine));
      if (isPrototypeMode) return;
      const id = routine.id;
      void track(call(id), "error.save").then((ok) => {
        if (ok || !mounted.current) return;
        // Depois de uma falha, mostra o que ficou salvo e mantém o aviso.
        useCases.getRoutine(id).then(
          (loaded) => {
            if (mounted.current && loaded) setRoutine(toDetails(loaded));
          },
          () => undefined,
        );
      });
    },
    [isPrototypeMode, routine, track, useCases],
  );

  const toggleTask = useCallback(
    (id: string) => {
      if (!routine?.activeToday) return;
      act(
        (current) => ({ ...current, tasks: current.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)) }),
        (routineKey) => useCases.toggleRoutineTask(routineKey, id),
      );
    },
    [act, routine?.activeToday, useCases],
  );

  const moveTaskUp = useCallback(
    (index: number) =>
      act(
        (current) => ({ ...current, tasks: swapUp(current.tasks, index) }),
        (routineKey) => useCases.moveRoutineTaskUp(routineKey, index),
      ),
    [act, useCases],
  );

  const completeAll = useCallback(() => {
    if (!routine?.activeToday) return;
    act(
      (current) => ({ ...current, doneToday: true, tasks: current.tasks.map((task) => ({ ...task, done: true })) }),
      (routineKey) => useCases.completeOccurrence(routineKey),
    );
  }, [act, routine?.activeToday, useCases]);

  const undoAll = useCallback(() => {
    if (!routine?.activeToday) return;
    act(
      (current) => ({ ...current, doneToday: false, tasks: current.tasks.map((task) => ({ ...task, done: false })) }),
      (routineKey) => useCases.reopenOccurrence(routineKey),
    );
  }, [act, routine?.activeToday, useCases]);

  // Recarrega ao ganhar foco: a ocorrência de hoje pode ter mudado pela lista, e a rotina pela edição.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const handleBack = useCallback(() => {
    router.navigate("/routines");
  }, []);

  const handleEdit = useCallback((id: string) => {
    router.navigate({ pathname: "/new-routine", params: { id } });
  }, []);

  const handleDeleted = useCallback((id: string) => {
    router.navigate({ pathname: "/routines", params: { deleted: id } });
  }, []);

  return [
    {
      routine,
      completedCount: routine?.tasks.filter((task) => task.done).length ?? 0,
      doneToday: routine?.doneToday ?? false,
      confirmDeleteVisible,
      loading,
      errorKey,
    },
    {
      toggleTask,
      moveTaskUp,
      completeAll,
      undoAll,
      requestDelete: useCallback(() => setConfirmDeleteVisible(true), []),
      cancelDelete: useCallback(() => setConfirmDeleteVisible(false), []),
      reload,
      handleBack,
      handleEdit,
      handleDeleted,
    },
  ];
};
