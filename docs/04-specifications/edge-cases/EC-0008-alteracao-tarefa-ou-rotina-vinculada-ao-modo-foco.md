# [EC-0008] - Exclusão de tarefa ou rotina vinculada a uma sessão ativa do modo foco

## 1. Contexto

Pela regra de negócio [`RN-0001`](../../02-requirements/business-rules/RN-0001.md), toda sessão ativa do modo foco deve estar obrigatoriamente ligada a uma tarefa ou a uma rotina.

## 2. Condição de borda

Enquanto uma sessão do modo foco está ativa, ocorre uma tentativa de excluir a tarefa ou a rotina que está atualmente vinculada a essa sessão.

## 3. Comportamento esperado

O sistema não deve permitir que uma sessão ativa do modo foco permaneça em execução sem tarefa ou rotina associada. Quando o estudante confirma a exclusão de uma tarefa avulsa ou rotina que está vinculada a uma sessão ativa do modo foco, o sistema encerra conjuntamente a sessão ativa (registrando os minutos focados até aquele instante e cancelando a notificação de fim de ciclo `focus-cycle-end`) e desativa o efeito visual de foco no visualizador de sequência.

## 4. Critérios de aceite

- **CA-01:** Em nenhuma hipótese uma sessão ativa do modo foco deve permanecer em andamento após a remoção da tarefa ou rotina à qual estava vinculada.
- **CA-02:** Caso a sessão do modo foco seja encerrada em razão da exclusão da atividade vinculada, o efeito exclusivo de sessão ativa do modo foco no visualizador de sequência ([`RN-0006`](../../02-requirements/business-rules/RN-0006.md)) deve ser desativado.
- **CA-03:** O comportamento entre bloquear a exclusão ou encerrar a sessão mediante confirmação deve seguir o fluxo validado para a funcionalidade.
