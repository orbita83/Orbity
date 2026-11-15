/**
 * Textos das telas de Tarefas (protótipo do Claude Design, telas 2 a 2.3).
 * Nenhum texto pode ter termo punitivo (design-system/01-principios.md).
 */
export const TASKS_COPY = {
  title: "Tarefas",
  "summary.allDone": "Tudo concluído por hoje",
  "summary.one": "1 tarefa pendente",
  "summary.other": "{n} tarefas pendentes",
  "summary.empty": "Nenhuma tarefa por enquanto",
  filters: "Filtrar tarefas",
  "filter.all": "Todos",
  "filter.pending": "Pendentes",
  "filter.completed": "Concluídas",
  new: "Nova tarefa",
  "empty.title": "Nada por aqui ainda",
  "empty.message": "Quando quiser, crie uma tarefa ou troque o filtro.",
  "selection.hint": "Toque nas tarefas para incluir ou tirar da seleção.",
  "selection.one": "1 selecionada",
  "selection.other": "{n} selecionadas",
  "action.pin": "Fixar",
  "action.selectAll": "Marcar todas",
  "action.delete": "Excluir ({n})",
  "delete.title.one": "Excluir 1 tarefa?",
  "delete.title.other": "Excluir {n} tarefas?",
  "delete.message": "As tarefas selecionadas saem da sua lista. Sua sequência e suas conquistas continuam do mesmo jeito.",
  "delete.cancel": "Manter tarefas",
  "delete.confirm": "Excluir",
  "form.title": "Nova tarefa",
  "form.close": "Fechar sem criar",
  "form.name": "Título da tarefa",
  "form.name.placeholder": "Ex.: Revisar SOLID",
  "form.name.error": "Dê um título para a tarefa.",
  "form.description": "Descrição",
  "form.description.placeholder": "Ex.: Revisar o princípio da responsabilidade única",
  "form.start": "Início",
  "form.end": "Término",
  "form.date": "Data",
  "form.date.placeholder": "dd/mm/aaaa",
  "form.time": "Hora",
  "form.time.placeholder": "hh:mm",
  "form.category": "Categoria",
  "form.category.empty": "Sem categoria",
  "form.category.soon": "Escolha de categoria disponível em breve",
  "form.submit": "Criar tarefa",
  "created.title": "Tarefa criada!",
  "created.message": "Sua tarefa foi adicionada à lista de tarefas.",
  "created.action": "Ver minhas tarefas",
} as const;

export type TasksCopyKey = keyof typeof TASKS_COPY;

/** Troca os marcadores `{nome}` pelos valores. */
export function formatTasksCopy(key: TasksCopyKey, values: Record<string, string | number> = {}): string {
  return TASKS_COPY[key].replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}
