# view

## Overview

Camada de apresentação do Orbity. Contém os componentes de tela exportados como `default` (re-exportados pelos módulos de rota em `src/app/`), os componentes de UI reutilizáveis em `components/` e os tokens visuais em `theme/`. No estado atual, todas as telas são placeholders que delegam para `PlaceholderScreen`; nenhuma tela desta pasta consome `viewmodel`, `usecase` ou `infra`.

## Interface

- Telas (exportação `default`, cada uma renderiza `PlaceholderScreen` com `title` e `message` em pt-BR):
  - `HomeScreen.tsx` -> `HomeScreen` (título "Início"); importado por `src/app/index.tsx`.
  - `TasksScreen.tsx` -> `TasksScreen`; liga `useTasksViewModel` a `TasksScreenContent` (lista, filtros e seleção múltipla) e esconde a barra de abas na seleção; importado por `src/app/tasks.tsx`.
  - `NewTaskScreen.tsx` -> `NewTaskScreen`; liga `useNewTaskViewModel` a `NewTaskScreenContent` (formulário e "Tarefa criada!"); importado por `src/app/new-task.tsx`.
  - Textos das telas de Tarefas em `tasks-copy.ts`; tarefas de exemplo só para histórias e testes em `__fixtures__/task-list.fixture.ts`.
  - `RoutinesScreen.tsx` -> `RoutinesScreen` (título "Rotinas"); importado por `src/app/routines.tsx`.
  - `CosmosScreen.tsx` -> `CosmosScreen` (título "Cosmos"); importado por `src/app/cosmos.tsx`.
  - `ProfileScreen.tsx` -> `ProfileScreen` (título "Perfil"); importado por `src/app/profile.tsx`.
- Subdiretórios:
  - [components](./components/README.md): componentes nomeados `MainTabBar`, `PlaceholderScreen`, `CardTarefa`, `FilterChips`, `FilterChipItem`, `MaterialSymbol`, `NavBar`, `PrimaryButton` e tipos/constantes associados (`NavTabId`, `DEFAULT_NAV_TABS`, `TaskFilter`, `DEFAULT_TASK_FILTERS`, `MaterialSymbolName`, ...). `MainTabBar` é usado em `src/app/_layout.tsx`.
  - [theme](./theme/README.md): `tokens.ts` com `primitives`, `cosmicColors`, `accessibilityTokens`, `sharedTokens`, `ThemeMode`, `OrbityTheme` e `themes` (`light`, `dark`, `cosmic`).

## Invariants

- Telas são exportadas como `default`; componentes reutilizáveis são exportados de forma nomeada.
- Os textos de placeholder são neutros e não punitivos (ex.: "Suas tarefas aparecerão aqui quando esta área estiver pronta.").
- Telas e componentes estilizam apenas via tokens de `theme/tokens.ts`; as telas placeholder e a barra de abas usam `themes.cosmic` (fixado em `PlaceholderScreen` e `MainTabBar`), enquanto os demais componentes usam `themes.light` como padrão quando `theme` não é informado.
- As abas de `NavBar` (`NavTabId`) correspondem às rotas `index`, `tasks`, `routines`, `cosmos` e `profile` pelo mapeamento em `MainTabBar`, e cada rota tem uma tela correspondente nesta pasta.

## Side Effects

- As telas não têm efeitos colaterais.
- Efeitos dos subdiretórios: navegação via `navigation.emit`/`navigation.navigate` em `MainTabBar`; manipulação de foco/clique no DOM (somente web) em `FilterChips`; estado local de foco via `useState`. Detalhes em [components](./components/README.md).

## Verification

- Run: `npm test`
