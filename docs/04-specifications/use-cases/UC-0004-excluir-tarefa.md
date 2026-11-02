# [UC-0004] - Excluir tarefa

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0004 |
| **Nome** | Excluir tarefa |
| **Ator principal** | Estudante |
| **Objetivo** | Remover uma tarefa cadastrada individualmente ou em lote por seleção múltipla |

## 2. Contexto

Permite ao estudante excluir tarefas que não deseja mais manter registradas em seu planejamento. A exclusão exige confirmação prévia para evitar perda acidental de dados e trata de forma segura cenários em que a tarefa possa estar associada a rotinas ou sessões de foco ativas.

## 3. Pré-condições

- Deve existir ao menos uma tarefa cadastrada no sistema.
- A tarefa a ser excluída não deve estar vinculada a uma sessão ativa de modo foco em andamento, ou a sessão deve ser tratada previamente.

## 4. Pós-condições

- A tarefa excluída deve ser removida permanentemente do armazenamento e deixar de ser exibida nas listagens.
- Se a tarefa fizer parte de uma rotina, a lista de tarefas da respectiva rotina deve ser atualizada de forma consistente.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0004 | Exclusão individual e seleção múltipla de tarefas | [FL-0004](../flows/FL-0004.md) |
