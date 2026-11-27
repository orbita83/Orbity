import { router } from "expo-router";
import { useEffect } from "react";
import { container, resolveUseCase } from "@/di/container";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";

/** A raiz do app não tem estado próprio para apresentar (`RULES.md`, "Retorno da ViewModel"). */
export type AppLifecycleState = Record<never, never>;

/** A raiz só executa efeitos globais; não há ações disparadas pela interface. */
export type AppLifecycleActions = Record<never, never>;

/**
 * ViewModel dos efeitos globais do app (ADR-0003), montada uma vez pelo `AppLifecycle` no `_layout.tsx`.
 * Na inicialização, faz os lembretes aparecerem também com o app em primeiro plano (#269) e passa a abrir
 * a aba Tarefas ao tocar num lembrete de tarefa, a partir de qualquer tela e no início a frio (#270).
 */
export function useAppLifecycleViewModel(
  notificationUseCases?: INotificationUseCases,
): [AppLifecycleState, AppLifecycleActions] {
  const useCases = resolveUseCase(notificationUseCases, container.useCases.notifications);

  useEffect(() => {
    useCases.startForegroundPresentation();
    return useCases.onTaskReminderPress(() => {
      router.navigate("/tasks");
    });
  }, [useCases]);

  return [{}, {}];
}
