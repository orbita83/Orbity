# Modo Foco: cronômetro pomodoro, persistência e evolução visual

> **Status:** Proposed · **Autor:** AlissonSena7 · **Data:** 2026-11-25 · **Issue:** #217
>
> Continua `tela-inicial-base.md` (D2, D5, D10, D11, D19 e D23) e reutiliza o serviço de notificações locais do [ADR-0002](../05-architecture/decisions/ADR-0002.md) (#209). A revisão `/egm:egm-review` é opcional (`AGENTS.md`, Seção 4).

## Overview

O Modo Foco deixa de ser apenas uma trava estática no painel da Tela Inicial e passa a contar o tempo de verdade por meio de um cronômetro pomodoro persistido em SQLite (migração **v7**). Toda sessão exige vínculo obrigatório com uma tarefa avulsa ou rotina ativa ([RN-0001](../02-requirements/business-rules/RN-0001.md)), usa as durações de foco de 5 a 30 minutos ([RF-0019](../02-requirements/functional/RF-0019.md)), alterna com pausas curtas (5 min) e longas (15 min a cada 4 ciclos), agenda aviso local de término de ciclo (`focus-cycle-end`) e evolui os atributos visuais do planeta durante o foco ([RN-0006](../02-requirements/business-rules/RN-0006.md)).

## The Problem

Em `tela-inicial-base.md`, o motor da sessão de foco foi adiado porque Tarefas, Rotinas e o serviço de notificações locais ainda não existiam. Com esses módulos prontos, o botão `"Iniciar foco"` na Tela Inicial continua sem ação (`onPress={() => undefined}`), o card `"Última sessão"` está sempre vazio e o estudante não dispõe de um cronômetro confiável que sobreviva ao segundo plano, bloqueio de tela ou fechamento do aplicativo.

## Goals

- **G1:** Máquina de estados pura de sessão pomodoro no domínio (`FocusSession`), cobrindo foco, pausa curta, pausa longa, pausar, retomar, avançar fase e encerrar, 100% testável com `IClockService`.
- **G2:** Contagem de tempo baseada em carimbo de término (`cycleEndsAt`) salvo no SQLite (migração v7), imune a congelamento de timers em segundo plano ou reinício do processo.
- **G3:** Vínculo obrigatório com tarefa avulsa ou rotina ativa ([RN-0001](../02-requirements/business-rules/RN-0001.md)) e encerramento automático caso a atividade vinculada seja excluída ([EC-0008](../04-specifications/edge-cases/EC-0008-alteracao-tarefa-ou-rotina-vinculada-ao-modo-foco.md)).
- **G4:** Aviso de fim de ciclo via `INotificationService` (`id: "focus-cycle-end"`), sem bloquear o foco se a permissão for negada.
- **G5:** Evolução progressiva do `PlanetStreakView` durante a sessão ativa ([RN-0006](../02-requirements/business-rules/RN-0006.md)), respeitando `useReduceMotion`, e atualização do card **Última sessão** na Tela Inicial sem linguagem punitiva ([EC-0007](../04-specifications/edge-cases/EC-0007-interrupcao-sessao-modo-foco-em-andamento.md)).

## Non-Goals

- Entrada livre de minutos ou personalização das durações de pausa nesta versão.
- Contabilizar sessões de foco na sequência diária ou na concessão de estrelas ([RF-0019](../02-requirements/functional/RF-0019.md) CA-04, [RN-0002](../02-requirements/business-rules/RN-0002.md)).
- Tela de estatísticas históricas detalhadas de múltiplas sessões passadas.

## Decisions & Open Questions

| Id | Decisão |
| :-- | :------ |
| **D1** | O pomodoro é o próprio motor do **Modo Foco** já existente (acessado pelo botão `"Iniciar foco"` do `FocusBottomSheet` rumo à rota `/focus-session`), preservando as durações de foco de `5, 10, 15, 20, 25 e 30 min` com `15 min` por padrão (RF-0019, D12, D23). |
| **D2** | As pausas usam durações fixas: **5 min** para pausa curta (após os ciclos 1, 2 e 3) e **15 min** para pausa longa (a cada 4 ciclos de foco concluídos). |
| **D3** | Concluir ou encerrar sessões de foco **não** registra dia em `daily_activity` nem concede estrelas (RN-0002, RF-0019 CA-04). Apenas os minutos inteiros efetivamente focados são gravados na sessão e exibidos no card **Última sessão** da Tela Inicial (padrão F2, passo 7). |
| **D4** | O tempo restante nunca depende de decrementar estado em `setInterval`: quando `status = 'running'`, `remainingMs = max(0, Date.parse(cycleEndsAt) - Date.parse(clock.now()))`; quando `status = 'paused'`, usa `pausedRemainingMs`. Um intervalo na ViewModel serve apenas para atualizar a pintura da tela em primeiro plano. |
| **D5** | Excluir uma tarefa ou rotina vinculada a uma sessão ativa encerra a sessão ativa e cancela `focus-cycle-end` (EC-0008), evitando sessão órfã sem impedir o estudante de gerir suas listas. |
| **D6** | Acessibilidade do cronômetro: o visor `MM:SS` **não** usa `accessibilityLiveRegion` contínua; apenas marcos discretos (início, pausa, retomada, falta 1 minuto e término do ciclo) são anunciados em região separada, e `useReduceMotion` desliga pulsos/rotações da arte. |

## Critical User Journeys

- **CUJ 1 (Foco completo e pausas):** O estudante toca em `"Iniciar foco"` na Home, escolhe a tarefa `"Estudar Cálculo"` e `15 min`, inicia a sessão, vê o planeta ganhar atributos conforme o foco avança e, ao fim dos 15 min, transita para a pausa curta de 5 min.
- **CUJ 2 (Segundo plano e reabertura):** Com 10 min restantes, o estudante bloqueia o aparelho por 6 min (ou fecha e reabre o app). Ao voltar, o cronômetro exibe `04:00` restantes calculados por `cycleEndsAt`. Se os 10 min se esgotarem em segundo plano, a notificação local `"focus-cycle-end"` avisa o fim do ciclo.
- **CUJ 3 (Pausar, retomar e encerrar sem punição):** O estudante pausa a sessão (cancelando a notificação agendada), retoma minutos depois (recalculando `cycleEndsAt`) e decide encerrar antes do fim. A sessão fecha com mensagem acolhedora, o planeta volta ao estado normal da sequência e o card **Última sessão** mostra os minutos efetivamente focados.

## Technical Plan

### 1. Domínio (`src/model/`)

- `entities/focusSession.ts`: tipos `FocusPhase` (`"focus" | "short-break" | "long-break"`), `FocusSessionStatus` (`"running" | "paused" | "ended"`), `FocusTarget`, `FocusSession`, constantes (`SHORT_BREAK_MINUTES = 5`, `LONG_BREAK_MINUTES = 15`, `CYCLES_BEFORE_LONG_BREAK = 4`, `FOCUS_CYCLE_NOTIFICATION_ID = "focus-cycle-end"`) e funções puras (`computeRemainingMs`, `isCycleCompleted`, `computePhaseProgress`, `computePlanetFocusStage`, `computeTotalFocusedMinutes`).
- `entities/homeSummary.ts`: acrescenta resumo opcional de sessão ativa (`activeSession`) e última sessão encerrada (`lastSession`) em `FocusAvailability`.
- `datasources/iFocusSessionDataSource.ts`: `getActive()`, `getLatestEnded()`, `save(session)` e `endActiveByTarget(targetKind, targetId, endedAt)`.
- `datasources/iActivityDataSource.ts`: acrescenta `listFocusTargets(): Promise<FocusTarget[]>`.

### 2. Persistência (`src/infra/`)

- Migração **v7** em `migrations.ts`: tabela `focus_sessions` guardando estado completo do ciclo atual, vínculo (`target_kind`, `target_id`, `target_title`), `cycle_ends_at`, `paused_remaining_ms`, `accumulated_focus_ms` e `ended_at`.
- `sqliteFocusSessionDataSource.ts` e `memoryFocusSessionDataSource.ts` validados pela mesma suíte `focusSessionDataSource.contract.ts`.
- `taskActivityDataSource.ts`: implementa `listFocusTargets()` listando tarefas avulsas pendentes/ativas e rotinas ativas.

### 3. Casos de uso e Composição (`src/usecase/` e `src/di/`)

- `iFocusUseCases.ts` / `focusUseCases.ts`: `listTargets`, `getSessionSnapshot`, `startSession`, `pauseSession`, `resumeSession`, `advanceCycle`, `endSession` e `onCycleNotificationPress`. Coordena `IFocusSessionDataSource`, `IActivityDataSource`, `IClockService` e `INotificationService`.
- `taskUseCases.ts` e `routineUseCases.ts`: ao excluir tarefa(s) ou rotina, invocam `focusSessionDataSource?.endActiveByTarget(...)` e cancelam `focus-cycle-end` (EC-0008).
- `homeUseCases.ts`: preenche `activeSession` e `lastSession` em `HomeSummary.focus`.
- `container.ts` e `persistence.ts`: compõem `focusSessions` e `focus`.

### 4. Apresentação (`src/viewmodel/`, `src/view/` e `src/app/`)

- `useFocusSessionViewModel.ts`: estado da tela `/focus-session`, atualização visual de segundo em primeiro plano via `IClockService`, reconciliação em `AppState` e `useFocusEffect`, ocultação da `MainTabBar` enquanto houver ciclo ativo e anúncios acessíveis discretos.
- `useHomeViewModel.ts`: expõe `handleOpenFocus()` e navega para `/focus-session` ao tocar na notificação de fim de ciclo.
- `PlanetIllustration.tsx` e `PlanetStreakView.tsx`: suporte a `focusActive`, `focusStage` (`0..4`) e `reduceMotion` para cumprir o RN-0006 sem afetar a aparência fora do foco.
- `src/app/focus-session.tsx`, `src/view/focus-session.tsx`, `src/view/focus-session-content.tsx` e `src/view/focusCopy.ts`: tela de seleção e condução do pomodoro com tokens de `themes.cosmic`, histórias do Storybook e testes de componente.

## Alternatives Considered

### Alternative A: Decrementar segundos em memória com `setInterval`
Descartada: o sistema operacional suspende timers em segundo plano ou com tela bloqueada, atrasando a contagem e perdendo a sessão se o processo morrer.

### Alternative B: Contar conclusão de pomodoro como atividade diária da sequência
Descartada: contraria expressamente `RF-0019 CA-04` e `RN-0002`.

## Risks & Mitigations

| Risco | Mitigação |
| :---- | :-------- |
| Leitor de tela repetir a contagem a cada segundo | Visor `MM:SS` sem `accessibilityLiveRegion`; anúncios restritos a transições e marcos discretos (D6). |
| Sessão ficar ativa após exclusão da tarefa/rotina | Limpeza em `deleteTasks` e `deleteRoutine` via `endActiveByTarget` + validação ao carregar a sessão (EC-0008). |
| Permissão de notificação negada no Android | Falha/negativa tratada de forma silenciosa e acolhedora, mantendo o cronômetro funcional (RF-0019 CA-06). |

## Verification Plan

Testes unitários de domínio (`focusSession.test.ts`), contrato SQLite/memória e migração v6 → v7, casos de uso com relógio falso e `FakeNotificationService`, ViewModels (`renderHook`) e telas (`@testing-library/react-native`), seguidos de `npm run lint`, `npm run typecheck`, `npm test`, `npm run build-storybook`, `node tests/ods-theme.test.cjs` e `npm run lint:architecture`.
