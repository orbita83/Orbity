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
}
