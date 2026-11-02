# [EC-0001] - Tentativa de iniciar modo foco sem tarefa ou rotina vinculada

## 1. Contexto

No Orbity, o início e a manutenção de uma sessão ativa do modo foco exigem associação obrigatória a uma tarefa ou a uma rotina existente, conforme estabelecido na regra de negócio [`RN-0001`](../../02-requirements/business-rules/RN-0001.md).

## 2. Condição de borda

O usuário tenta iniciar uma sessão do modo foco sem selecionar nenhuma tarefa ou rotina, ou acessa o modo foco quando ainda não existem tarefas nem rotinas cadastradas disponíveis para seleção.

## 3. Comportamento esperado

O sistema deve impedir o início da sessão do modo foco sem vínculo e informar de maneira clara e não punitiva que é necessário selecionar uma tarefa ou rotina existente (ou cadastrar uma atividade caso a lista esteja vazia) antes de iniciar a sessão.

## 4. Critérios de aceite

- **CA-01:** O sistema não deve iniciar uma sessão ativa do modo foco quando nenhuma tarefa ou rotina estiver selecionada.
- **CA-02:** Quando não houver tarefas nem rotinas disponíveis para associação, o sistema deve manter a ação de início bloqueada e orientar o usuário sobre a necessidade de vincular uma tarefa ou rotina.
- **CA-03:** Nenhuma sessão ativa do modo foco deve ser registrada sem referência válida a uma tarefa ou rotina.
