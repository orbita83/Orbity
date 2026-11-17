# [EC-0006] - Reabertura de tarefa associada após a conclusão da rotina

## 1. Contexto

De acordo com a regra de negócio [`RN-0004`](../../02-requirements/business-rules/RN-0004.md), a conclusão de uma rotina marca automaticamente todas as tarefas associadas com `check`. O sistema também prevê a possibilidade de reabrir tarefas concluídas para retorná-las ao estado pendente.

## 2. Condição de borda

Após uma rotina ter sido completada e todas as suas tarefas associadas terem recebido `check`, o usuário desmarca (reabre) individualmente uma das tarefas vinculadas a essa rotina.

## 3. Comportamento esperado

O sistema deve retornar apenas a tarefa desmarcada ao estado pendente, mantendo o estado concluído (`check`) das demais tarefas associadas à rotina.

Desmarcar uma tarefa associada **não** reabre a ocorrência da rotina no dia, que continua concluída. Para reabrir a ocorrência, o estudante usa **Desmarcar todos** (FL-0008, 2b). Decisão R3 de [`rotinas.md`](../../designs/rotinas.md), 2026-11-15.

## 4. Critérios de aceite

- **CA-01:** Ao desmarcar uma tarefa pertencente a uma rotina concluída, a tarefa selecionada deve voltar ao estado pendente.
- **CA-02:** As demais tarefas associadas à mesma rotina não devem perder sua marcação de conclusão (`check`).
- **CA-03:** Depois de desmarcar uma tarefa associada, a ocorrência da rotina no dia deve continuar concluída.
