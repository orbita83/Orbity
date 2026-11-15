import { useCallback, useEffect, useRef, useState } from "react";
import { container, resolveUseCase } from "@/DI/container";
import { DEFAULT_ROUTINE_ICON, type RoutineIcon } from "@/model/entities/routine";
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
  /** Falha ao salvar, com o formulário preservado. */
  formError: string | null;
  submitting: boolean;
  created: boolean;
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
};

const SAVE_FAILED = "Não foi possível salvar a rotina agora. Tente de novo.";

/**
 * Estado do formulário de Nova rotina (protótipo 3.1, RF-0007 e RF-0012): nome e pelo menos um dia
 * são obrigatórios, e o que foi digitado nunca se perde num erro. Criar passa pelo `IRoutineUseCases`.
 */
export const useNewRoutineViewModel = (routineUseCases?: IRoutineUseCases): NewRoutineState & NewRoutineActions => {
  const useCases = resolveUseCase(routineUseCases, container.useCases.routines);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<RoutineIcon>(DEFAULT_ROUTINE_ICON);
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const toggleDay = useCallback((day: number) => {
    setDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b)));
  }, []);

  const addTask = useCallback(() => {
    const title = draft.trim();
    if (title === "") return;
    setTasks((current) => [...current, title]);
    setDraft("");
  }, [draft]);

  const removeTask = useCallback((index: number) => setTasks((current) => current.filter((_, i) => i !== index)), []);
  const moveTaskUp = useCallback((index: number) => {
    if (index <= 0) return;
    setTasks((current) => {
      const next = [...current];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const nameMissing = name.trim() === "";
  const daysMissing = days.length === 0;
  const submit = useCallback(() => {
    if (submitting) return;
    if (nameMissing || daysMissing) {
      setShowErrors(true);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    useCases.createRoutine({ title: name, description, icon, days, tasks }).then(
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
  }, [days, daysMissing, description, icon, name, nameMissing, submitting, tasks, useCases]);

  const reset = useCallback(() => {
    setName("");
    setIcon(DEFAULT_ROUTINE_ICON);
    setDescription("");
    setDays([]);
    setTasks([]);
    setDraft("");
    setShowErrors(false);
    setFormError(null);
    setSubmitting(false);
    setCreated(false);
  }, []);

  return {
    name,
    icon,
    description,
    days,
    tasks,
    draft,
    nameError: showErrors && nameMissing,
    daysError: showErrors && daysMissing,
    formError,
    submitting,
    created,
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
  };
};
