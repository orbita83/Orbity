# [EC-0005] - Conclusão de rotina quando parte das tarefas associadas já está concluída

## 1. Contexto

A regra de negócio [`RN-0004`](../../02-requirements/business-rules/RN-0004.md) determina que, quando uma rotina é completada, todas as tarefas associadas a ela recebem marcação de conclusão (`check`) automaticamente.

## 2. Condição de borda

O usuário marca individualmente uma ou mais tarefas associadas a uma rotina como concluídas antes de concluir a rotina e, em seguida, aciona a conclusão da própria rotina.

## 3. Comportamento esperado

O sistema deve aplicar a marcação de conclusão (`check`) a todas as tarefas associadas que ainda estavam pendentes e preservar o estado concluído das tarefas que já haviam sido marcadas anteriormente, sem inverter o estado das tarefas já concluídas nem gerar registros duplicados.

## 4. Critérios de aceite

- **CA-01:** Tarefas associadas à rotina que já estavam concluídas devem permanecer com marcação de conclusão (`check`) após a conclusão da rotina.
- **CA-02:** Tarefas associadas à rotina que ainda estavam pendentes devem receber marcação de conclusão (`check`) automaticamente.
- **CA-03:** Ao final da operação, todas as tarefas associadas à rotina devem estar marcadas como concluídas, sem duplicação de estado.
