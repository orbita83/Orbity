import type { LocalDate } from "@/model/entities/local-date";
import type { Routine } from "@/model/entities/routine";
import type { Task } from "@/model/entities/task";

/** Mudanças nas tarefas de uma rotina editada (#137), gravadas junto com a rotina. */
export type RoutineTaskChanges = {
  readonly created: readonly Task[];
  readonly updated: readonly Task[];
  /** Saem da rotina, com as marcações delas. */
  readonly deletedIds: readonly string[];
};

/**
 * Persistência de rotinas, ocorrências e marcações por dia (rotinas.md, ADR-0001).
 * As tarefas da rotina são `Task` com `routineId`; só a criação e a edição delas passam por aqui, para
 * entrar na mesma transação da rotina. A leitura e a reordenação usam o `ITaskDataSource`.
 */
export interface IRoutineDataSource {
  /** Rotinas não excluídas, da mais antiga para a mais nova. */
  listActive(): Promise<Routine[]>;
  /** `null` quando não existe ou foi excluída. */
  findById(id: string): Promise<Routine | null>;
  /** Cria a rotina e as tarefas dela de uma vez: ou tudo, ou nada. */
  create(routine: Routine, tasks: readonly Task[]): Promise<void>;
  /** Atualiza a rotina e as tarefas dela de uma vez: ou tudo, ou nada (#137). */
  update(routine: Routine, changes: RoutineTaskChanges): Promise<void>;
  /** Exclusão reversível (R7). */
  markDeleted(id: string, deletedAt: string): Promise<void>;
  restore(id: string): Promise<void>;

  /** Ids das rotinas com a ocorrência concluída nesta data. */
  listCompletedOn(date: LocalDate): Promise<string[]>;
  /** Conclui a ocorrência e marca as tarefas, sem duplicar o que já existe (RN-0004, EC-0005). */
  completeOccurrence(routineId: string, date: LocalDate, taskIds: readonly string[], completedAt: string): Promise<void>;
  /** Reabre a ocorrência e desmarca as tarefas da data ("Desmarcar todos"). */
  reopenOccurrence(routineId: string, date: LocalDate): Promise<void>;

  /** Ids das tarefas marcadas nesta data. */
  listTaskChecks(routineId: string, date: LocalDate): Promise<string[]>;
  setTaskCheck(routineId: string, taskId: string, date: LocalDate, checked: boolean): Promise<void>;
}
