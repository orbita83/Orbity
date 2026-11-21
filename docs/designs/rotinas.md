# Rotinas: domínio, persistência e integração com a sequência

> **Status:** Proposed (aguardando revisão humana) · **Autor:** MateusARJ · **Data:** 2026-11-15 · **Issue:** #132
>
> Continua o PR #130, que trouxe só o visual das telas 3, 3.1, 3.2, 3.3 e 3.4 do protótipo do Claude Design, e se apoia no domínio de Tarefas do PR #129 ([tarefas.md](tarefas.md)).

## Overview

A aba Rotinas deixa de guardar o estado só em memória. Esta mudança cria a entidade `Routine` e as tabelas de rotinas, ocorrências e marcações por dia (migração v3). Também traz os casos de uso de criar, consultar, excluir, desfazer, concluir e reabrir a ocorrência do dia, e liga tudo às ViewModels do #130.

Concluir a rotina do dia registra o dia na sequência (RN-0002). As tarefas de uma rotina são a mesma entidade `Task` de Tarefas, com um vínculo opcional à rotina.

## The Problem

- As ViewModels do #130 agem só em memória. A lista começa vazia, o detalhe mostra "Rotina indisponível" e criar ou concluir não persiste nada.
- Rotinas não registram atividade, então a sequência só conta tarefas avulsas.
- O Modo Foco só é liberado por tarefas, mas a RN-0001 também aceita rotinas.

## Goals

- **G1:** Criar (RF-0007, RF-0012), consultar (RF-0008) e excluir com "Desfazer" (RF-0010, protótipo 3.4) rotinas, com os dados mantidos entre aberturas do app no Android.
- **G2:** Concluir a ocorrência do dia (RF-0011), uma vez por dia (CA-05). Concluir marca todas as tarefas do dia (RN-0004), preserva as que já estavam marcadas (EC-0005) e registra o dia na sequência (RN-0002).
- **G3:** "Desmarcar todos" reabre a ocorrência sem apagar o dia da sequência (RF-0014 CA-04, padrão F8 do ODS: "reverter sem perda punitiva de sequência").
- **G4:** Uma rotina só pode ser concluída nos dias configurados para ela (RF-0012 CA-04).
- **G5:** Manter o MVVM do [ARCHITECTURE.md](../../ARCHITECTURE.md): regras no domínio e nos casos de uso, e estado de tela nas ViewModels, sem mudar o visual do #130 além do bloqueio em dia inativo.

## Non-Goals

- Horário da rotina. Nenhum requisito define o horário, e o formulário não tem esse campo. O `timeLabel` do detalhe fica vazio.
- Arraste de verdade das tarefas. A alça continua subindo uma posição por toque, como no #130, mas a nova ordem passa a ser salva.
- Apagar fisicamente as rotinas excluídas (ver R1).

## Decisions & Open Questions

- **R1 — Tarefas da rotina:** são `Task` com `routineId` e `position`. A tabela `tasks` ganha as colunas `routine_id` e `position`. Tarefas com `routineId` não aparecem na tela Tarefas e não contam como tarefa avulsa para a sequência (RN-0002, D1 de [tela-inicial-base.md](tela-inicial-base.md)). Isso resolve a lacuna "Tarefas de Rotina vs. Gerais" do `05-padroes.md`. "+ Adicionar tarefa" cria uma tarefa nova, ligada à rotina, e não associa uma tarefa já existente (pendência do FL-0005).
- **R2 — Estado por dia:** a conclusão da ocorrência (`routine_occurrences`) e as marcações das tarefas (`routine_task_checks`) são guardadas por data local. No dia seguinte, tudo começa desmarcado. O campo `completed` do `Task` não é usado pelas tarefas de rotina.
- **R3 — Desmarcar uma tarefa depois de concluir (EC-0006):** só aquela tarefa volta a pendente, e a ocorrência continua concluída. Marcar todas as tarefas, uma a uma, **não** conclui a rotina sozinha. A rotina só é concluída por "Marcar como concluída" ou pelo círculo da lista.
- **R4 — "Desmarcar todos" e o círculo de uma rotina concluída:** reabrem a ocorrência e desmarcam as tarefas do dia. O dia continua na sequência (RF-0014 CA-04).
- **R5 — Concluir de novo no mesmo dia:** não faz nada. Não há segundo registro nem mensagem de erro, para ficar sem punição (RF-0011 CA-05, EC-0004).
- **R6 — Dia não configurado (RF-0012 CA-04):**
  - A lista mostra todas as rotinas.
  - O resumo "X de Y concluídas" conta só as rotinas de hoje.
  - Em dia inativo, o círculo da lista, os círculos das tarefas e o "Marcar como concluída" ficam desabilitados, com o texto de apoio "Esta rotina não é de hoje."
  - O domínio também recusa a conclusão nesses dias (`ValidationError`).
  - A reordenação continua liberada.
- **R7 — Excluir com "Desfazer":**
  - A exclusão é um *soft delete*: `routines.deleted_at` recebe a data, e "Desfazer" limpa esse campo.
  - Rotinas excluídas não aparecem na lista nem no detalhe, e não liberam o Modo Foco.
  - Ocorrências e dias registrados não mudam: "Sua sequência, suas estrelas e suas conquistas continuam do mesmo jeito".
  - A remoção física fica para depois.
- **R8 — Ícone:** o UC-0005 fala em "categoria (opcional)", e o protótipo 3.1 usa o ícone, com "Geral" como padrão. Desde a issue #159, o domínio guarda um id, e não o nome do ícone: `RoutineIcon = "general" | TaskCategoryId` (`ROUTINE_ICONS`, com `DEFAULT_ROUTINE_ICON = "general"`). Os ids são os mesmos das categorias de tarefa (`tarefas.md`, T3), mais "general". O símbolo do Material Symbols e o rótulo de cada id ficam em `src/view/routinesCopy.ts` (`ROUTINE_ICON_SYMBOLS` e `ROUTINE_ICON_LABELS`), e os rótulos da rotina podem continuar diferentes dos da categoria (ex.: "Livro" e "Leitura" para `reading`). A migração v4 converte os ícones já gravados (`track_changes` → `general`, `menu_book` → `reading`, `calculate` → `mathematics`, `translate` → `languages`, `science` → `science`, `code` → `programming` e `music_note` → `music`).
- **R9 — Modo Foco:** há alvo quando existe ao menos uma tarefa avulsa **ou** uma rotina não excluída (RN-0001). O `TaskActivityDataSource` passa a receber o DataSource de rotinas.
- **R10 — Progresso da Início (RN-0007, issue #138):** o card passa a se chamar "Seu progresso". `concluídas = tarefas avulsas concluídas + rotinas de hoje concluídas hoje` e `total = tarefas avulsas + rotinas de hoje`. As tarefas de rotina não contam sozinhas, e uma rotina fora do dia não entra no total. `IActivityDataSource.getProgressCounts(today)` recebe o dia do `HomeUseCases`, que o lê do relógio.
- **R11 — Editar rotina (RF-0009, UC-0007, FL-0007, issue #137):** reaproveita o formulário de Nova rotina (`new-routine?id=<id>`), como a edição de tarefas. As tarefas chegam ao caso de uso na ordem final, com `id` quando já existem. As que têm `id` são mantidas (renomear ou reordenar preserva a marcação de hoje), as novas entram desmarcadas, e as ausentes são removidas com as marcações delas. A ocorrência do dia e a sequência nunca mudam por uma edição, e a edição vale em qualquer dia. Sair com alterações pergunta "Descartar alterações?". O estado vazio do detalhe ganha o atalho "Adicionar tarefas", que abre a edição.

### Ainda em aberto

- **Q1 (resolvida na issue #159):** os ícones de rotina usam os mesmos ids das categorias de tarefa, mais "general". Os rótulos continuam separados (R8).
- **Q2 (resolvida):** as pendências da RN-0007 foram decididas na issue #138 (opção A, ver R10). A RN-0007 e o ODS (F1/F2, `barra-progresso.md`) agora dizem a mesma coisa.

## Critical User Journeys (CUJs)

### CUJ 1: Criar uma rotina
O estudante toca em "Nova rotina", informa o nome, escolhe os dias e adiciona tarefas, e então toca em "Criar rotina". A rotina aparece na lista. As tarefas dela não aparecem na aba Tarefas. Sem nome ou sem dia, as mensagens aparecem e nada do que foi digitado se perde.

### CUJ 2: Concluir a rotina do dia
Numa segunda-feira, o estudante abre "Matemática" (Seg a Sex) e marca uma tarefa: a sequência não muda. Ele toca em "Marcar como concluída": todas as tarefas ficam marcadas, a comemoração aparece, o rodapé vira "Desmarcar todos" e a sequência da Início sobe uma vez.

### CUJ 3: Reverter sem punição
Depois de concluir, o estudante desmarca uma tarefa: a rotina continua concluída. "Desmarcar todos" reabre a rotina, e a sequência continua igual.

### CUJ 4: Rotina fora do dia
Num sábado, "Matemática" aparece na lista com o círculo desabilitado e o texto "Esta rotina não é de hoje.". O resumo "Hoje" não conta essa rotina.

### CUJ 5: Excluir e desfazer
No detalhe, o estudante toca em "Excluir rotina" e confirma. A lista mostra "Rotina Matemática excluída." com "Desfazer". Desfazer devolve a rotina com as tarefas e o estado do dia.

### CUJ 6: Editar a rotina
No detalhe, o estudante toca em "Editar", troca o nome, remove uma tarefa e adiciona outra, e toca em "Salvar alterações". Aparece "Rotina atualizada!", e "Ver rotina" mostra o detalhe já atualizado. Se a rotina estava concluída hoje, continua concluída, e a tarefa nova aparece desmarcada.

## Technical Plan (Architecture)

### 1. Domínio (`src/model/`)
- `entities/routine.ts`:
  - tipos: `Routine`, `RoutineIcon`, `ROUTINE_ICONS`, `DEFAULT_ROUTINE_ICON`, `Weekday` (0 = domingo), `CreateRoutineInput`, `RoutineTaskDraft { id?, title }`, `RoutineOverview` (lista) e `RoutineDetails` (detalhe);
  - funções: `isRoutineIcon`, `isWeekday`, `weekdayOf(LocalDate)` e `isRoutineActiveOn(routine, date)`.
- `entities/task.ts`: `routineId?` e `position?`, mais `isStandaloneTask`.
- `datasources/iRoutineDataSource.ts`:
  - consulta: `listActive`, `findById` e `listCompletedOn(date)`;
  - criação, edição e exclusão: `create(routine, tasks)` e `update(routine, { created, updated, deletedIds })` (transações) e `markDeleted`/`restore`;
  - ocorrência do dia: `completeOccurrence(id, date, taskIds, at)` (transação) e `reopenOccurrence(id, date)`;
  - marcações: `listTaskChecks(id, date)` e `setTaskCheck(id, taskId, date, checked)`.
- `datasources/iTaskDataSource.ts`: ganha `listByRoutine(routineId)`, em ordem de posição.

### 2. Casos de uso (`src/usecase/`)
- `IRoutineUseCases` e `RoutineUseCases`, que dependem de `IRoutineDataSource`, `ITaskDataSource`, `IDailyActivityDataSource` e `IClockService`:
  - `listRoutines` e `getRoutine` (devolve `null` se não existir);
  - `createRoutine`, `updateRoutine` (R11), `deleteRoutine` e `restoreRoutine`;
  - `completeOccurrence`, `reopenOccurrence`, `toggleRoutineTask` e `moveRoutineTaskUp`.
- `routineInputValidation.ts`: `validateCreateRoutineInput` e `validateUpdateRoutineInput`, com as mesmas regras. Saíram da entidade na issue #159 (`ARCHITECTURE.md`, §5).
- `TaskUseCases.listTasks` passa a devolver só as tarefas avulsas.

### 3. Persistência (`src/infra/`)
- Migração v3:
  - `routines` (com `deleted_at`);
  - `routine_occurrences (routine_id, local_date, completed_at)`, com chave composta;
  - `routine_task_checks (routine_id, task_id, local_date)`, com chave composta;
  - `tasks.routine_id` e `tasks.position`, com o índice `idx_tasks_routine`.
- Migração v4 (issue #159): converte `routines.icon` e `tasks.category` para os ids em inglês (R8 e `tarefas.md`, T8).
- `SqliteRoutineDataSource` e `MemoryRoutineDataSource` passam pela mesma suíte de contrato (`routineDataSource.contract.ts`). A versão em memória recebe o `MemoryTaskDataSource`, para criar as tarefas da rotina.
- `TaskActivityDataSource(tasks, routines)`, conforme R9 e R10.

### 4. Composição (`src/di/`)
- `createPersistence()` devolve `routines`, e o container registra `useCases.routines`.

### 5. Apresentação (`src/viewmodel/` e `src/view/`)
- As três ViewModels usam `IRoutineUseCases` e ganham `loading` e `errorKey`. Elas aceitam um array de protótipo, como o `useTasksViewModel`, para o Storybook e as fixtures continuarem sem `@/di`.
- `RoutineListItem` e `RoutineDetails` ganham `activeToday`, e o detalhe ganha `doneToday`, vindo da ocorrência e não de "todas as tarefas marcadas".
- `RoutineDetailsScreen` lê o `id` da rota. As telas recarregam ao ganhar foco (`useFocusEffect`), como em Tarefas (T6).
- **ODS 1.2.0:** depois de criar, "Rotina criada!" (`SuccessDialog`, passo 4 do F7); esqueleto dos cards ao carregar (`SkeletonCards`, F8); barra de progresso do detalhe com contador e porcentagem fora da barra (`barra-progresso.md`); estado vazio "Nenhuma tarefa nesta rotina" (F8), com o atalho "Adicionar tarefas" para a edição (R11).
- **Edição (R11):** `useNewRoutineViewModel(useCases, routineId)` carrega a rotina e ganha `editing`, `loading`, `discardVisible`, `requestLeave` e `cancelLeave`. O formulário troca o título, o botão e a mensagem de sucesso ("Rotina atualizada!"), e usa a variante Confirmação do modal para "Descartar alterações?". `NewRoutineScreen` volta para o detalhe ao sair ou salvar.

## Alternatives Considered

### Alternative A: Tarefas próprias da rotina (`routine_tasks`)
Isolaria Rotinas do código de Tarefas, mas criaria duas entidades de tarefa. Também deixaria sem resposta a regra da RN-0002 de "tarefa sem rotina associada". Rejeitada pelo autor.

### Alternative B: Excluir de vez e recriar no "Desfazer"
Exigiria guardar um retrato completo da rotina, com tarefas, ocorrências e marcações, na ViewModel. O *soft delete* é mais simples e não perde o histórico.

## Risks & Mitigations

- **Migração v3 em bancos que já estão na v2:** o `ALTER TABLE` acrescenta colunas que aceitam nulo, e as tarefas existentes continuam avulsas. Um teste cobre a passagem de v2 para v3.
- **Mudança no código de Tarefas (#129):** as alterações em `Task`, `TaskUseCases` e `TaskActivityDataSource` são pequenas e cobertas pelos testes que já existem. Combinadas com o Vitor.
- **Duas fontes de "concluída" para a mesma tarefa:** as tarefas de rotina não usam `Task.completed`. Só o `routine_task_checks` vale para elas, e nenhuma tela de Tarefas as mostra.
