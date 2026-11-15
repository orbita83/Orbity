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

  /** Só tarefas avulsas, até a decisão das pendências da RN-0007 (rotinas.md, R10; issue #138). */
  async getProgressCounts(): Promise<{ completed: number; total: number }> {
    const tasks = (await this.taskRepository.listAll()).filter(isStandaloneTask);
    const completed = tasks.filter((task) => task.completed).length;
    return { completed, total: tasks.length };
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
