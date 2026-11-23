# [EC-0009] - Exclusão de categoria usada por tarefas e rotinas

## 1. Contexto

Uma categoria pode estar em uso por tarefas e por rotinas, inclusive por rotinas já excluídas que ainda podem ser restauradas ([RN-0009](../../02-requirements/business-rules/RN-0009.md), [FL-0015](../flows/FL-0015.md)).

## 2. Condição de borda

O estudante exclui uma categoria que está em uso por pelo menos uma tarefa ou rotina.

## 3. Comportamento esperado

O sistema exclui a categoria sem apagar nenhuma tarefa nem rotina. As tarefas ficam sem categoria, e as rotinas voltam ao ícone geral. Se uma rotina excluída for restaurada depois, ela volta com o ícone geral. Se a operação falhar no meio, nada é alterado.

## 4. Critérios de aceite

- **CA-01:** Nenhuma tarefa ou rotina deve ser apagada pela exclusão da categoria.
- **CA-02:** Nenhuma tarefa ou rotina, ativa ou excluída, deve continuar apontando para a categoria excluída.
- **CA-03:** Uma falha durante a exclusão não deve deixar a categoria removida com tarefas ou rotinas ainda apontando para ela.
