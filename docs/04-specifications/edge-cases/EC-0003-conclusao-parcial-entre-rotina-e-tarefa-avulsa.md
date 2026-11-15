# [EC-0003] - Conclusão de apenas uma categoria quando existem rotina e tarefa avulsa

## 1. Contexto

Quando o usuário possui rotinas e tarefas sem rotina associada, a regra de negócio [`RN-0002`](../../02-requirements/business-rules/RN-0002.md) estabelece que a conclusão de 1 rotina somada à conclusão de 1 tarefa sem rotina associada aumenta o contador de sequência, o qual progride junto com a constelação do usuário ([`RN-0003`](../../02-requirements/business-rules/RN-0003.md)).

## 2. Condição de borda

O usuário possui tanto rotinas quanto tarefas sem rotina associada disponíveis, mas conclui apenas atividades de uma dessas categorias (somente rotinas ou somente tarefas sem rotina associada), mantendo a outra categoria sem nenhuma conclusão.

## 3. Comportamento esperado

O sistema deve registrar normalmente a conclusão da rotina (incluindo a marcação das tarefas a ela vinculadas, conforme [`RN-0004`](../../02-requirements/business-rules/RN-0004.md)) ou da tarefa avulsa, mas não deve aumentar o contador de sequência nem avançar o progresso da constelação do usuário até que ao menos 1 atividade da outra categoria também seja concluída.

## 4. Critérios de aceite

- **CA-01:** Quando existirem rotina e tarefa sem rotina associada disponíveis, concluir apenas 1 ou mais rotinas sem concluir nenhuma tarefa avulsa não deve aumentar o contador de sequência.
- **CA-02:** Quando existirem rotina e tarefa sem rotina associada disponíveis, concluir apenas 1 ou mais tarefas avulsas sem concluir nenhuma rotina não deve aumentar o contador de sequência.
- **CA-03:** Assim que a categoria faltante tiver ao menos 1 conclusão registrada, o contador de sequência e a constelação do usuário devem progredir juntos.
