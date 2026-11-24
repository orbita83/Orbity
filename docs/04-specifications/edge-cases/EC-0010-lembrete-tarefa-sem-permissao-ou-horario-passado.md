# [EC-0010] - Lembrete de tarefa com permissão negada ou horário de início no passado

## 1. Contexto

Durante a criação, edição ou reabertura de uma tarefa avulsa com data e horário de início ([RF-0013](../../02-requirements/functional/RF-0013.md), [RF-0021](../../02-requirements/functional/RF-0021.md), [RN-0011](../../02-requirements/business-rules/RN-0011.md), [FL-0016](../flows/FL-0016.md)), a permissão de notificações do sistema operacional pode estar negada ou o horário configurado pode já ter passado no relógio local do aparelho.

## 2. Condição de borda

O estudante salva ou reabre uma tarefa avulsa agendada quando a permissão `POST_NOTIFICATIONS` do Android está negada (ou o serviço nativo falha) ou quando a combinação de `startDate` e `startTime` resulta em um instante igual ou anterior ao horário atual do aparelho.

## 3. Comportamento esperado

Quando a permissão de notificações estiver negada, o sistema deve concluir a criação ou edição da tarefa normalmente no armazenamento local e apresentar ao estudante uma mensagem informativa, acolhedora e não bloqueante indicando que as notificações podem ser ativadas nas configurações do aparelho. Quando o horário de início já tiver passado (na criação, edição ou reabertura), o sistema deve salvar ou reabrir a tarefa normalmente, sem agendar lembrete retroativo e cancelando qualquer lembrete anterior daquela tarefa.

## 4. Critérios de aceite

- **CA-01:** A recusa da permissão de notificações ou uma falha técnica do serviço de notificações nunca deve impedir salvar, editar, concluir, reabrir ou excluir uma tarefa.
- **CA-02:** Ao salvar uma tarefa com data e horário de início quando a permissão estiver negada, o sistema deve exibir uma indicação não bloqueante e sem tom punitivo.
- **CA-03:** Tarefas criadas, editadas ou reabertas com data e horário de início no passado ou no instante atual não devem agendar notificação local.
- **CA-04:** Se uma tarefa que possuía lembrete futuro for editada para um horário já passado ou tiver sua data/horário de início removidos, o lembrete anterior deve ser cancelado.
