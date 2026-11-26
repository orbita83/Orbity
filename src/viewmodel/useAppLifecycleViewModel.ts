import { useEffect } from "react";
import { container, resolveUseCase } from "@/di/container";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";

/** A raiz do app não tem estado próprio para apresentar (`RULES.md`, "Retorno da ViewModel"). */
export type AppLifecycleState = Record<never, never>;

/** Por ora, a raiz só executa efeitos de inicialização; a #270 acrescenta o toque no lembrete. */
export type AppLifecycleActions = Record<never, never>;

/**
 * ViewModel dos efeitos globais do app (ADR-0003), montada uma vez pelo `AppLifecycle` no `_layout.tsx`.
 * Na inicialização, faz os lembretes aparecerem também com o app em primeiro plano (#269).
 */
export function useAppLifecycleViewModel(
  notificationUseCases?: INotificationUseCases,
): [AppLifecycleState, AppLifecycleActions] {
  const useCases = resolveUseCase(notificationUseCases, container.useCases.notifications);

  useEffect(() => {
    useCases.startForegroundPresentation();
  }, [useCases]);

  return [{}, {}];
}
