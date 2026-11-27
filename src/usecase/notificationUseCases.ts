import { TASK_REMINDER_ROUTE } from "@/model/entities/task";
import type { INotificationService } from "@/model/services/iNotificationService";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";

export class NotificationUseCases implements INotificationUseCases {
  constructor(private readonly notificationService?: INotificationService) {}

  startForegroundPresentation(): void {
    try {
      this.notificationService?.configureForegroundPresentation?.();
    } catch {
      // Sem o handler o lembrete ainda aparece com o app em segundo plano; nada a mostrar ao estudante.
    }
  }

  onTaskReminderPress(onPress: (taskId?: string) => void): () => void {
    if (!this.notificationService?.onNotificationResponse) {
      return () => undefined;
    }
    return this.notificationService.onNotificationResponse((data) => {
      if (data.route !== TASK_REMINDER_ROUTE) {
        // Não é um lembrete de tarefa: fica para outro ouvinte (ex.: o fim de ciclo do Modo Foco).
        return false;
      }
      onPress(data.taskId);
      return true;
    });
  }
}
