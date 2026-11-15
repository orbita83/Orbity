# [UC-0008] - Concluir rotina

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0008 |
| **Nome** | Concluir rotina |
| **Ator principal** | Estudante |
| **Objetivo** | Marcar uma rotina como concluída ou desmarcar suas tarefas |

## 2. Contexto

Permite ao estudante concluir uma rotina pelo botão **Marcar como concluída** no detalhe da rotina, o que marca automaticamente todas as tarefas associadas ([RN-0004](../../02-requirements/business-rules/RN-0004.md)). Após a conclusão, a ação **Desmarcar todos** permite desfazer a marcação das tarefas.

## 3. Pré-condições

- Deve existir ao menos uma rotina cadastrada com tarefas associadas.
- O detalhe da rotina deve estar aberto.

## 4. Pós-condições

- Ao concluir, todas as tarefas da rotina devem estar marcadas como concluídas.
- A conclusão deve ser considerada na apuração da sequência de estudos ([UC-0011](UC-0011-atualizar-sequencia-estudos.md)).

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0008 | Conclusão de rotina | [FL-0008](../flows/FL-0008.md) |
