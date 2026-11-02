# [UC-0005] - Concluir tarefa

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0005 |
| **Nome** | Concluir tarefa |
| **Ator principal** | Estudante |
| **Objetivo** | Marcar uma tarefa pendente como concluída e registrar a atividade correspondente |

## 2. Contexto

Permite ao estudante sinalizar a conclusão de uma atividade individual por meio de marcação direta na interface. A conclusão transfere a tarefa para a seção de tarefas concluídas, gera o registro de atividade diária no fuso local e atua em conjunto com a apuração das rotinas para o avanço da sequência de estudos.

## 3. Pré-condições

- Deve existir ao menos uma tarefa em estado pendente acessível na interface.

## 4. Pós-condições

- A tarefa deve ter seu estado alterado para concluída, deixando de aparecer na listagem de pendentes e figurando na seção de concluídas.
- A data corrente local do estudante deve ser registrada como dia de atividade no sistema.
- Se os critérios de progressão conjunta forem satisfeitos, o contador de sequência diária e o progresso da constelação devem ser incrementados.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0005 | Conclusão de tarefa e registro de atividade | [FL-0005](../flows/FL-0005.md) |
