/**
 * Textos da Tela Inicial. Seguem o protótipo do Claude Design (D23 em docs/designs/tela-inicial-base.md),
 * mais os textos de estado vazio e de acessibilidade. Nenhum texto pode ter termo punitivo.
 */
export const HOME_COPY = {
  brand: "Orbity",
  settings: "Configurações",
  "streak.unit.one": "dia de sequência",
  "streak.unit.other": "dias de sequência",
  "streak.empty": "Sua jornada começa com a primeira atividade concluída.",
  "error.persistence": "Não conseguimos carregar seus dados agora.",
  "error.retry": "Tentar de novo",
  "error.schema": "Atualize o Orbity para ver seus dados.",
  "focus.title": "Modo Foco",
  "focus.description": "Concentre-se no que importa.",
  "focus.details": "Detalhes do Modo Foco",
  "focus.start": "Iniciar foco",
  "focus.blocked": "Para iniciar o foco, crie uma tarefa ou rotina primeiro.",
  "progress.title": "Seu progresso",
  "progress.description": "Conquiste sua estrela estudando.",
  "progress.starEarnedToday": "Você conquistou uma nova estrela no seu cosmos hoje.",
  "progress.value": "{completed} de {total} atividades concluídas",
  "progress.percent": "{percent}%",
  "achievements.title": "Conquistas",
  "achievements.description": "Desafios para evoluir no seu universo.",
  "achievements.open": "Ver todas as conquistas, disponível em breve",
  "achievements.badge": "Conquista {n} de {total}, bloqueada",
  "lastSession.title": "Última sessão",
  "lastSession.empty": "Suas sessões de foco aparecem aqui.",
  "lastSession.details": "Detalhes da última sessão, disponível em breve",
  "howItWorks.title": "Como funciona?",
  "howItWorks.description": "Sequência, estrelas e conquistas.",
  "howItWorks.open": "Abrir explicação de como funciona, disponível em breve",
  "sheet.invite": "Deslize para explorar",
  "sheet.open": "Abrir painel",
  "sheet.close": "Fechar painel",
  loading: "Carregando seu progresso",
} as const;

export type HomeCopyKey = keyof typeof HOME_COPY;

/** Termos que nenhum texto da Home pode usar (design-system/01-principios.md, RNF-0002). */
export const PUNITIVE_TERMS = ["zerou", "perdeu", "falhou", "fracasso", "quebrou"] as const;

/** Troca os marcadores `{nome}` pelos valores. */
export function formatCopy(key: HomeCopyKey, values: Record<string, string | number> = {}): string {
  return HOME_COPY[key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

export function streakUnit(days: number): string {
  return HOME_COPY[days === 1 ? "streak.unit.one" : "streak.unit.other"];
}
