# [UC-0016] - Notificar tarefas agendadas

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0016 |
| **Nome** | Notificar tarefas agendadas |
| **Ator principal** | Estudante |
| **Objetivo** | Receber lembretes locais no horário de início das tarefas avulsas agendadas e acessar a lista de tarefas ao tocar na notificação |

## 2. Contexto

Complementa o cadastro, a edição e o acompanhamento de tarefas ([UC-0001](UC-0001-criar-tarefa.md), [UC-0002](UC-0002-consultar-tarefas.md), [UC-0003](UC-0003-concluir-tarefa.md) e [UC-0004](UC-0004-gerenciar-tarefas-selecionadas.md)). Quando o estudante define data e horário de início futuros em uma tarefa avulsa ([RF-0013](../../02-requirements/functional/RF-0013.md)), o sistema gerencia o ciclo de vida do lembrete local conforme [RF-0021](../../02-requirements/functional/RF-0021.md) e [RN-0011](../../02-requirements/business-rules/RN-0011.md), reconciliando os agendamentos ao abrir a aba **Tarefas** e tratando a ausência de permissão do sistema operacional sem bloquear o fluxo ([EC-0010](../edge-cases/EC-0010-lembrete-tarefa-sem-permissao-ou-horario-passado.md)).

## 3. Pré-condições

- O aplicativo deve estar instalado em um aparelho compatível com o serviço local de notificações.
- Para que o lembrete seja exibido pelo sistema operacional no horário agendado, a permissão de notificações deve estar concedida pelo estudante.

## 4. Pós-condições

- Os lembretes agendados no sistema operacional refletem as tarefas avulsas pendentes com data e horário de início futuros.
- Ao tocar na notificação exibida, o estudante é direcionado para a aba **Tarefas**.
- Caso a permissão de notificações esteja negada, a tarefa permanece salva normalmente e o estudante recebe uma indicação informativa e não punitiva.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0016 | Notificação e reconciliação de tarefas agendadas | [FL-0016](../flows/FL-0016.md) |
