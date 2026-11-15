# [EC-0006] - Reabertura de tarefa associada após a conclusão da rotina

## 1. Contexto

De acordo com a regra de negócio [`RN-0004`](../../02-requirements/business-rules/RN-0004.md), a conclusão de uma rotina marca automaticamente todas as tarefas associadas com `check`. O sistema também prevê a possibilidade de reabrir tarefas concluídas para retorná-las ao estado pendente.

## 2. Condição de borda

Após uma rotina ter sido completada e todas as suas tarefas associadas terem recebido `check`, o usuário desmarca (reabre) individualmente uma das tarefas vinculadas a essa rotina.

## 3. Comportamento esperado

O sistema deve retornar apenas a tarefa desmarcada ao estado pendente, mantendo o estado concluído (`check`) das demais tarefas associadas à rotina.

*Ponto pendente de refinamento:* definir se a reabertura individual de uma tarefa associada reabre automaticamente a ocorrência da rotina no dia ou se a ocorrência da rotina permanece marcada como concluída.

## 4. Critérios de aceite

- **CA-01:** Ao desmarcar uma tarefa pertencente a uma rotina concluída, a tarefa selecionada deve voltar ao estado pendente.
- **CA-02:** As demais tarefas associadas à mesma rotina não devem perder sua marcação de conclusão (`check`).
- **CA-03:** O tratamento do estado da ocorrência da rotina após a reabertura de uma tarefa associada deve seguir a definição validada no refinamento do fluxo correspondente.
