# [EC-0004] - Múltiplas conclusões de tarefas e rotinas após incremento da sequência no mesmo ciclo

## 1. Contexto

A sequência aumenta quando a condição de conclusão de rotinas e tarefas sem rotina associada é satisfeita ([`RN-0002`](../../02-requirements/business-rules/RN-0002.md)), impulsionando de forma direta o progresso da constelação ([`RN-0003`](../../02-requirements/business-rules/RN-0003.md)) e o alcance de conquistas ([`RN-0005`](../../02-requirements/business-rules/RN-0005.md)).

## 2. Condição de borda

Após já ter cumprido a condição que registrou o dia corrente, o usuário conclui rotinas ou tarefas sem rotina associada adicionais no mesmo período diário.

## 3. Comportamento esperado

O sistema deve registrar normalmente a conclusão de cada tarefa ou rotina adicional, mas o dia fica registrado uma vez; a sequência é recalculada na leitura ([RF-0014](../../02-requirements/functional/RF-0014.md) e [RF-0015](../../02-requirements/functional/RF-0015.md)). Assim, a sequência e o progresso da constelação sobem no máximo uma vez por dia.

## 4. Critérios de aceite

- **CA-01:** Depois que o dia foi registrado, novas conclusões de tarefas avulsas ou rotinas no mesmo dia não devem aumentar a sequência de novo.
- **CA-02:** O progresso da constelação do usuário deve permanecer sincronizado com o único incremento da sequência naquele dia.
- **CA-03:** O estado de conclusão individual das tarefas e rotinas adicionais deve ser salvo normalmente.
