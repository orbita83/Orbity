import type { LocalDate } from "@/model/entities/local-date";
import { isRoutineActiveOn } from "@/model/entities/routine";
import { isStandaloneTask } from "@/model/entities/task";
import type { IActivityCatalog } from "@/model/repositories/i-activity-catalog";
import type { IRoutineRepository } from "@/model/repositories/i-routine-repository";
import type { ITaskRepository } from "@/model/repositories/i-task-repository";

/** Catálogo de atividades da Home alimentado pelos repositórios de tarefas e rotinas. */
export class TaskActivityCatalog implements IActivityCatalog {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly routineRepository: IRoutineRepository,
  ) {}

  /**
   * RN-0007 (issue #138): tarefas avulsas pelo total geral, mais as rotinas de hoje como uma
   * unidade cada, concluídas pela ocorrência do dia. As tarefas de rotina não contam sozinhas.
   */
  async getProgressCounts(today: LocalDate): Promise<{ completed: number; total: number }> {
    const [tasks, routines, completedIds] = await Promise.all([
      this.taskRepository.listAll(),
      this.routineRepository.listActive(),
      this.routineRepository.listCompletedOn(today),
    ]);
    const standalone = tasks.filter(isStandaloneTask);
    const routinesToday = routines.filter((routine) => isRoutineActiveOn(routine, today));
    const done = new Set(completedIds);
    const completed =
      standalone.filter((task) => task.completed).length + routinesToday.filter((routine) => done.has(routine.id)).length;
    return { completed, total: standalone.length + routinesToday.length };
  }

  /** Uma tarefa avulsa ou uma rotina pode ser alvo do Modo Foco (RN-0001; rotinas.md, R9). */
  async hasFocusTargets(): Promise<boolean> {
    const tasks = await this.taskRepository.listAll();
    if (tasks.some(isStandaloneTask)) {
      return true;
    }
    return (await this.routineRepository.listActive()).length > 0;
  }
}
