import type { FocusAnnouncement, FocusPhase } from "../viewmodel/useFocusSessionViewModel";

/**
 * Textos da tela do Modo Foco (Pomodoro, issue #217).
 * Seguem os princípios do ODS (01-principios.md, RNF-0002): zero termos punitivos.
 */
export const FOCUS_COPY = {
  title: "Modo Foco",
  back: "Voltar para Início",
  loading: "Carregando sua sessão de foco",
  "error.load": "Não conseguimos carregar os dados do Modo Foco agora.",
  "error.action": "Não foi possível atualizar a sessão agora. Tente novamente.",
  "error.retry": "Tentar de novo",
  "notice.permission":
    "As notificações estão desativadas. Seu cronômetro funciona normalmente, mas ative as notificações nas configurações do aparelho para receber o alerta com a tela bloqueada.",
  "notice.dismiss": "Entendi",
  "targets.title": "Atividade vinculada",
  "targets.subtitle": "Escolha a tarefa avulsa ou rotina que você vai estudar agora.",
  "targets.empty":
    "Para iniciar o Modo Foco, crie uma tarefa avulsa ou uma rotina ativa primeiro.",
  "targets.kind.task": "Tarefa",
  "targets.kind.routine": "Rotina",
  "duration.title": "Duração do foco",
  "duration.subtitle":
    "Ciclos com pausa curta de {shortBreak} min e pausa longa de {longBreak} min a cada {cycles} ciclos.",
  "duration.option": "{minutes} min",
  "duration.optionA11y": "{minutes} minutos de foco",
  "start.cta": "Iniciar foco",
  "lastSession.banner": "Última sessão: {minutes} min em \"{title}\"",
  "lastSession.bannerUnderOne": "Última sessão: menos de 1 min em \"{title}\"",
  "phase.focus": "Ciclo de foco · {cycle} de {total}",
  "phase.shortBreak": "Pausa curta · {minutes} min",
  "phase.longBreak": "Pausa longa · {minutes} min",
  "status.running": "Em andamento",
  "status.paused": "Pausado",
  "status.completed": "Ciclo concluído",
  "session.linkedTo": "Vinculado a",
  "session.timerA11y": "Cronômetro da sessão de foco",
  "session.progressLabel": "Progresso do ciclo atual",
  "session.progressValue": "{percent}% do ciclo atual concluído",
  "session.focusedSoFar": "{minutes} min focados nesta sessão",
  "controls.pause": "Pausar",
  "controls.resume": "Retomar",
  "controls.advance": "Avançar ciclo",
  "controls.nextShortBreak": "Iniciar pausa curta",
  "controls.nextLongBreak": "Iniciar pausa longa",
  "controls.nextFocus": "Iniciar próximo foco",
  "controls.end": "Encerrar foco",
  "confirmEnd.title": "Encerrar sessão de foco?",
  "confirmEnd.message":
    "Os minutos já dedicados ficarão registrados na sua última sessão, e sua sequência permanece intacta.",
  "confirmEnd.confirm": "Sim, encerrar sessão",
  "confirmEnd.cancel": "Continuar focando",
  "announce.started.focus": "Ciclo de foco de {minutes} minutos iniciado em {title}.",
  "announce.started.shortBreak": "Pausa curta de {minutes} minutos iniciada.",
  "announce.started.longBreak": "Pausa longa de {minutes} minutos iniciada.",
  "announce.paused": "Sessão pausada. Restam cerca de {minutes} minutos.",
  "announce.resumed": "Sessão retomada. Restam cerca de {minutes} minutos.",
  "announce.oneMinuteLeft": "Falta um minuto para concluir o ciclo atual.",
  "announce.completed.focus": "Ciclo de foco concluído! Hora de fazer uma pausa.",
  "announce.completed.break": "Pausa concluída! Pronto para o próximo ciclo de foco.",
  "announce.ended": "Sessão de foco encerrada com {minutes} minutos registrados.",
} as const;

export type FocusCopyKey = keyof typeof FOCUS_COPY;

export function formatFocusCopy(
  key: FocusCopyKey,
  values: Record<string, string | number> = {},
): string {
  return FOCUS_COPY[key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

export function nextPhaseCtaLabel(
  currentPhase: FocusPhase,
  completedFocusCycles: number,
  cyclesBeforeLongBreak: number,
): string {
  if (currentPhase !== "focus") {
    return FOCUS_COPY["controls.nextFocus"];
  }
  const nextCompleted = completedFocusCycles + 1;
  return nextCompleted > 0 && nextCompleted % cyclesBeforeLongBreak === 0
    ? FOCUS_COPY["controls.nextLongBreak"]
    : FOCUS_COPY["controls.nextShortBreak"];
}

export function formatFocusAnnouncement(announcement: FocusAnnouncement | null): string {
  if (!announcement) return "";
  switch (announcement.kind) {
    case "started":
      if (announcement.phase === "short-break") {
        return formatFocusCopy("announce.started.shortBreak", { minutes: announcement.minutes });
      }
      if (announcement.phase === "long-break") {
        return formatFocusCopy("announce.started.longBreak", { minutes: announcement.minutes });
      }
      return formatFocusCopy("announce.started.focus", {
        minutes: announcement.minutes,
        title: announcement.targetTitle,
      });
    case "paused":
      return formatFocusCopy("announce.paused", { minutes: announcement.remainingMinutes });
    case "resumed":
      return formatFocusCopy("announce.resumed", { minutes: announcement.remainingMinutes });
    case "one-minute-left":
      return FOCUS_COPY["announce.oneMinuteLeft"];
    case "cycle-completed":
      return announcement.phase === "focus"
        ? FOCUS_COPY["announce.completed.focus"]
        : FOCUS_COPY["announce.completed.break"];
    case "ended":
      return formatFocusCopy("announce.ended", { minutes: announcement.focusedMinutes });
  }
}
