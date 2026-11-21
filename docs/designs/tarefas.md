# Tarefas: domínio, persistência e integração com a Início

> **Status:** Proposed (aguardando `/egm:egm-review` e revisão humana) · **Autores:** vitorlopes-coder, MailsonSousa88 · **Data:** 2026-11-15
>
> Este design foi escrito depois da implementação do PR #129, para cumprir o `AGENTS.md` (§4) e registrar as decisões já tomadas (issue #131). Onde o código e este texto divergirem, a revisão decide qual dos dois muda.

## Overview

A aba Tarefas deixa de ser só visual e passa a guardar as tarefas do estudante. A mudança cria a entidade `Task` no domínio, a tabela `tasks` no SQLite (migração v2), os casos de uso de criar, listar, editar, concluir, fixar e excluir, e liga tudo às telas de Tarefas e à Início. Concluir uma tarefa registra o dia na sequência, e o progresso da Início passa a contar tarefas reais.

A camada visual veio antes, no próprio PR #129, a partir das telas 2, 2.1, 2.2 e 2.3 do protótipo do Claude Design e dos componentes da base (#128).

## The Problem

- A Início mostrava "0/0" e o Modo Foco bloqueado porque o `EmptyActivityDataSource` não tinha tarefas para contar (D7 de [tela-inicial-base.md](tela-inicial-base.md)).
- A tela de Tarefas guardava as ações só em memória, e tudo se perdia ao fechar o app.
- A sequência (RN-0002, RF-0014) não tinha nenhuma atividade real para registrar.

## Goals

- **G1:** Criar, listar, editar, concluir, desconcluir, fixar, desafixar e excluir tarefas, com os dados mantidos entre aberturas do app no Android.
- **G2:** Concluir uma tarefa registra o dia local na sequência; desmarcar não apaga o dia (RN-0002, RF-0014 CA-04).
- **G3:** A Início mostra o progresso e libera o Modo Foco a partir das tarefas reais, e recarrega ao voltar para a aba.
- **G4:** Validações nos casos de uso (`ARCHITECTURE.md`, §5): título obrigatório, data `dd/mm/aaaa` existente no calendário, hora `hh:mm` e término igual ou depois do início.
- **G5:** Manter a arquitetura MVVM do [ARCHITECTURE.md](../../ARCHITECTURE.md): a view só apresenta, a ViewModel guarda o estado da tela, o domínio guarda só tipos e regras de negócio puras, e as validações de entrada ficam nos casos de uso.

## Non-Goals

- Tarefas dentro de rotinas e a relação entre as duas abas (lacuna "Tarefas de Rotina vs. Gerais" do `05-padroes.md`).
- Categorias criadas pelo estudante; a lista é fixa nesta iteração.
- Sessão de foco ligada a uma tarefa (fica para o motor do Modo Foco).
- Sincronização entre aparelhos.

## Decisions & Open Questions

- **T1:** A tarefa guarda datas e horas como texto no formato de exibição (`dd/mm/aaaa` e `hh:mm`), validado nos casos de uso. A ordenação usa `pinned` e `created_at`, não o prazo.
- **T2:** A tabela `tasks` entra pela migração v2 no mesmo banco do registro diário (ADR-0001), com índice `(pinned DESC, created_at DESC)`.
- **T3:** Seis categorias iniciais de estudo (Matemática, Leitura, Idiomas, Ciências, Programação e Música), mais "Sem categoria". O domínio conhece só os ids, em inglês (`TASK_CATEGORY_IDS`: `mathematics`, `reading`, `languages`, `science`, `programming` e `music`). Rótulo e ícone de cada id ficam na apresentação (`src/view/categoryCopy.ts`), e as ViewModels expõem só o id (issue #159).
- **T4:** Fixar em lote alterna: se todas as selecionadas já estão fixadas, a ação desafixa (o rótulo vira "Desafixar").
- **T5:** O `TaskActivityDataSource` substitui o `EmptyActivityDataSource` na composição. Há Modo Foco disponível quando existe ao menos uma tarefa.
- **T6:** A Início e a lista de Tarefas recarregam ao ganhar foco (`useFocusEffect`), para refletir mudanças feitas em outra aba.
- **T7:** Datas e horas aceitam digitação direta (com máscara automática na ViewModel para `dd/mm/aaaa` e `hh:mm` e normalização de entradas equivalentes nos casos de uso) e também um seletor em modal (`TaskPickerModal`, ver `design-system/04-componentes/seletor-opcoes.md`).
- **T8 (issue #159):** A migração v4 (`database/migrations.ts`) converte os ids de categoria gravados antes da troca (`matematica`, `leitura`, `idiomas`, `ciencias`, `programacao` e `musica`), na mesma transação que converte os ícones de rotina (`rotinas.md`, R8). Sem ela, o `SqliteTaskDataSource` descartaria a categoria das tarefas antigas sem avisar.

### Ainda em aberto

- **Q1 (resolvida na issue #138):** o rótulo mudou para "Seu progresso", e a contagem das tarefas avulsas continua pelo total geral (RN-0007). Ver `rotinas.md`, R10.
- **Q2:** Excluir uma tarefa concluída mantém o dia na sequência (o registro diário é independente). Confirmar se é o comportamento esperado.

## Critical User Journeys (CUJs)

### CUJ 1: Criar uma tarefa
O estudante toca em "Nova tarefa", preenche o título, escolhe a data pelo seletor e toca em "Criar tarefa". Aparece "Tarefa criada!" e a tarefa entra na lista. Sem título, aparece "Dê um título para a tarefa." e nada do que foi digitado se perde.

### CUJ 2: Concluir e desmarcar
Ao tocar no círculo, a tarefa fica riscada, o dia entra na sequência e o progresso da Início sobe. Desmarcar volta a tarefa para pendente sem apagar o dia.

### CUJ 3: Ações em lote e edição
O estudante segura uma tarefa (ou toca no "•••"), pode escolher **Editar** (habilitado quando apenas 1 tarefa está selecionada, abrindo o formulário preenchido para atualização) ou selecionar outras tarefas e escolher Fixar/Desafixar, Marcar todas ou Excluir. Excluir pede confirmação antes.

### CUJ 4: Dados mantidos
O estudante fecha e reabre o app no Android e encontra as mesmas tarefas.

## Technical Plan (Architecture)

### 1. Domínio (`src/model/`)
- `entities/task.ts`: `Task`, `CreateTaskInput`, `UpdateTaskInput`, `TASK_CATEGORY_IDS`, `isTaskCategoryId`, `isStandaloneTask` e `filterAndSortTasks`. Sem rótulos, ícones, máscaras nem texto de tela (issue #159).
- `datasources/iTaskDataSource.ts`: `listAll`, `findById`, `create`, `update`, `updateMany` e `deleteMany`.

### 2. Casos de uso (`src/usecase/`)
- `ITaskUseCases` e `TaskUseCases`, que dependem de `ITaskDataSource`, `IDailyActivityDataSource` e `IClockService`. Além de listar, criar, editar, concluir, fixar e excluir, o contrato oferece `getTask(id)` (a tarefa avulsa em edição) e `todayLocal()` (a data de referência das opções de data), para a ViewModel depender só dele (issue #158).
- `taskInputValidation.ts`: `validateTaskTitle`, `validateCreateTaskInput`, `validateDateTimeFields`, `normalizeDisplayDate`, `normalizeDisplayTime`, `isValidDisplayDate` e `isValidDisplayTime`, usados pelo `TaskUseCases` na criação e na edição.
- O título em branco gera `ValidationError` com `field: "title"`, na criação e na edição.
- Concluir (por `toggleTaskCompletion` ou `updateTask`) chama `recordDay` só na passagem de pendente para concluída.

### 3. Persistência (`src/infra/`)
- Migração v2 em `database/migrations.ts`. A v4 converte os ids de categoria para inglês (T8).
- `SqliteTaskDataSource` (Android) e `MemoryTaskDataSource` (testes), validados pela mesma suíte de contrato (`taskDataSource.contract.ts`).
- `TaskActivityDataSource` implementa `IActivityDataSource` sobre o DataSource de tarefas.

### 4. Composição (`src/di/`)
- `createPersistence()` devolve `tasks` e `activities` além de `dailyActivity`, nas duas plataformas.
- O container registra o caso de uso `tasks`.

### 5. Apresentação (`src/viewmodel/` e `src/view/`)
- `useTasksViewModel` carrega, filtra, conclui, seleciona, fixa e exclui pelo caso de uso, com estados de carregamento e erro. Também formata o prazo do card (`formatTaskDueLabel`, "19/10 · 08:00–09:00") e entrega a categoria como id.
- `useNewTaskViewModel` recebe só o `ITaskUseCases` e cuida do formulário (criação e modo de edição quando a rota traz o `id`), das máscaras de digitação de data e hora (`formatDisplayDateInput` e `formatDisplayTimeInput`) e das opções dos seletores. As categorias saem como ids, e a view monta rótulo e ícone pelo `categoryCopy.ts`; a view não importa regras do model. O título obrigatório é validado só no caso de uso: a ViewModel mostra o erro no campo quando recebe um `ValidationError` com `field: "title"`.
- `TasksScreen` e `HomeScreen` recarregam ao ganhar foco.

## Alternatives Considered

### Alternative A: Guardar o prazo como data ISO e hora em minutos
Facilitaria ordenar por prazo, mas exigiria converter em toda exibição e entrada. Como a lista ordena por fixação e criação, o texto validado foi suficiente nesta iteração.

### Alternative B: Banco separado para tarefas
Isolaria as migrações, mas duplicaria o `DatabaseProvider` e a fila de execução. O mesmo banco com migração versionada segue o ADR-0001.

## Risks & Mitigations

- **Migração em aparelhos com o banco v1:** o `DatabaseProvider` aplica a v2 em transação e testa a passagem de v1 para v2.
- **Testes de arquivo no Windows:** os testes que abrem o banco em arquivo fecham as conexões antes de apagar a pasta (issue #131).
- **Troca dos ids de categoria (T8):** a migração v4 converte os valores já gravados e tem teste da passagem de v3 para v4. Um valor desconhecido continua descartado na leitura, como antes.
- **Recarga ao trocar de aba:** pode buscar os dados duas vezes ao abrir a tela; o custo é baixo com o volume esperado de tarefas.
