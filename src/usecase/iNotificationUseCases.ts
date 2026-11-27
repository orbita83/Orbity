/**
 * Casos de uso globais das notificações locais, acionados na raiz do app
 * (`AppLifecycle` → `useAppLifecycleViewModel`, ADR-0003).
 */
export interface INotificationUseCases {
  /**
   * Faz os lembretes do Orbity aparecerem também com o app em primeiro plano (#269).
   * Nunca lança: uma falha só deixa de exibir o banner, sem afetar o app.
   */
  startForegroundPresentation(): void;
  /**
   * Escuta o toque do estudante num lembrete de tarefa para a ViewModel raiz abrir a aba Tarefas
   * (RF-0021 CA-06), inclusive o toque que abriu o app (início a frio, #270). Cada toque chega uma única vez.
   * Devolve a função que encerra a escuta.
   */
  onTaskReminderPress(onPress: (taskId?: string) => void): () => void;
}
