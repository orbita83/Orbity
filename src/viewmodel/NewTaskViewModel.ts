import { useCallback, useState } from "react";

export type NewTaskFields = {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

export type NewTaskState = {
  fields: NewTaskFields;
  /** Erro de validação do título, mostrado só depois de tentar criar. */
  titleError: boolean;
  created: boolean;
};

export type NewTaskActions = {
  setField: (field: keyof NewTaskFields, value: string) => void;
  submit: () => void;
  reset: () => void;
};

const EMPTY_FIELDS: NewTaskFields = { title: "", description: "", startDate: "", startTime: "", endDate: "", endTime: "" };

/**
 * Estado do formulário de Nova tarefa (protótipo 2.1 e 2.2). Valida o título obrigatório e mantém
 * o que foi digitado. Provisório: a criação de verdade entra quando o caso de uso de Tarefas existir.
 */
export const useNewTaskViewModel = (): NewTaskState & NewTaskActions => {
  const [fields, setFields] = useState<NewTaskFields>(EMPTY_FIELDS);
  const [showErrors, setShowErrors] = useState(false);
  const [created, setCreated] = useState(false);

  const setField = useCallback((field: keyof NewTaskFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
  }, []);

  const titleMissing = fields.title.trim() === "";
  const submit = useCallback(() => {
    if (titleMissing) {
      setShowErrors(true);
      return;
    }
    setCreated(true);
  }, [titleMissing]);

  const reset = useCallback(() => {
    setFields(EMPTY_FIELDS);
    setShowErrors(false);
    setCreated(false);
  }, []);

  return { fields, titleError: showErrors && titleMissing, created, setField, submit, reset };
};
