/**
 * Textos da Tela Inicial, aprovados pelo autor (D22 em docs/designs/tela-inicial-base.md,
 * mais os textos de apoio confirmados na Etapa 7). Nenhum texto pode ter termo punitivo.
 */
export const HOME_COPY = {
  brand: "Orbity",
  "streak.unit.one": "dia de sequência",
  "streak.unit.other": "dias de sequência",
  "streak.empty": "Sua jornada começa com a primeira atividade concluída.",
  "error.persistence": "Não conseguimos carregar seus dados agora.",
  "error.retry": "Tentar de novo",
  "error.schema": "Atualize o Orbity para ver seus dados.",
  "focus.title": "Modo Foco",
  "focus.description": "Concentre-se no que importa.",
  "focus.start": "Iniciar foco",
  "focus.blocked": "Para iniciar o foco, crie uma tarefa ou rotina primeiro.",
  "focus.durations": "Duração do foco",
  "focus.duration": "{n} minutos",
  "progress.title": "Seu progresso",
  "progress.empty": "Seu próximo passo começa aqui.",
  "progress.ongoing": "Cada atividade concluída conta.",
  "progress.value": "{completed} de {total} atividades concluídas",
  "achievements.soon": "Conquistas — em breve",
  "achievements.label": "Conquistas, disponível em breve",
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
