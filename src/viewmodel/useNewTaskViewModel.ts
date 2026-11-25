import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { container, resolveUseCase } from "@/di/container";
import { DEFAULT_CATEGORY_IDS, type Category } from "@/model/entities/category";
import type { LocalDate } from "@/model/entities/localDate";
import { isTaskCategoryId, type TaskCategoryId } from "@/model/entities/task";
import { ValidationError } from "@/model/errors";
import type { ITaskUseCases } from "@/usecase/iTaskUseCases";

export type NewTaskPickerField = "startDate" | "startTime" | "endDate" | "endTime" | "category";

export type NewTaskTextField = "title" | "description" | "startDate" | "startTime" | "endDate" | "endTime";

export type TaskPickerOption = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
};

export type NewTaskFields = {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  category?: TaskCategoryId;
};

export type NewTaskState = {
  fields: NewTaskFields;
  /** Erro de validação do título, mostrado só depois de tentar criar. */
  titleError: boolean;
  /** Erro de validação de datas/horários ou falha ao salvar, preservando o formulário. */
  formError: string | null;
  /** Aviso acolhedor e não bloqueante quando a permissão de notificações não está concedida (RF-0021 CA-05). */
  reminderPermissionNotice?: string | null;
  activePicker: NewTaskPickerField | null;
  dateOptions: readonly TaskPickerOption[];
  timeOptions: readonly TaskPickerOption[];
  /** Ids das categorias do seletor; a view decide rótulo e ícone de cada uma (issues #159 e #213). */
  categoryOptions: readonly TaskCategoryId[];
  /** Categorias completas salvas no DataSource para exibir nome e ícone personalizados (issue #213). */
  categories?: readonly Category[];
  submitting: boolean;
  created: boolean;
  editing?: boolean;
};

export type NewTaskActions = {
  setField: (field: NewTaskTextField, value: string) => void;
  /** Recebe o valor do seletor (id da categoria ou vazio para "Sem categoria"). */
  selectCategory: (value?: string) => void;
  openPicker: (picker: NewTaskPickerField) => void;
  closePicker: () => void;
  submit: () => void;
  reset: () => void;
  /** Limpa o formulário e volta para a lista de Tarefas (fechar ou depois de salvar). */
  handleClose: () => void;
};

const EMPTY_FIELDS: NewTaskFields = {
  title: "",
  description: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  category: undefined,
};

const DEFAULT_FALLBACK_CATEGORIES: readonly Category[] = Object.freeze(
  DEFAULT_CATEGORY_IDS.map((id) =>
    Object.freeze({
      id,
      icon: id,
      isDefault: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }),
  ),
);

const WEEKDAYS_PT = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."] as const;
const PICKER_DAYS = 14;

const pad2 = (value: number): string => String(value).padStart(2, "0");

const toDisplayDate = (date: LocalDate): string => `${pad2(date.day)}/${pad2(date.month)}/${date.year}`;

/** Gera opções de data a partir da data local atual (Hoje, Amanhã e próximos dias). */
export function buildDatePickerOptions(today: LocalDate): readonly TaskPickerOption[] {
  const options: TaskPickerOption[] = [{ id: "clear", label: "Sem data", value: "" }];
  for (let offset = 0; offset < PICKER_DAYS; offset += 1) {
    const candidate = today.addDays(offset);
    const display = toDisplayDate(candidate);
    if (offset === 0) {
      options.push({ id: "today", label: "Hoje", hint: display, value: display });
    } else if (offset === 1) {
      options.push({ id: "tomorrow", label: "Amanhã", hint: display, value: display });
    } else {
      const weekday = WEEKDAYS_PT[new Date(Date.UTC(candidate.year, candidate.month - 1, candidate.day)).getUTCDay()];
      options.push({
        id: candidate.toString(),
        label: `${weekday}, ${display.slice(0, 5)}`,
        hint: display,
        value: display,
      });
    }
  }
  return Object.freeze(options);
}

/** Gera horários em intervalos de 30 minutos no padrão 24h. */
export const TIME_PICKER_OPTIONS: readonly TaskPickerOption[] = Object.freeze([
  Object.freeze({ id: "clear", label: "Sem horário", value: "" }),
  ...Array.from({ length: 48 }, (_, index) => {
    const hour = Math.floor(index / 2);
    const minute = index % 2 === 0 ? "00" : "30";
    const value = `${pad2(hour)}:${minute}`;
    return Object.freeze({ id: value, label: value, value });
  }),
]);

function extractDigitsFromSegments(value: string, separatorPattern: RegExp, maxPadIndex: number): string {
  const rawSegments = value.split(separatorPattern);
  return rawSegments
    .map((segment, index) => {
      const digits = segment.replace(/\D/g, "");
      const hasFollowingSeparator = index < rawSegments.length - 1;
      if (index <= maxPadIndex && hasFollowingSeparator && digits.length === 1) {
        return `0${digits}`;
      }
      return digits;
    })
    .join("");
}

/** Máscara de digitação: formata aos poucos uma data no padrão brasileiro `dd/mm/aaaa` (tarefas.md, T7). */
export function formatDisplayDateInput(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }

  const trailingSeparator = /[/.-]$/.test(trimmed);
  const digits = extractDigitsFromSegments(trimmed, /[/.-]+/, 1).slice(0, 8);
  if (digits.length === 0) {
    return "";
  }
  if (digits.length <= 2) {
    return digits.length === 2 && trailingSeparator ? `${digits}/` : digits;
  }
  if (digits.length <= 4) {
    const formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits.length === 4 && trailingSeparator ? `${formatted}/` : formatted;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/** Máscara de digitação: formata aos poucos um horário 24h no padrão `hh:mm` (tarefas.md, T7). */
export function formatDisplayTimeInput(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }

  const trailingSeparator = /[:hH.-]$/.test(trimmed);
  const hasSeparator = /[:hH.-]/.test(trimmed);
  let digits = extractDigitsFromSegments(trimmed, /[:hH.-]+/, 0);
  if (digits.length === 0) {
    return "";
  }
  if (!hasSeparator && digits.length >= 2 && digits[0] >= "3") {
    digits = `0${digits}`;
  }
  digits = digits.slice(0, 4);

  if (digits.length <= 2) {
    return digits.length === 2 && trailingSeparator ? `${digits}:` : digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

/**
 * Estado e ações do formulário de Nova tarefa conectado ao domínio e à persistência.
 * As regras (título obrigatório, datas válidas) ficam no Use Case; a ViewModel só mostra o erro.
 */
export const useNewTaskViewModel = (taskUseCases?: ITaskUseCases): [NewTaskState, NewTaskActions] => {
  const useCases = resolveUseCase(taskUseCases, container.useCases.tasks);
  // O `id` vem da rota (`/new-task?id=...`).
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const routeTaskId = Array.isArray(params.id) ? params.id[0] : params.id;
  const normalizedTaskId = routeTaskId && routeTaskId.trim().length > 0 ? routeTaskId.trim() : undefined;
  const editing = Boolean(normalizedTaskId);

  const [trackedTaskId, setTrackedTaskId] = useState<string | undefined>(normalizedTaskId);
  const [fields, setFields] = useState<NewTaskFields>(EMPTY_FIELDS);
  const [titleError, setTitleError] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reminderPermissionNotice, setReminderPermissionNotice] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<NewTaskPickerField | null>(null);
  const [categories, setCategories] = useState<readonly Category[]>(DEFAULT_FALLBACK_CATEGORIES);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const mountedRef = useRef(true);

  if (trackedTaskId !== normalizedTaskId) {
    setTrackedTaskId(normalizedTaskId);
    setFields(EMPTY_FIELDS);
    setTitleError(false);
    setFormError(null);
    setReminderPermissionNotice(null);
    setActivePicker(null);
    setSubmitting(false);
    setCreated(false);
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadCategories = useCallback(() => {
    if (!useCases.listCategories) {
      return;
    }
    useCases.listCategories().then(
      (loaded) => {
        if (mountedRef.current) {
          setCategories(loaded);
        }
      },
      () => undefined,
    );
  }, [useCases]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories]),
  );

  useEffect(() => {
    if (!normalizedTaskId) {
      return;
    }

    let active = true;
    useCases.getTask(normalizedTaskId).then(
      (found) => {
        if (!active) {
          return;
        }
        setFields({
          title: found.title,
          description: found.description ?? "",
          startDate: found.startDate ?? "",
          startTime: found.startTime ?? "",
          endDate: found.endDate ?? "",
          endTime: found.endTime ?? "",
          category: found.category,
        });
      },
      () => {
        if (active) {
          setFormError("Não foi possível carregar a tarefa agora.");
        }
      },
    );

    return () => {
      active = false;
    };
  }, [normalizedTaskId, useCases]);

  const dateOptions = useMemo(() => buildDatePickerOptions(useCases.todayLocal()), [useCases]);

  const setField = useCallback((field: NewTaskTextField, value: string) => {
    const formatted =
      field === "startDate" || field === "endDate"
        ? formatDisplayDateInput(value)
        : field === "startTime" || field === "endTime"
          ? formatDisplayTimeInput(value)
          : value;
    setFields((current) => ({ ...current, [field]: formatted }));
    if (field === "title") {
      setTitleError(false);
    }
    setFormError(null);
  }, []);

  const selectCategory = useCallback(
    (value?: string) => {
      const trimmed = value?.trim();
      const allowed =
        Boolean(trimmed) &&
        (categories.some((item) => item.id === trimmed) ||
          (!useCases.listCategories && isTaskCategoryId(trimmed!)));
      const category = allowed ? trimmed : undefined;
      setFields((current) => ({ ...current, category }));
      setActivePicker(null);
      setFormError(null);
    },
    [categories, useCases.listCategories],
  );

  const openPicker = useCallback((picker: NewTaskPickerField) => {
    setActivePicker(picker);
  }, []);

  const closePicker = useCallback(() => {
    setActivePicker(null);
  }, []);

  const submit = useCallback(() => {
    if (submitting) {
      return;
    }

    setTitleError(false);
    setFormError(null);
    setReminderPermissionNotice(null);
    setSubmitting(true);

    void (async () => {
      try {
        if (normalizedTaskId) {
          await useCases.updateTask({
            id: normalizedTaskId,
            title: fields.title,
            description: fields.description.trim() || null,
            startDate: fields.startDate.trim() || null,
            startTime: fields.startTime.trim() || null,
            endDate: fields.endDate.trim() || null,
            endTime: fields.endTime.trim() || null,
            category: fields.category ?? null,
          });
        } else {
          await useCases.createTask(fields);
        }
        if (fields.startDate.trim() && fields.startTime.trim() && useCases.ensureReminderPermission) {
          const status = await useCases.ensureReminderPermission();
          if (mountedRef.current && status !== "granted") {
            setReminderPermissionNotice(
              "Tarefa salva! Para receber lembretes no horário agendado, ative as notificações nas configurações do aparelho.",
            );
          }
        }
        if (mountedRef.current) {
          setCreated(true);
        }
      } catch (caught) {
        if (!mountedRef.current) {
          return;
        }
        if (caught instanceof ValidationError && caught.field === "title") {
          // O texto do erro do título fica na View (TASKS_COPY), junto do campo.
          setTitleError(true);
        } else {
          setFormError(
            caught instanceof ValidationError ? caught.message : "Não foi possível salvar a tarefa agora.",
          );
        }
      } finally {
        if (mountedRef.current) {
          setSubmitting(false);
        }
      }
    })();
  }, [fields, normalizedTaskId, submitting, useCases]);

  const reset = useCallback(() => {
    setFields(EMPTY_FIELDS);
    setTitleError(false);
    setFormError(null);
    setReminderPermissionNotice(null);
    setActivePicker(null);
    setSubmitting(false);
    setCreated(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    router.setParams({ id: "" });
    router.navigate("/tasks");
  }, [reset]);

  const categoryOptions = useMemo(() => categories.map((item) => item.id), [categories]);

  return [
    {
      fields,
      titleError,
      formError,
      reminderPermissionNotice,
      activePicker,
      dateOptions,
      timeOptions: TIME_PICKER_OPTIONS,
      categoryOptions,
      categories,
      submitting,
      created,
      editing,
    },
    {
      setField,
      selectCategory,
      openPicker,
      closePicker,
      submit,
      reset,
      handleClose,
    },
  ];
};
