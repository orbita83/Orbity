import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { container, resolveUseCase } from "@/DI/container";
import type { LocalDate } from "@/model/entities/local-date";
import {
  TASK_CATEGORIES,
  type TaskCategoryIcon,
  type TaskCategoryId,
} from "@/model/entities/task";
import { ValidationError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/i-clock-service";
import type { ITaskUseCases } from "@/usecase/i-task-use-cases";

export type NewTaskPickerField = "startDate" | "startTime" | "endDate" | "endTime" | "category";

export type NewTaskTextField = "title" | "description" | "startDate" | "startTime" | "endDate" | "endTime";

export type TaskPickerOption = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
  readonly icon?: TaskCategoryIcon | "label";
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
  activePicker: NewTaskPickerField | null;
  dateOptions: readonly TaskPickerOption[];
  timeOptions: readonly TaskPickerOption[];
  categoryOptions: readonly TaskPickerOption[];
  submitting: boolean;
  created: boolean;
};

export type NewTaskActions = {
  setField: (field: NewTaskTextField, value: string) => void;
  selectCategory: (category?: TaskCategoryId) => void;
  openPicker: (picker: NewTaskPickerField) => void;
  closePicker: () => void;
  submit: () => void;
  reset: () => void;
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

/** Opções de categoria disponíveis no seletor da tarefa. */
export const CATEGORY_PICKER_OPTIONS: readonly TaskPickerOption[] = Object.freeze([
  Object.freeze({ id: "none", label: "Sem categoria", value: "", icon: "label" as const }),
  ...TASK_CATEGORIES.map((category) =>
    Object.freeze({
      id: category.id,
      label: category.label,
      value: category.id,
      icon: category.icon,
    }),
  ),
]);

/** Estado e ações do formulário de Nova tarefa conectado ao domínio e à persistência. */
export const useNewTaskViewModel = (
  taskUseCases?: ITaskUseCases,
  clockService?: IClockService,
): NewTaskState & NewTaskActions => {
  const useCases = resolveUseCase(taskUseCases, container.useCases.tasks);
  const clock = resolveUseCase(clockService, container.services.clock);

  const [fields, setFields] = useState<NewTaskFields>(EMPTY_FIELDS);
  const [showErrors, setShowErrors] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<NewTaskPickerField | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const dateOptions = useMemo(() => buildDatePickerOptions(clock.todayLocal()), [clock]);

  const setField = useCallback((field: NewTaskTextField, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
    setFormError(null);
  }, []);

  const selectCategory = useCallback((category?: TaskCategoryId) => {
    setFields((current) => ({ ...current, category }));
    setActivePicker(null);
    setFormError(null);
  }, []);

  const openPicker = useCallback((picker: NewTaskPickerField) => {
    setActivePicker(picker);
  }, []);

  const closePicker = useCallback(() => {
    setActivePicker(null);
  }, []);

  const titleMissing = fields.title.trim() === "";

  const submit = useCallback(() => {
    if (submitting) {
      return;
    }
    if (titleMissing) {
      setShowErrors(true);
      setFormError(null);
      return;
    }

    setShowErrors(false);
    setFormError(null);
    setSubmitting(true);

    void (async () => {
      try {
        await useCases.createTask(fields);
        if (mountedRef.current) {
          setCreated(true);
        }
      } catch (caught) {
        if (mountedRef.current) {
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
  }, [fields, submitting, titleMissing, useCases]);

  const reset = useCallback(() => {
    setFields(EMPTY_FIELDS);
    setShowErrors(false);
    setFormError(null);
    setActivePicker(null);
    setSubmitting(false);
    setCreated(false);
  }, []);

  return {
    fields,
    titleError: showErrors && titleMissing,
    formError,
    activePicker,
    dateOptions,
    timeOptions: TIME_PICKER_OPTIONS,
    categoryOptions: CATEGORY_PICKER_OPTIONS,
    submitting,
    created,
    setField,
    selectCategory,
    openPicker,
    closePicker,
    submit,
    reset,
  };
};
