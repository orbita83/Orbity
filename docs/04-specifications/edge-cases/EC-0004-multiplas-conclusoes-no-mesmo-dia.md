# [EC-0004] - Múltiplas conclusões de tarefas e rotinas após incremento da sequência no mesmo ciclo

## 1. Contexto

O contador de sequência aumenta quando a condição de conclusão de rotinas e tarefas sem rotina associada é satisfeita ([`RN-0002`](../../02-requirements/business-rules/RN-0002.md)), impulsionando de forma direta o progresso da constelação ([`RN-0003`](../../02-requirements/business-rules/RN-0003.md)) e o alcance de conquistas ([`RN-0005`](../../02-requirements/business-rules/RN-0005.md)).

## 2. Condição de borda

Após já ter cumprido a condição que aumentou o contador de sequência no dia corrente, o usuário conclui rotinas ou tarefas sem rotina associada adicionais no mesmo período diário.

## 3. Comportamento esperado

O sistema deve registrar normalmente a conclusão de cada tarefa ou rotina adicional, mas deve preservar o contador de sequência e o progresso da constelação já incrementados no dia, evitando múltiplos incrementos da sequência diária dentro do mesmo dia.

## 4. Critérios de aceite

- **CA-01:** Após o contador de sequência ter sido incrementado no dia, novas conclusões de tarefas avulsas ou rotinas no mesmo dia não devem incrementar novamente o contador de sequência.
- **CA-02:** O progresso da constelação do usuário deve permanecer sincronizado com o valor único incrementado na sequência naquele dia.
- **CA-03:** O estado de conclusão individual das tarefas e rotinas adicionais deve ser salvo normalmente.
