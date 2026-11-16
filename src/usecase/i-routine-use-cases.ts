import type {
  CreateRoutineInput,
  Routine,
  RoutineDetails,
  RoutineOverview,
  UpdateRoutineInput,
} from "@/model/entities/routine";

/** Casos de uso de Rotinas (rotinas.md). O "hoje" é sempre a data local do relógio. */
export interface IRoutineUseCases {
  /** Rotinas não excluídas, com o estado de hoje (RF-0008). */
  listRoutines(): Promise<RoutineOverview[]>;
  /** `null` quando a rotina não existe ou foi excluída. */
  getRoutine(id: string): Promise<RoutineDetails | null>;
  /** Cria a rotina e as tarefas dela (RF-0007, RF-0012). */
  createRoutine(input: CreateRoutineInput): Promise<Routine>;
  /**
   * Edita a rotina e as tarefas dela (RF-0009, UC-0007, #137). Tarefas com `id` são mantidas, as
   * novas entram desmarcadas, e as ausentes saem com a marcação de hoje. A ocorrência e a sequência
   * não mudam. Pode ser feita em qualquer dia.
   */
  updateRoutine(input: UpdateRoutineInput): Promise<RoutineDetails>;
  /** Exclusão reversível por `restoreRoutine` (RF-0010, R7). */
  deleteRoutine(id: string): Promise<void>;
  restoreRoutine(id: string): Promise<void>;
  /** Conclui a ocorrência de hoje e marca as tarefas (RF-0011, RN-0004, RN-0002). */
  completeOccurrence(id: string): Promise<RoutineDetails>;
  /** "Desmarcar todos": reabre a ocorrência de hoje sem apagar o dia da sequência (R4). */
  reopenOccurrence(id: string): Promise<RoutineDetails>;
  /** Marca ou desmarca uma tarefa só hoje, sem registrar o dia nem reabrir a ocorrência (R3). */
  toggleRoutineTask(routineId: string, taskId: string): Promise<RoutineDetails>;
  /** Sobe a tarefa uma posição (alça do protótipo 3.2). */
  moveRoutineTaskUp(routineId: string, index: number): Promise<RoutineDetails>;
}
