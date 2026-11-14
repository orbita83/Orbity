# components

## Overview

Componentes de UI reutilizáveis da camada `view`, construídos sobre primitivas do React Native (`View`, `Pressable`, `Text`, `ScrollView`) e estilizados exclusivamente a partir dos tokens de `../theme/tokens.ts` (`themes`, `OrbityTheme`). Todos os componentes são exportados de forma nomeada e são puramente de apresentação: recebem dados e callbacks por props e não acessam casos de uso, repositórios ou serviços.

Os arquivos `*.stories.tsx` (`card-tarefa`, `filter-chips`, `nav-bar`, `primary-button`, `ods-global`) são histórias do Storybook (`@storybook/react-native-web-vite`), não fazem parte do código de produção e não são importados pelo app. Os arquivos `*.test.tsx` contêm testes Jest.

## Interface

- `MainTabBar.tsx`
  - `MainTabBar({ state, navigation }: MainTabBarProps)`: barra de abas customizada para o `Tabs` do Expo Router; usada em `src/app/_layout.tsx`. Renderiza `NavBar` com `theme={themes.cosmic}` dentro de um `View` com `paddingBottom: insets.bottom` (`useSafeAreaInsets`).
  - `MainTabBarProps`: tipo derivado de `Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0]`.
  - Mapeamentos internos (não exportados) `routeByTab` / `tabByRoute`: `inicio` <-> `index`, `tarefas` <-> `tasks`, `rotinas` <-> `routines`, `cosmos` <-> `cosmos`, `perfil` <-> `profile`.
- `PlaceholderScreen.tsx`
  - `PlaceholderScreen({ title, message })`: tela de espera com `ScrollView`, título com `accessibilityRole="header"` e mensagem; usa fixamente `themes.cosmic`.
- `card-tarefa.tsx`
  - `CardTarefa(props: CardTarefaProps)`: cartão de tarefa com checkbox (`accessibilityRole="checkbox"`), título, `dueDate` opcional e botão de opções opcional.
  - `CardTarefaProps`: `title`, `dueDate?`, `completed`, `onToggleCompleted`, `onOptionsPress?`, `theme?` (padrão `themes.light`).
- `filter-chips.tsx`
  - `FilterChips<T extends string = TaskFilter>(props: FilterChipsProps<T>)`: grupo `accessibilityRole="radiogroup"` de chips; padrão `filters = DEFAULT_TASK_FILTERS`, `accessibilityLabel = "Filtros de tarefas"`, `theme = themes.light`.
  - `FilterChipItem(props: FilterChipItemProps)`: chip individual com `accessibilityRole="radio"` e anel de foco.
  - `TaskFilter`: `"all" | "pending" | "completed"`.
  - `FilterChipOption<T>`: `{ id: T; label: string }`.
  - `DEFAULT_TASK_FILTERS`: `all` ("Todos"), `pending` ("Pendentes"), `completed` ("Concluídas").
  - `FilterChipItemProps`, `FilterChipsProps<T>`.
- `material-symbol.tsx`
  - `MaterialSymbol({ name, filled = false, color, size = 24 })`: ícone SVG decorativo a partir do mapa interno `SYMBOL_PATHS`.
  - `MaterialSymbolName`: `"home" | "check_circle" | "description" | "assignment" | "autorenew" | "auto_awesome" | "person" | "add"`.
  - `MaterialSymbolProps`.
- `nav-bar.tsx`
  - `NavBar(props: NavBarProps)`: barra de navegação inferior com `accessibilityRole="tablist"`; padrões `visible = true`, `theme = themes.light`, `tabs = DEFAULT_NAV_TABS`.
  - `NavTabId`: `"inicio" | "tarefas" | "rotinas" | "cosmos" | "perfil"`.
  - `NavTabItem`: `{ id, label, iconSymbol: MaterialSymbolName, accessibilityHint }`.
  - `DEFAULT_NAV_TABS`: cinco abas (Início/`home`, Tarefas/`description`, Rotinas/`autorenew`, Cosmos/`auto_awesome`, Perfil/`person`).
  - `NavBarProps`: `activeTab`, `onSelectTab`, `visible?`, `theme?`, `tabs?`.
- `primary-button.tsx`
  - `PrimaryButton(props: PrimaryButtonProps)`: botão primário com `accessibilityRole="button"`, `accessibilityLabel={label}` e anel de foco.
  - `PrimaryButtonProps`: `label`, `onPress`, `accessibilityHint?`, `disabled?` (padrão `false`), `theme?` (padrão `themes.light`).

## Invariants

- Estilos derivam de tokens do tema (`theme.color`, `theme.space`, `theme.radius`, `theme.font`, `theme.target`, `theme.focus`, `theme.button`, `theme.navbar`, `theme.primitive`, `theme.componentOverrides`). Exceções literais presentes no código: opacidade de pressionado (`chipPressed: 0.85`, `tabItemPressed: 0.7`), sombra/borda de `NavBar` (`borderTopWidth: 1`, `shadowOpacity: 0.06`, `shadowRadius: 4`, `shadowOffset`), `borderColor: "transparent"` no `focusContainer` da `NavBar` e `fontWeight` `"700"`/`"500"` nos rótulos de `FilterChipItem`.
- Alvos de toque interativos respeitam `theme.target.minSize` (48) via `minHeight`/`minWidth` (`CardTarefa`, `FilterChipItem`, `NavBar`), ou `theme.button.minHeight`/`minWidth` (`PrimaryButton`).
- Estado não depende apenas de cor: `CardTarefa` mostra "✓" e `textDecorationLine: "line-through"` quando `completed`; `FilterChipItem` muda `fontWeight` quando `selected`; `NavBar` alterna `MaterialSymbol` `filled`, o indicador `iconIndicatorActive` e o peso do rótulo para a aba ativa, e o rótulo textual fica sempre visível.
- Acessibilidade: `CardTarefa` expõe `accessibilityState={{ checked }}` e rótulo "Concluir/Desmarcar tarefa: <title>"; `FilterChipItem` expõe `accessibilityState={{ checked, disabled }}`; `NavBar` expõe `accessibilityState={{ selected }}` e rótulo "Aba <label>, <n> de <total>"; textos usam `allowFontScaling`; `MaterialSymbol` é `accessible={false}` (e `aria-hidden` na web).
- `NavBar` retorna `null` quando `visible` é `false`.
- `FilterChips` marca como selecionado o chip cujo `filter.id === selectedFilter` e chama `onSelectFilter(filter.id)` no toque; não guarda o filtro selecionado em estado próprio.
- `MainTabBar` só navega quando a rota alvo existe em `state.routes`, é diferente da rota ativa e o evento `tabPress` não teve `defaultPrevented`.
- `MaterialSymbol` usa o caminho `filled` quando `filled` é `true` (com fallback para `outlined`); na web renderiza `<svg>` nativo do DOM, nos demais plataformas `Svg`/`Path` de `react-native-svg`.

## Side Effects

- `MainTabBar`: chama `navigation.emit({ type: "tabPress", target, canPreventDefault: true })` e `navigation.navigate(route.name)` (navegação do Expo Router/React Navigation); lê insets de área segura via `useSafeAreaInsets`.
- `FilterChips` (apenas `Platform.OS === "web"`): o handler `handleWebKeyDown` intercepta setas (`ArrowRight`/`ArrowDown`/`ArrowLeft`/`ArrowUp`), chama `event.preventDefault()`, consulta o DOM (`querySelectorAll('[role="radio"]')`) e dispara `focus()` e `click()` no chip vizinho (navegação circular).
- Estado local de foco via `useState`: `isFocused` em `FilterChipItem` e `PrimaryButton`, `focusedTabId` em `NavBar`.
- Demais componentes não têm efeitos colaterais além de invocar os callbacks recebidos por props.

## Verification

- Run: `npm test`
- Testes existentes nesta pasta: `MainTabBar.test.tsx`, `PlaceholderScreen.test.tsx`, `primary-button.test.tsx`.
