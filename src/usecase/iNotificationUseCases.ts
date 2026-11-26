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
}
