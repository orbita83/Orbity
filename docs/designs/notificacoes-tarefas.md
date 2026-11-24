# Notificações de tarefas agendadas: ciclo de vida, reconciliação e navegação

> **Status:** Proposed · **Autor:** AlissonSena7 · **Data:** 2026-11-23 · **Issue:** #211
>
> Complementa [`tarefas.md`](tarefas.md) e apoia-se na infraestrutura de notificações locais do [`ADR-0002`](../05-architecture/decisions/ADR-0002.md) (issue #209).

## Overview

As tarefas avulsas já podem ser salvas com data e horário de início e de término ([RF-0013](../02-requirements/functional/RF-0013.md)), mas o agendamento servia apenas como rótulo informativo na lista. Esta funcionalidade conecta os casos de uso de tarefas (`TaskUseCases`) e as ViewModels (`useNewTaskViewModel` e `useTasksViewModel`) ao contrato de domínio `INotificationService` ([ADR-0002](../05-architecture/decisions/ADR-0002.md)), agendando, reagendando, cancelando e reconciliando lembretes locais para tarefas avulsas pendentes com horário futuro ([RF-0021](../02-requirements/functional/RF-0021.md), [RN-0011](../02-requirements/business-rules/RN-0011.md)).

## The Problem

- O estudante preenche data e horário de início numa tarefa avulsa, mas não recebe nenhum aviso quando o horário chega.
- Edições de data/hora/título, conclusões, reaberturas e exclusões precisam manter os lembretes do sistema operacional sincronizados sem deixar notificações órfãs.
- No Android 13+, a recusa da permissão `POST_NOTIFICATIONS` nunca pode impedir a criação ou edição da tarefa nem apresentar mensagens punitivas ([`design-system/01-principios.md`](../../design-system/01-principios.md), [EC-0010](../04-specifications/edge-cases/EC-0010-lembrete-tarefa-sem-permissao-ou-horario-passado.md)).

## Goals

- **G1:** Agendar lembrete local com identificador determinístico `task-reminder:<id>` ao criar ou editar uma tarefa avulsa pendente com `startDate` e `startTime` no futuro ([RN-0011](../02-requirements/business-rules/RN-0011.md)).
- **G2:** Reagendar o lembrete ao alterar data, horário ou título; cancelar ao remover data/horário de início, concluir ou excluir a tarefa; e reagendar ao reabrir uma tarefa concluída cujo horário de início ainda seja futuro.
- **G3:** Reconciliar os lembretes `task-reminder:*` com as tarefas avulsas pendentes salvas ao abrir ou recarregar a aba **Tarefas** (`reconcileScheduledReminders`).
- **G4:** Preservar o salvamento da tarefa quando a permissão de notificações estiver negada, exibindo uma indicação informativa, acolhedora e não bloqueante.
- **G5:** Direcionar o estudante para a aba **Tarefas** (`/tasks`) ao tocar na notificação entregue, mantendo a navegação na camada ViewModel ([`RULES.md`](../../RULES.md)).

## Non-Goals

- Seleção de antecedência customizada por tarefa ou lembrete no horário de término.
- Lembretes individuais para tarefas pertencentes a rotinas (`routineId` preenchido).
- Notificações push remotas ou sincronização em nuvem.

## Decisions & Open Questions

| Id | Decisão |
| :-- | :------ |
| **D1** | O lembrete dispara no instante exato de início (`startDate` + `startTime` combinados no fuso local do `IClockService`), usando o identificador determinístico `task-reminder:<id>`. |
| **D2** | Não há lembrete no horário de término (`endDate` / `endTime`). O propósito é lembrar o início do estudo sem excesso de interrupções. |
| **D3** | Tarefas com `routineId` (`isStandaloneTask(task) === false`) nunca geram lembrete individual de tarefa ([RN-0011](../02-requirements/business-rules/RN-0011.md)). |
| **D4** | Os textos seguem [`design-system/01-principios.md`](../../design-system/01-principios.md): título `"Hora de estudar"` e corpo `'Sua tarefa "{título}" começa agora. Bons estudos!'`, com metadados `{ route: "/tasks", taskId: task.id }`. |
| **D5** | O cálculo puro de identificador e instante de disparo (`buildTaskReminderId`, `isTaskReminderId`, `getTaskReminderTriggerAt`) fica em `src/model/entities/task.ts` (sem textos de interface, respeitando a issue #159), e a montagem do payload de notificação (`buildTaskReminderInput`) e orquestração ficam em `src/usecase/`. |
| **D6** | A resposta ao toque na notificação é exposta por `INotificationService.onNotificationResponse` (adaptada em `ExpoNotificationService` sem vazar tipos do Expo) e repassada por `ITaskUseCases.onTaskReminderPress` para a ViewModel acionar `router.navigate("/tasks")`. |

## Critical User Journeys

- **CUJ 1 (Agendar e tocar):** O estudante cria uma tarefa avulsa com data e horário de início futuros. No horário configurado, a notificação aparece com mensagem acolhedora; ao tocar nela, o app abre na aba **Tarefas**.
- **CUJ 2 (Editar, concluir e reabrir):** O estudante muda o horário da tarefa e o lembrete é atualizado. Se concluir a tarefa antes do horário, o lembrete é cancelado; se desmarcar enquanto o horário ainda é futuro, o lembrete volta a ser agendado.
- **CUJ 3 (Permissão negada):** Com a permissão de notificações desativada no Android, o estudante cria uma tarefa agendada. A tarefa é salva normalmente e a interface exibe um aviso informativo e não punitivo.

## Technical Plan

### 1. Domínio (`src/model/`)

- `entities/task.ts`: constantes e funções puras `TASK_REMINDER_PREFIX`, `buildTaskReminderId`, `isTaskReminderId` e `getTaskReminderTriggerAt(task, referenceIso)`.
- `services/iNotificationService.ts`: método opcional `onNotificationResponse?(listener: (data: Readonly<Record<string, string>>) => void): () => void` para escutar toques em notificações sem expor tipos do `expo-notifications`.

### 2. Casos de uso (`src/usecase/`)

- `taskNotification.ts` / `taskUseCases.ts`: montagem do `ScheduleNotificationInput` (`buildTaskReminderInput`) e sincronização de lembretes em `createTask`, `updateTask`, `toggleTaskCompletion` e `deleteTasks`.
- `iTaskUseCases.ts` e `taskUseCases.ts`:
  - `reconcileScheduledReminders(): Promise<void>`: compara `listTasks()` com `notificationService.listScheduled()`, remove lembretes `task-reminder:*` órfãos e agenda/atualiza os lembretes das tarefas avulsas pendentes futuras.
  - `ensureReminderPermission(): Promise<NotificationPermissionStatus>`: consulta e solicita permissão sob demanda sem lançar erro bloqueante.
  - `onTaskReminderPress(onPress: (taskId?: string) => void): () => void`: filtra cliques em notificações com `data.route === "/tasks"`.

### 3. Infraestrutura e Composição (`src/infra/` e `src/di/`)

- `expoNotificationService.ts` e `fakeNotificationService.ts`: suporte a `onNotificationResponse`.
- `container.ts`: injeta `services.notifications` na fábrica de `TaskUseCases`.

### 4. Apresentação (`src/viewmodel/` e `src/view/`)

- `useNewTaskViewModel.ts`: ao salvar tarefa com `startDate` e `startTime`, verifica `ensureReminderPermission()` e preenche `reminderPermissionNotice` quando o status não for `"granted"`.
- `useTasksViewModel.ts`: aciona `reconcileScheduledReminders()` ao carregar/recarregar a lista e registra `onTaskReminderPress` para navegar até `"/tasks"`.
- `tasksCopy.ts`, `new-task-content.tsx` e `tasks-content.tsx`: textos acolhedores e exibição não bloqueante do aviso de permissão.

## Alternatives Considered

### Alternative A: Agendar notificações diretamente na ViewModel

Viola o [`ARCHITECTURE.md`](../../ARCHITECTURE.md) e o linter de arquitetura (`ARCH-002`), pois a ViewModel não pode acessar `container.services` nem conter regras de negócio de reconciliação. Descartada.

### Alternative B: Importar `expo-notifications` em um hook de navegação na ViewModel

Viola o [`ADR-0002`](../05-architecture/decisions/ADR-0002.md) e a regra `no-restricted-imports` do ESLint, que restringem `expo-notifications` exclusivamente a `src/infra/services/expoNotificationService.ts`. Descartada.

## Risks & Mitigations

| Risco | Mitigação |
| :---- | :-------- |
| Notificações órfãs após exclusão ou conclusão com falha momentânea | `reconcileScheduledReminders()` varre `listScheduled()` ao abrir a aba Tarefas e remove qualquer `task-reminder:*` sem tarefa avulsa pendente futura correspondente. |
| Permissão negada no Android 13+ interromper o fluxo de criação | `TaskUseCases` persiste a tarefa antes de sincronizar o lembrete e captura falhas/recusas silenciosamente; a ViewModel exibe apenas aviso informativo. |
| Vazamento de tipos nativos do Expo para camadas superiores | `onNotificationResponse` trafega apenas `Readonly<Record<string, string>>` já higienizado por `sanitizeData` no adaptador da infraestrutura. |

## Verification Plan

Testes unitários e de integração com `FakeNotificationService` cobrindo agendamento, reagendamento, remoção de horário, conclusão, reabertura (futura e passada), exclusão, tarefas de rotina, reconciliação de órfãos, permissão negada e navegação ao tocar na notificação. Execução completa de `npm run lint`, `npm run typecheck`, `npm test`, `npm run build-storybook` e `npm run lint:architecture`.
