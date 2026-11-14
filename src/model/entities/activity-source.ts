/**
 * O que conta para a sequência (RN-0002, D1): uma tarefa sem rotina ou uma rotina.
 * Sessões de foco ficam de fora de propósito: o foco não conta para a sequência (RF-0019).
 */
export type ActivitySource = {
  kind: "standalone-task" | "routine";
  id: string;
};
