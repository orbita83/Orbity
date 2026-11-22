import type { RoutineDetails } from "@/viewmodel/useRoutineDetailsViewModel";
import type { RoutineListItem } from "@/viewmodel/useRoutinesViewModel";

/** Rotinas do protótipo 3 (Claude Design), só para histórias e testes; o app começa sem rotinas. */
export const PROTOTYPE_ROUTINES: readonly RoutineListItem[] = [
  { id: "mat", title: "Matemática", icon: "mathematics", days: [1, 2, 3, 4, 5], taskCount: 3, activeToday: true, doneToday: true },
  { id: "ing", title: "Inglês", icon: "languages", days: [1, 3, 5], taskCount: 2, activeToday: true, doneToday: false },
  {
    id: "leitura",
    title: "Leitura antes de dormir",
    icon: "reading",
    days: [0, 1, 2, 3, 4, 5, 6],
    taskCount: 1,
    activeToday: true,
    doneToday: false,
  },
];

/** Rotina fora do dia de hoje (rotinas.md, R6): aparece na lista com a conclusão bloqueada. */
export const PROTOTYPE_INACTIVE_ROUTINE: RoutineListItem = {
  id: "fds",
  title: "Revisão de fim de semana",
  icon: "general",
  days: [0, 6],
  taskCount: 2,
  activeToday: false,
  doneToday: false,
};

/** Rotina do protótipo 3.2. */
export const PROTOTYPE_ROUTINE_DETAILS: RoutineDetails = {
  id: "mat",
  title: "Matemática",
  description: "Minha rotina diária de estudos de matemática.",
  icon: "mathematics",
  days: [1, 2, 3, 4, 5],
  timeLabel: "07:00–07:45",
  tasks: [
    { id: "a", title: "Revisar conteúdo de cálculo", done: true },
    { id: "b", title: "Resolver a lista de exercícios", done: false },
    { id: "c", title: "Revisar as anotações da aula", done: false },
  ],
  activeToday: true,
  doneToday: false,
};
