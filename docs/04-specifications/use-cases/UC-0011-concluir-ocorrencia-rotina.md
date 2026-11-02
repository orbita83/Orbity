# [UC-0011] - Concluir ocorrência de rotina

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0011 |
| **Nome** | Concluir ocorrência de rotina |
| **Ator principal** | Estudante |
| **Objetivo** | Marcar como realizada a ocorrência diária de uma rotina e registrar o progresso das tarefas |

## 2. Contexto

Permite ao estudante registrar a execução da rotina programada para o dia atual. O estudante pode marcar as tarefas individualmente ou acionar a conclusão direta da rotina, o que marca automaticamente todas as suas tarefas associadas. A conclusão da ocorrência registra a atividade diária sem encerrar a rotina, mantendo suas repetições programadas para os próximos dias ativos.

## 3. Pré-condições

- Deve existir ao menos uma rotina cadastrada e ativa para o dia corrente.
- A ocorrência da rotina no dia deve estar pendente de conclusão.

## 4. Pós-condições

- A ocorrência do dia da rotina deve ser registrada como concluída.
- Todas as tarefas associadas à rotina devem ser marcadas como concluídas no ciclo correspondente.
- A data corrente local deve ser registrada como dia de atividade no sistema.
- Se os critérios de progressão conjunta forem satisfeitos, o contador de sequência diária e o progresso da constelação devem ser incrementados.
- As próximas ocorrências da rotina devem permanecer agendadas para os próximos dias da semana configurados.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0011 | Execução e conclusão de ocorrência de rotina | [FL-0011](../flows/FL-0011.md) |
