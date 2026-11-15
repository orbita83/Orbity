import type { RoutineDetails } from "@/viewmodel/RoutineDetailsViewModel";
import type { RoutineListItem } from "@/viewmodel/RoutinesViewModel";

/** Rotinas do protótipo 3 (Claude Design), só para histórias e testes; o app começa sem rotinas. */
export const PROTOTYPE_ROUTINES: readonly RoutineListItem[] = [
  { id: "mat", title: "Matemática", icon: "calculate", days: [1, 2, 3, 4, 5], taskCount: 3, doneToday: true },
  { id: "ing", title: "Inglês", icon: "translate", days: [1, 3, 5], taskCount: 2, doneToday: false },
  { id: "leitura", title: "Leitura antes de dormir", icon: "menu_book", days: [0, 1, 2, 3, 4, 5, 6], taskCount: 1, doneToday: false },
];

/** Rotina do protótipo 3.2. */
export const PROTOTYPE_ROUTINE_DETAILS: RoutineDetails = {
  id: "mat",
  title: "Matemática",
  description: "Minha rotina diária de estudos de matemática.",
  icon: "calculate",
  days: [1, 2, 3, 4, 5],
  timeLabel: "07:00–07:45",
  tasks: [
    { id: "a", title: "Revisar conteúdo de cálculo", done: true },
    { id: "b", title: "Resolver a lista de exercícios", done: false },
    { id: "c", title: "Revisar as anotações da aula", done: false },
  ],
};
