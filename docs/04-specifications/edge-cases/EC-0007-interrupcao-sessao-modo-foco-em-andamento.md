# [EC-0007] - Encerramento ou interrupção de sessão ativa do modo foco

## 1. Contexto

Durante uma sessão ativa do modo foco vinculada a uma tarefa ou rotina ([`RN-0001`](../../02-requirements/business-rules/RN-0001.md)), o visualizador de sequência exibe um novo efeito visual e ganha novos atributos ao longo da sessão ([`RN-0006`](../../02-requirements/business-rules/RN-0006.md)).

## 2. Condição de borda

O usuário interrompe ou encerra uma sessão ativa do modo foco antes de concluir a tarefa ou rotina associada.

## 3. Comportamento esperado

O sistema deve encerrar a sessão ativa do modo foco e desativar o efeito visual exclusivo de sessão em andamento no visualizador de sequência, sem marcar automaticamente como concluída a tarefa ou rotina vinculada e sem aplicar qualquer penalidade ou mensagem punitiva ao estudante.

*Ponto pendente de refinamento:* definir se os atributos adquiridos pelo visualizador de sequência ao longo de uma sessão interrompida são mantidos, ajustados proporcionalmente ou reiniciados para a próxima sessão.

## 4. Critérios de aceite

- **CA-01:** Ao encerrar ou interromper a sessão do modo foco, o visualizador de sequência deve deixar de exibir o efeito exclusivo de sessão ativa do modo foco.
- **CA-02:** A interrupção da sessão do modo foco não deve marcar automaticamente a tarefa ou rotina vinculada como concluída nem aplicar penalidades ao usuário.
- **CA-03:** O tratamento dos atributos adquiridos pelo visualizador de sequência ao longo da sessão interrompida deve respeitar a política definida no refinamento da funcionalidade.
