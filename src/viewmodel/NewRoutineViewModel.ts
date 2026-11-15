import { useCallback, useState } from "react";
import type { RoutineIcon } from "./RoutinesViewModel";

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

/**
 * Estado do formulário de Nova rotina (protótipo 3.1, RF-0007 e RF-0012): nome e pelo menos um dia
 * são obrigatórios; o que foi digitado nunca se perde num erro. A criação de verdade entra com o
 * caso de uso de Rotinas.
 */
export const useNewRoutineViewModel = (): NewRoutineState & NewRoutineActions => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<RoutineIcon>("track_changes");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [created, setCreated] = useState(false);

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
    if (nameMissing || daysMissing) {
      setShowErrors(true);
      return;
    }
    setCreated(true);
  }, [daysMissing, nameMissing]);

  const reset = useCallback(() => {
    setName("");
    setIcon("track_changes");
    setDescription("");
    setDays([]);
    setTasks([]);
    setDraft("");
    setShowErrors(false);
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
