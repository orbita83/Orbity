import type { TaskListItem } from "@/viewmodel/useTasksViewModel";

/** Tarefas do protótipo 2 (Claude Design), só para histórias e testes; o app começa sem tarefas. */
export const PROTOTYPE_TASKS: readonly TaskListItem[] = [
  { id: "a", title: "Estudar para a prova de Cálculo", dueLabel: "19/10 · 08:00–09:00", completed: false, pinned: false },
  { id: "b", title: "Estudar para PDM", dueLabel: "19/10 · 10:00–11:30", completed: false, pinned: false },
  { id: "c", title: "Estudar para IHC", dueLabel: "20/10 · 14:00–15:00", completed: false, pinned: false },
  { id: "d", title: "Revisar princípios SOLID", dueLabel: "18/10 · 18:10–19:00", completed: true, pinned: false },
];
