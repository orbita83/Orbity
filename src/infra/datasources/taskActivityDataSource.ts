import type { LocalDate } from "@/model/entities/localDate";
import { isRoutineActiveOn } from "@/model/entities/routine";
import { isStandaloneTask } from "@/model/entities/task";
import type { IActivityDataSource } from "@/model/datasources/iActivityDataSource";
import type { IRoutineDataSource } from "@/model/datasources/iRoutineDataSource";
import type { ITaskDataSource } from "@/model/datasources/iTaskDataSource";

/** DataSource de atividades da Home montado sobre os DataSources de tarefas e rotinas. */
export class TaskActivityDataSource implements IActivityDataSource {
  constructor(
    private readonly taskDataSource: ITaskDataSource,
    private readonly routineDataSource: IRoutineDataSource,
  ) {}

  /**
   * RN-0007 (issue #138): tarefas avulsas pelo total geral, mais as rotinas de hoje como uma
   * unidade cada, concluídas pela ocorrência do dia. As tarefas de rotina não contam sozinhas.
   */
  async getProgressCounts(today: LocalDate): Promise<{ completed: number; total: number }> {
    const [tasks, routines, completedIds] = await Promise.all([
      this.taskDataSource.listAll(),
      this.routineDataSource.listActive(),
      this.routineDataSource.listCompletedOn(today),
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
    const tasks = await this.taskDataSource.listAll();
    if (tasks.some(isStandaloneTask)) {
      return true;
    }
    return (await this.routineDataSource.listActive()).length > 0;
  }
}
