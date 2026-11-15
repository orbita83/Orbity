# [UC-0003] - Concluir tarefa

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0003 |
| **Nome** | Concluir tarefa |
| **Ator principal** | Estudante |
| **Objetivo** | Marcar uma tarefa como concluída ou desmarcá-la |

## 2. Contexto

Permite ao estudante sinalizar a conclusão de uma tarefa na lista de tarefas e, quando necessário, desfazer essa marcação. A conclusão de tarefas é considerada na atualização automática da sequência de estudos, conforme [RN-0002](../../02-requirements/business-rules/RN-0002.md).

## 3. Pré-condições

- Deve existir ao menos uma tarefa cadastrada.

## 4. Pós-condições

- A tarefa deve apresentar o estado escolhido pelo estudante (concluída ou pendente).
- A conclusão deve ser considerada na apuração da sequência de estudos ([UC-0011](UC-0011-atualizar-sequencia-estudos.md)).

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0003 | Conclusão e desmarcação de tarefa | [FL-0003](../flows/FL-0003.md) |
