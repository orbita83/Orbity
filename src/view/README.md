# view

## Overview

Camada de apresentação do Orbity. Contém os componentes de tela exportados como `default` (re-exportados pelos módulos de rota em `src/app/`), as partes de tela (`*-content.tsx`), os textos (`*Copy.ts`), os componentes de UI reutilizáveis em `components/` e os tokens visuais em `theme/`. Nenhuma tela importa `usecase`, `infra` nem `di`. As telas se dividem em dois grupos:

- **Implementadas:** Início, Tarefas, Nova tarefa, Rotinas, Nova rotina, Detalhe da rotina e Perfil. Cada uma liga a sua ViewModel (`src/viewmodel/`) às partes de apresentação.
- **Provisórias:** Cosmos delega para `PlaceholderScreen`, sem ViewModel. Conquistas, Categorias e Configurações delegam para `ProfilePlaceholderScreen`, e a ViewModel de cada uma só cuida de voltar ao Perfil.

## Interface

- Telas implementadas (exportação `default`):
  - `index.tsx` -> `HomeScreen`; liga `useHomeViewModel` a `HomeScreenContent` (sequência, progresso do dia e painel de foco); importado por `src/app/index.tsx`.
  - Animação e gesto do painel de foco da Home em `useFocusSheetMotion.ts` (`Animated` e `PanResponder`), com a geometria pura em `focusSheetGeometry.ts`. São apresentação: o estágio do painel (`FocusSheetStage`) vem de `useHomeViewModel`.
  - `tasks.tsx` -> `TasksScreen`; liga `useTasksViewModel` a `TasksScreenContent` (lista, filtros e seleção múltipla) e esconde a barra de abas na seleção; importado por `src/app/tasks.tsx`.
  - `new-task.tsx` -> `NewTaskScreen`; liga `useNewTaskViewModel` a `NewTaskScreenContent` (formulário e "Tarefa criada!"); importado por `src/app/new-task.tsx`.
  - Textos das telas de Tarefas em `tasksCopy.ts`; tarefas de exemplo só para histórias e testes em `__fixtures__/taskList.fixture.ts`.
  - `routines.tsx` -> `RoutinesScreen`; liga `useRoutinesViewModel` a `RoutinesScreenContent` (busca, cards e aviso de exclusão com Desfazer), recarrega ao ganhar foco e exclui a rotina recebida em `?deleted=<id>`; importado por `src/app/routines.tsx`.
  - `new-routine.tsx` -> `NewRoutineScreen`; liga `useNewRoutineViewModel` a `NewRoutineScreenContent`; importado por `src/app/new-routine.tsx`.
  - `routine-details.tsx` -> `RoutineDetailsScreen`; lê o `id` da rota e liga `useRoutineDetailsViewModel` a `RoutineDetailsScreenContent` (detalhe, conclusão e confirmação de exclusão); importado por `src/app/routine-details.tsx`.
  - Textos e formatação de dias das telas de Rotinas em `routinesCopy.ts`; rotinas de exemplo só para histórias e testes em `__fixtures__/routines.fixture.ts`.
  - `profile.tsx` -> `ProfileScreen`; liga `useProfileViewModel` a `ProfileContent` (identificação, métricas e atalhos); importado por `src/app/profile.tsx`.
- Telas provisórias (exportação `default`):
  - `cosmos.tsx` -> `CosmosScreen`; renderiza `PlaceholderScreen` (título "Cosmos"); importado por `src/app/cosmos.tsx`.
  - `achievements.tsx`, `categories.tsx` e `settings.tsx` -> telas de Conquistas, Categorias e Configurações; renderizam `ProfilePlaceholderScreen` com a ação de voltar ao Perfil da ViewModel de cada uma (`useAchievementsViewModel`, `useCategoriesViewModel` e `useSettingsViewModel`).
- Subdiretórios:
  - [components](./components/README.md): componentes nomeados `MainTabBar`, `PlaceholderScreen`, `TaskCard`, `FilterChips`, `FilterChipItem`, `MaterialSymbol`, `NavBar`, `PrimaryButton` e tipos/constantes associados (`NavTabId`, `DEFAULT_NAV_TABS`, `TaskFilter`, `DEFAULT_TASK_FILTERS`, `MaterialSymbolName`, ...). `MainTabBar` é usado em `src/app/_layout.tsx`.
  - [theme](./theme/README.md): `tokens.ts` com `primitives`, `cosmicColors`, `accessibilityTokens`, `sharedTokens`, `ThemeMode`, `OrbityTheme` e `themes` (`light`, `dark`, `cosmic`).

## Invariants

- Telas são exportadas como `default`; componentes reutilizáveis são exportados de forma nomeada.
- Os textos de placeholder são neutros e não punitivos (ex.: "Suas tarefas aparecerão aqui quando esta área estiver pronta.").
- Telas e componentes estilizam apenas via tokens de `theme/tokens.ts`; as telas placeholder e a barra de abas usam `themes.cosmic` (fixado em `PlaceholderScreen` e `MainTabBar`), enquanto os demais componentes usam `themes.light` como padrão quando `theme` não é informado.
- As abas de `NavBar` (`NavTabId`) correspondem às rotas `index`, `tasks`, `routines`, `cosmos` e `profile` pelo mapeamento em `MainTabBar`, e cada rota tem uma tela correspondente nesta pasta.

## Side Effects

- As telas não têm efeitos colaterais.
- Efeitos dos subdiretórios: navegação via `navigation.emit`/`navigation.navigate` em `MainTabBar`; estado local de foco via `useState`. Detalhes em [components](./components/README.md).

## Verification

- Run: `npm test`
