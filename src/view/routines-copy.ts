import type { RoutineIcon } from "../viewmodel/RoutinesViewModel";

/**
 * Textos das telas de Rotinas (protótipo do Claude Design, telas 3 a 3.4).
 * Nenhum texto pode ter termo punitivo (design-system/01-principios.md).
 */
export const ROUTINES_COPY = {
  title: "Rotinas",
  subtitle: "Seus hábitos, todos os dias",
  search: "Buscar rotinas",
  new: "Nova rotina",
  today: "Hoje",
  "summary.allDone": "Tudo concluído por hoje",
  "summary.progress": "{done} de {total} concluídas",
  "summary.empty": "Nenhuma rotina por enquanto",
  "summary.noneToday": "Nenhuma rotina para hoje",
  "empty.title": "Nenhuma rotina ainda",
  "empty.message": "Crie uma rotina para organizar seus estudos da semana.",
  "noResults.title": "Nenhuma rotina encontrada",
  "noResults.message": "Tente outro nome ou crie uma rotina nova.",
  "card.tasks.one": "1 tarefa",
  "card.tasks.other": "{n} tarefas",
  "card.open": "Abrir rotina {name}, {detail}",
  "card.complete": "Concluir rotina {name} hoje",
  "card.uncomplete": "Desmarcar rotina {name} hoje",
  "inactive.today": "Esta rotina não é de hoje.",
  loading: "Carregando suas rotinas…",
  "error.load": "Não foi possível carregar suas rotinas agora. Tente de novo em instantes.",
  "error.save": "Não foi possível salvar agora. Nada do que você fez antes se perdeu.",
  "deleted.message": "Rotina {name} excluída.",
  "deleted.undo": "Desfazer",
  "form.title": "Nova rotina",
  "form.back": "Voltar sem criar",
  "form.name": "Nome da rotina",
  "form.name.placeholder": "Ex.: Matemática",
  "form.name.error": "Dê um nome para a rotina.",
  "form.icon": "Ícone",
  "form.icon.helper": "Ajuda a reconhecer a rotina na lista.",
  "form.description": "Descrição",
  "form.description.placeholder": "Ex.: Rotina diária de estudos de matemática",
  "form.days": "Dias da semana",
  "form.days.helper": "A rotina aparece nos dias escolhidos.",
  "form.days.error": "Escolha pelo menos um dia.",
  "form.tasks": "Tarefas da rotina",
  "form.tasks.empty": "Sem tarefas por enquanto. Você pode adicionar agora ou depois.",
  "form.tasks.add": "Adicionar tarefa",
  "form.tasks.addLabel": "Adicionar tarefa à rotina",
  "form.tasks.draftLabel": "Nova tarefa da rotina",
  "form.submit": "Criar rotina",
  "task.moveUp": "Mover {name} para cima",
  "task.first": "Reordenar {name}, já é a primeira",
  "task.remove": "Remover {name}",
  "task.complete": "Concluir {name}",
  "task.uncomplete": "Desmarcar {name}",
  "created.title": "Rotina criada!",
  "created.message": "Sua rotina foi adicionada à lista de rotinas.",
  "created.action": "Ver minhas rotinas",
  "form.editTitle": "Editar rotina",
  "form.editBack": "Voltar sem salvar",
  "form.editSubmit": "Salvar alterações",
  "updated.title": "Rotina atualizada!",
  "updated.message": "As alterações da sua rotina foram salvas.",
  "updated.action": "Ver rotina",
  "discard.title": "Descartar alterações?",
  "discard.message": "O que você mudou nesta rotina não será salvo. A rotina continua como estava.",
  "discard.cancel": "Continuar editando",
  "discard.confirm": "Descartar alterações",
  "details.back": "Voltar para Rotinas",
  "details.edit": "Editar",
  "details.edit.hint": "Abre a edição da rotina",
  "details.tasks.add": "Adicionar tarefas",
  "details.tasks": "Tarefas da rotina",
  "details.tasks.empty": "Nenhuma tarefa nesta rotina",
  "details.progress": "{done} de {total} concluídas",
  "details.progress.counter": "{done} / {total}",
  "details.progress.counterPercent": "{done} / {total} · {percent}%",
  "details.progress.a11y": "{done} de {total} concluídas, {percent}%",
  "details.loading": "Carregando a rotina…",
  "details.progress.label": "Tarefas concluídas hoje",
  "details.allDone": "Rotina de hoje concluída. Mais um passo no seu cosmos.",
  "details.completeAll": "Marcar como concluída",
  "details.undoAll": "Desmarcar todos",
  "details.delete": "Excluir rotina",
  "details.missing.title": "Rotina indisponível",
  "details.missing.message": "Esta rotina não está mais na sua lista.",
  "delete.title": "Excluir a rotina {name}?",
  "delete.message.one": "Ela sai da sua lista e não aparece mais nos próximos dias. A tarefa dela também será excluída.",
  "delete.message.other": "Ela sai da sua lista e não aparece mais nos próximos dias. As {n} tarefas dela também serão excluídas.",
  "delete.note": "Sua sequência, suas estrelas e suas conquistas continuam do mesmo jeito.",
  "delete.cancel": "Manter rotina",
  "delete.confirm": "Excluir rotina",
} as const;

export type RoutinesCopyKey = keyof typeof ROUTINES_COPY;

/** Troca os marcadores `{nome}` pelos valores. */
export function formatRoutinesCopy(key: RoutinesCopyKey, values: Record<string, string | number> = {}): string {
  return ROUTINES_COPY[key].replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

const DAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
const DAY_LONG = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"] as const;

/** Dia da semana (0 = domingo) abreviado e por extenso, para chips e leitores de tela. */
export const weekdayShort = (day: number) => DAY_SHORT[day];
export const weekdayLong = (day: number) => DAY_LONG[day];

/** Resumo dos dias ativos: "Todos os dias", "Seg a Sex" ou "Seg, Qua e Sex". */
export function formatDays(days: readonly number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) return "Todos os dias";
  if (sorted.join() === "1,2,3,4,5") return "Seg a Sex";
  const names = sorted.map((day) => DAY_SHORT[day]);
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

export const taskCountLabel = (n: number) =>
  n === 1 ? ROUTINES_COPY["card.tasks.one"] : formatRoutinesCopy("card.tasks.other", { n });

/** Nomes dos ícones que o estudante pode escolher para uma rotina. */
export const ROUTINE_ICON_LABELS: Record<RoutineIcon, string> = {
  track_changes: "Geral",
  menu_book: "Livro",
  calculate: "Cálculo",
  translate: "Idiomas",
  science: "Ciências",
  code: "Programação",
  music_note: "Música",
};
