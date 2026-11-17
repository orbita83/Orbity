import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { container, resolveUseCase } from "@/DI/container";
import { DEFAULT_ROUTINE_ICON, type RoutineIcon, type RoutineTaskDraft } from "@/model/entities/routine";
import { ValidationError } from "@/model/errors/domain-error";
import type { IRoutineUseCases } from "@/usecase/i-routine-use-cases";

export type NewRoutineState = {
  name: string;
  icon: RoutineIcon;
  description: string;
  /** Dias ativos, 0 = domingo, em ordem (RF-0012). */
  days: number[];
  tasks: string[];
  draft: string;
  nameError: boolean;
  daysError: boolean;
  /** Falha ao carregar ou salvar, com o formulário preservado. */
  formError: string | null;
  submitting: boolean;
  /** Salvou: criou a rotina ou, na edição, gravou as alterações. */
  created: boolean;
  /** Editando uma rotina que já existe (RF-0009, #137). */
  editing: boolean;
  /** Carregando a rotina a editar. */
  loading: boolean;
  /** Confirmação "Descartar alterações?" aberta. */
  discardVisible: boolean;
};

export type NewRoutineActions = {
  setName: (value: string) => void;
  setIcon: (icon: RoutineIcon) => void;
  setDescription: (value: string) => void;
  toggleDay: (day: number) => void;
  setDraft: (value: string) => void;
  addTask: () => void;
  removeTask: (index: number) => void;
  moveTaskUp: (index: number) => void;
  submit: () => void;
  reset: () => void;
  /** `true` quando pode sair já; na edição com alterações, abre a confirmação e devolve `false`. */
  requestLeave: () => boolean;
  /** "Continuar editando": fecha a confirmação. */
  cancelLeave: () => void;
  /** Limpa o formulário e sai: para o detalhe na edição, para a lista na criação (FL-0007, passo 4). */
  handleLeave: () => void;
};

type FormFields = {
  name: string;
  icon: RoutineIcon;
  description: string;
  days: number[];
  /** Tarefas com `id` já existem; sem `id`, são novas (RoutineTaskDraft). */
  items: RoutineTaskDraft[];
};

const EMPTY_FIELDS: FormFields = { name: "", icon: DEFAULT_ROUTINE_ICON, description: "", days: [], items: [] };
const SAVE_FAILED = "Não foi possível salvar a rotina agora. Tente de novo.";
const LOAD_FAILED = "Não foi possível carregar a rotina agora. Tente de novo.";
const NOT_FOUND = "Esta rotina não está mais na sua lista.";

const snapshotOf = (fields: FormFields): string => JSON.stringify(fields);

/**
 * Estado do formulário de Nova rotina (protótipo 3.1, RF-0007 e RF-0012) e da edição (RF-0009,
 * UC-0007, #137), que reaproveita o mesmo formulário quando recebe `routineId`. Nome e pelo menos
 * um dia são obrigatórios, e o que foi digitado nunca se perde num erro.
 */
export const useNewRoutineViewModel = (
  routineUseCases?: IRoutineUseCases,
  routineId?: string,
): NewRoutineState & NewRoutineActions => {
  const useCases = resolveUseCase(routineUseCases, container.useCases.routines);
  // O `id` vem da rota (`/new-routine?id=...`); o parâmetro `routineId` substitui a rota em testes e histórias.
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const requestedId = routineId ?? routeId;
  const editingId = requestedId && requestedId.trim().length > 0 ? requestedId.trim() : undefined;
  const editing = Boolean(editingId);

  const [trackedId, setTrackedId] = useState(editingId);
  const [fields, setFields] = useState<FormFields>(EMPTY_FIELDS);
  const [baseline, setBaseline] = useState(() => snapshotOf(EMPTY_FIELDS));
  const [draft, setDraft] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [discardVisible, setDiscardVisible] = useState(false);
  const mounted = useRef(true);

  // A tela fica montada na pilha: outra rotina (ou a criação) recomeça o formulário do zero.
  if (trackedId !== editingId) {
    setTrackedId(editingId);
    setFields(EMPTY_FIELDS);
    setBaseline(snapshotOf(EMPTY_FIELDS));
    setDraft("");
    setShowErrors(false);
    setFormError(null);
    setSubmitting(false);
    setCreated(false);
    setLoading(Boolean(editingId));
    setDiscardVisible(false);
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // RF-0009 CA-02: a edição abre com as informações atuais da rotina.
  useEffect(() => {
    if (!editingId) return;
    let active = true;
    useCases.getRoutine(editingId).then(
      (details) => {
        if (!active) return;
        setLoading(false);
        if (!details) {
          setFormError(NOT_FOUND);
          return;
        }
        const loaded: FormFields = {
          name: details.routine.title,
          icon: details.routine.icon,
          description: details.routine.description ?? "",
          days: [...details.routine.days],
          items: details.tasks.map(({ task }) => ({ id: task.id, title: task.title })),
        };
        setFields(loaded);
        setBaseline(snapshotOf(loaded));
      },
      () => {
        if (!active) return;
        setLoading(false);
        setFormError(LOAD_FAILED);
      },
    );
    return () => {
      active = false;
    };
  }, [editingId, useCases]);

  const update = useCallback((change: (current: FormFields) => FormFields) => setFields(change), []);
  const setName = useCallback((name: string) => update((current) => ({ ...current, name })), [update]);
  const setIcon = useCallback((icon: RoutineIcon) => update((current) => ({ ...current, icon })), [update]);
  const setDescription = useCallback(
    (description: string) => update((current) => ({ ...current, description })),
    [update],
  );

  const toggleDay = useCallback(
    (day: number) =>
      update((current) => ({
        ...current,
        days: current.days.includes(day)
          ? current.days.filter((item) => item !== day)
          : [...current.days, day].sort((a, b) => a - b),
      })),
    [update],
  );

  const addTask = useCallback(() => {
    const title = draft.trim();
    if (title === "") return;
    update((current) => ({ ...current, items: [...current.items, { title }] }));
    setDraft("");
  }, [draft, update]);

  const removeTask = useCallback(
    (index: number) => update((current) => ({ ...current, items: current.items.filter((_, i) => i !== index) })),
    [update],
  );
  const moveTaskUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      update((current) => {
        const items = [...current.items];
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        return { ...current, items };
      });
    },
    [update],
  );

  const nameMissing = fields.name.trim() === "";
  const daysMissing = fields.days.length === 0;
  const submit = useCallback(() => {
    if (submitting || loading) return;
    if (nameMissing || daysMissing) {
      setShowErrors(true);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    const { name, description, icon, days, items } = fields;
    const saving = editingId
      ? useCases.updateRoutine({ id: editingId, title: name, description, icon, days, tasks: items })
      : useCases.createRoutine({ title: name, description, icon, days, tasks: items.map((item) => item.title) });
    saving.then(
      () => {
        if (!mounted.current) return;
        setSubmitting(false);
        setCreated(true);
      },
      (caught: unknown) => {
        if (!mounted.current) return;
        setSubmitting(false);
        setFormError(caught instanceof ValidationError ? caught.message : SAVE_FAILED);
      },
    );
  }, [daysMissing, editingId, fields, loading, nameMissing, submitting, useCases]);

  const reset = useCallback(() => {
    setFields(EMPTY_FIELDS);
    setBaseline(snapshotOf(EMPTY_FIELDS));
    setDraft("");
    setShowErrors(false);
    setFormError(null);
    setSubmitting(false);
    setCreated(false);
    setDiscardVisible(false);
  }, []);

  const dirty = snapshotOf(fields) !== baseline || draft.trim() !== "";
  const requestLeave = useCallback(() => {
    // Só a edição pergunta: sair da criação continua como no protótipo 3.1 ("Voltar sem criar").
    if (editing && dirty && !created) {
      setDiscardVisible(true);
      return false;
    }
    return true;
  }, [created, dirty, editing]);
  const cancelLeave = useCallback(() => setDiscardVisible(false), []);

  const tasks = useMemo(() => fields.items.map((item) => item.title), [fields.items]);

  const handleLeave = useCallback(() => {
    reset();
    router.setParams({ id: "" });
    if (editingId) {
      router.navigate({ pathname: "/routine-details", params: { id: editingId } });
    } else {
      router.navigate("/routines");
    }
  }, [editingId, reset]);

  return {
    name: fields.name,
    icon: fields.icon,
    description: fields.description,
    days: fields.days,
    tasks,
    draft,
    nameError: showErrors && nameMissing,
    daysError: showErrors && daysMissing,
    formError,
    submitting,
    created,
    editing,
    loading,
    discardVisible,
    setName,
    setIcon,
    setDescription,
    toggleDay,
    setDraft,
    addTask,
    removeTask,
    moveTaskUp,
    submit,
    reset,
    requestLeave,
    cancelLeave,
    handleLeave,
  };
};
