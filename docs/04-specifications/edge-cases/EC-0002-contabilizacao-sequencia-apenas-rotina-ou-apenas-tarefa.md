# [EC-0002] - Contabilização de sequência quando há apenas rotina ou apenas tarefa avulsa

## 1. Contexto

A contabilização do contador de sequência considera a conclusão de rotinas e de tarefas sem rotina associada, conforme definido na regra de negócio [`RN-0002`](../../02-requirements/business-rules/RN-0002.md), impactando diretamente o progresso da constelação do usuário ([`RN-0003`](../../02-requirements/business-rules/RN-0003.md)).

## 2. Condição de borda

O usuário organiza suas atividades utilizando exclusivamente tarefas sem rotina associada (sem nenhuma rotina cadastrada/ativa) ou exclusivamente rotinas (sem nenhuma tarefa avulsa disponível) e conclui uma atividade da única categoria existente.

## 3. Comportamento esperado

Quando não houver nenhuma rotina disponível, a conclusão de 1 tarefa sem rotina associada deve ser suficiente para aumentar o contador de sequência. De forma recíproca, quando não houver nenhuma tarefa sem rotina associada disponível, a conclusão de 1 rotina deve ser suficiente para aumentar o contador de sequência, progredindo a constelação do usuário em conjunto.

## 4. Critérios de aceite

- **CA-01:** Na ausência de qualquer rotina disponível, concluir 1 tarefa sem rotina associada deve aumentar o contador de sequência.
- **CA-02:** Na ausência de qualquer tarefa sem rotina associada disponível, concluir 1 rotina deve aumentar o contador de sequência.
- **CA-03:** O progresso da constelação do usuário deve avançar junto com o contador de sequência em ambos os cenários.
