# Categorias: domínio, persistência e casos de uso

> **Status:** Proposed · **Autor:** MailsonSousa88 · **Data:** 2026-11-23 · **Issues:** #212, #213
>
> Continua `tarefas.md` (T3) e `rotinas.md` (R8). O domínio, a persistência e os casos de uso vieram na #212; as telas de Tarefas, Rotinas e Perfil → Categorias vêm na #213. A revisão `/egm:egm-review` não foi feita, por decisão do operador (EGM é opcional, `AGENTS.md`, Seção 4).

## Overview

As categorias de estudo deixam de ser uma lista fixa no código (`TASK_CATEGORY_IDS`) e passam a ser dados do domínio, guardados em SQLite e acessados por um DataSource. Esta mudança cria a entidade `Category`, o contrato `ICategoryDataSource` (SQLite e em memória), a migração v6 com as seis categorias padrão e os casos de uso de listar, criar, renomear, trocar o ícone e excluir. Tarefas e rotinas passam a validar a categoria contra o DataSource. Nenhuma tela muda.

## The Problem

O estudante não consegue criar, renomear nem remover categorias, o que limita a personalização (`design-system/01-principios.md`). O domínio só conhece seis ids e a apresentação mapeia id → rótulo e ícone (`src/view/categoryCopy.ts`), então não há onde guardar uma categoria criada pelo estudante.

## Goals

- **G1:** `Category` como entidade pura (sem rótulo pt-BR e sem nome de ícone do Material Symbols, issue #159).
- **G2:** `ICategoryDataSource` com implementação SQLite e em memória, ambas cobertas pelo mesmo teste de contrato.
- **G3:** Migração v6 que cria a tabela e insere as seis categorias padrão **com os mesmos ids**, sem alterar tarefas e rotinas já salvas.
- **G4:** Casos de uso com validação de entrada em `src/usecase/categoryInputValidation.ts` (RN-0008).
- **G5:** Excluir uma categoria em uso limpa as referências de forma atômica e não apaga tarefas nem rotinas (RN-0009).
- **G6:** Registro no container (`src/di/`).

## Non-Goals

- Telas de Tarefas, Rotinas e Perfil → Categorias (#213).
- Limite de quantidade de categorias, ordenação manual e sincronização remota.
- Resolver o `ARCH-002` (#189).

## Decisions & Open Questions

| Id | Decisão |
| :-- | :------ |
| **D1** | As seis categorias padrão podem ser renomeadas, trocar de ícone e ser excluídas, como as criadas pelo estudante. `isDefault` só registra a origem (RN-0010). |
| **D2** | O nome de uma padrão fica nulo no banco até ela ser renomeada. Com nome nulo, a apresentação usa `categoryCopy.ts` pelo id. O domínio não guarda texto pt-BR. |
| **D3** | Excluir uma categoria em uso, numa só transação: tarefas ficam sem categoria (`NULL`), rotinas (inclusive as excluídas) voltam ao ícone `general` e a categoria é apagada (RN-0009). |
| **D4** | A validação fica em `categoryInputValidation.ts`, módulo auxiliar de `usecase/` (alternativa A da #189). Acrescenta uma ocorrência ao `ARCH-002` até a #189 ser resolvida. |
| **D5** | Nome com no máximo 24 caracteres depois do `trim` e de reduzir espaços repetidos. Unicidade sem diferenciar maiúsculas, minúsculas e acentos (RN-0008). |
| **D6** | Ícone escolhido numa lista fechada de 14 ids de domínio (`CATEGORY_ICON_IDS`). O glifo de cada id fica na view. |
| **D7** | A migração é a **v6**: a v5 foi usada pelas estrelas (#214). A issue #212 citava a v5. |
| **D8** | Não há chave estrangeira de `tasks.category` nem de `routines.icon` para `categories`: `general` não é categoria e o SQLite não altera FK com `ALTER`. A integridade é garantida pelos casos de uso e pela limpeza em `delete`. |

### Ainda em aberto

- **Q1:** O nome de uma categoria criada pode repetir o rótulo pt-BR de uma padrão ainda não renomeada (ex.: "Matemática")? O domínio não conhece esse rótulo. Proposta: permitir no domínio e avisar na ViewModel (#213).

## Critical User Journeys

- **CUJ 1:** O estudante abre Perfil → Categorias, cria "Física" com um ícone e a vê ao criar uma tarefa.
- **CUJ 2:** O estudante renomeia "Música" para "Violão". Tarefas e rotinas que usavam `music` mostram o novo nome.
- **CUJ 3:** O estudante exclui "Idiomas". As tarefas ficam sem categoria, as rotinas voltam ao ícone geral e nada é apagado.

## Technical Plan

### 1. Domínio (`src/model/`)

- `entities/category.ts`: `Category { id, name?, icon, isDefault, createdAt, updatedAt }`, `DEFAULT_CATEGORY_IDS`, `createDefaultCategories`, `CATEGORY_ICON_IDS`, `CATEGORY_NAME_MAX_LENGTH = 24`, `CreateCategoryInput`, `RenameCategoryInput`, `ChangeCategoryIconInput`.
- `entities/task.ts` e `entities/routine.ts`: `category` e `icon` passam a ser ids abertos (`CategoryId = string`); `TASK_CATEGORY_IDS` fica como alias de `DEFAULT_CATEGORY_IDS`.
- `datasources/iCategoryDataSource.ts`: `listAll`, `findById`, `findByNameKey`, `create`, `update` e `delete(id, changedAt)` (atômico, limpa as referências).

### 2. Casos de uso (`src/usecase/`)

- `categoryInputValidation.ts`: funções puras que lançam `ValidationError` (pt-BR) e `toCategoryNameKey` (trim, espaços colapsados, minúsculas e sem acentos).
- `iCategoryUseCases.ts` / `categoryUseCases.ts`: `listCategories`, `createCategory`, `renameCategory`, `changeCategoryIcon`, `deleteCategory`. Construtor `(categoryDataSource, clock, generateId)`.
- `TaskUseCases` e `RoutineUseCases` recebem o `ICategoryDataSource` e validam se a categoria existe.

### 3. Persistência (`src/infra/`)

- Migração v6: tabela `categories (id, name, name_key UNIQUE, icon, is_default, created_at, updated_at)` e as seis padrão, na ordem de `DEFAULT_CATEGORY_IDS`, com `name = NULL`.
- `sqliteCategoryDataSource.ts` e `memoryCategoryDataSource.ts`, ambos testados por `categoryDataSource.contract.ts`.
- `sqliteTaskDataSource.ts` e `sqliteRoutineDataSource.ts` deixam de descartar categoria ou ícone desconhecido ao ler.

### 4. Composição (`src/di/`)

`categories` em `AppDataSources` e `AppUseCases` (`container.ts`) e em `persistence.ts`.

### 5. Apresentação (`src/viewmodel/` e `src/view/`)

- `categoryCopy.ts` e `routinesCopy.ts`: funções de leitura com fallback ("Sem categoria" e `general`), mapa `CATEGORY_ICON_SYMBOLS`, rótulos acessíveis dos 14 ícones (`CATEGORY_ICON_LABELS`), textos da tela **Categorias** (`CATEGORIES_COPY`) e resolução de exibição a partir das categorias salvas no DataSource (`resolveCategoryDisplay`, `getRoutineIconSymbol` e `getRoutineIconLabel`).
- `ITaskUseCases` e `IRoutineUseCases`: expõem `listCategories(): Promise<Category[]>` delegando ao `ICategoryDataSource` já injetado em `TaskUseCases` e `RoutineUseCases` (com fallback centralizado em `createDefaultCategories`), preservando o isolamento das ViewModels de Tarefas e Rotinas (#158).
- `useCategoriesViewModel.ts` e `categories-content.tsx` (#213): substituem o `ProfilePlaceholderScreen` em `src/view/categories.tsx` pela tela completa de gerenciamento de categorias (listagem, estados de carregando/vazio/erro, modal de criação/edição com `TextField` até 24 caracteres e grade `radiogroup` de 14 ícones, e exclusão protegida por `ConfirmDialog` no padrão da #151).
- `useNewTaskViewModel.ts`, `useTasksViewModel.ts`, `useNewRoutineViewModel.ts`, `useRoutinesViewModel.ts` e `useRoutineDetailsViewModel.ts` (#213): carregam as categorias persistidas na montagem e ao ganhar foco (`useFocusEffect`), refletindo criações, renomeações, trocas de ícone e exclusões imediatamente entre as abas sem reiniciar o aplicativo.

## Alternatives Considered

### Alternative A: guardar o rótulo pt-BR das padrão no banco

Mais simples, mas grava texto de interface em dado persistido e impede traduzir. Descartada (D2).

### Alternative B: bloquear a exclusão de categoria em uso

Evita alterar tarefas e rotinas, mas obriga o estudante a esvaziar a categoria antes de excluí-la. Descartada (D3).

### Alternative C: soft delete de categoria

Mantém as referências e permite restaurar, mas deixa categoria "fantasma" para as telas tratarem. Descartada (D3).

## Risks & Mitigations

| Risco | Mitigação |
| :---- | :-------- |
| Perder a categoria de tarefas e rotinas já salvas na migração | A v6 só cria tabela e insere as seis padrão com os mesmos ids; teste de upgrade a partir da v5 com dados reais. |
| Referência órfã (categoria inexistente em uma tarefa) | Os casos de uso validam a existência e `delete` limpa as referências na mesma transação; a view tem fallback. |
| Nova ocorrência do `ARCH-002` | Registrada em D4 e na #189. |
| Conflito de número de migração com outra branch | Conferido: só a v5 (estrelas) existe na `development`. |

## Verification Plan

Testes de migração (banco novo e upgrade a partir da v5), de contrato do DataSource nas duas implementações, de validação e de casos de uso. Depois, `npm run lint`, `npm run typecheck`, `npm test` e `npm run build-storybook`.
