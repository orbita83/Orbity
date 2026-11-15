import type { IActivityCatalog } from "@/model/repositories/i-activity-catalog";
import type { ITaskRepository } from "@/model/repositories/i-task-repository";

/** Catálogo de atividades da Home alimentado pelo repositório de tarefas. */
export class TaskActivityCatalog implements IActivityCatalog {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async getProgressCounts(): Promise<{ completed: number; total: number }> {
    const tasks = await this.taskRepository.listAll();
    const completed = tasks.filter((task) => task.completed).length;
    return { completed, total: tasks.length };
  }

  async hasFocusTargets(): Promise<boolean> {
    const tasks = await this.taskRepository.listAll();
    return tasks.length > 0;
  }
}
