# src Blueprint

## System Overview

Código-fonte do Orbity (React Native + Expo + Expo Router + TypeScript), organizado em camadas conforme o [`ARCHITECTURE.md`](../ARCHITECTURE.md). Hoje só existe código em três camadas:

- `app/`: roteamento Expo Router. O `_layout.tsx` monta a navegação por abas (`Tabs`) com a barra customizada `MainTabBar`.
- `view/`: telas exportadas como `default`, componentes de UI nomeados e os tokens de tema.
- `DI/`: Composition Root (`container.ts`), que por enquanto registra fábricas vazias.

As camadas `viewmodel/`, `usecase/`, `model/` (`entities/`, `errors/`, `repositories/`, `services/`) e `infra/` (`repositories/`, `services/`) contêm apenas `.gitkeep`. Por isso não têm contrato próprio nesta execução.

Fluxo atual: `app/<rota>.tsx` re-exporta uma tela de `view/` (`HomeScreen`, `TasksScreen`, `RoutinesScreen`, `CosmosScreen`, `ProfileScreen`). Cada tela delega para `PlaceholderScreen`. Nenhuma tela consome ViewModels, Use Cases ou o container de DI ainda.

## Subdirectories & System Boundaries

- `app`: [./app/README.md](./app/README.md) — módulos de rota sem lógica. O `RootLayout` define as cinco abas (Início, Tarefas, Rotinas, Cosmos, Perfil), a rota inicial `index`, `headerShown: false` e a `StatusBar` `light`.
- `view`: [./view/README.md](./view/README.md) — as cinco telas placeholder, mais:
  - `components`: [./view/components/README.md](./view/components/README.md) — `MainTabBar`, `NavBar`, `TaskCard`, `FilterChips`/`FilterChipItem`, `PrimaryButton`, `MaterialSymbol` e `PlaceholderScreen`.
  - `theme`: [./view/theme/README.md](./view/theme/README.md) — `tokens.ts`, com `primitives`, `cosmicColors`, `accessibilityTokens`, `sharedTokens` e `themes` (`light`, `dark`, `cosmic`).
- `DI`: [./DI/README.md](./DI/README.md) — `createContainer`, `createAppContainer`, `composeUseCase`, `resolveUseCase`, `appContainerDefinition` e o singleton `container`.

## Global Invariants

- Rotas e telas casam um a um. Cada `Tabs.Screen` de `app/_layout.tsx` (`index`, `tasks`, `routines`, `cosmos`, `profile`) tem um arquivo de rota que re-exporta uma tela `default` de `view/`. O `MainTabBar` mapeia essas rotas para os `NavTabId` (`inicio`, `tarefas`, `rotinas`, `cosmos`, `perfil`) da `NavBar`.
- Os estilos de UI vêm de `view/theme/tokens.ts`, que espelha `design-system/02-tokens.md`. Há exceções literais registradas em [./view/components/README.md](./view/components/README.md): opacidades, sombra da `NavBar` e `fontWeight` de `FilterChipItem`.
- A acessibilidade é transversal. Os alvos de toque têm no mínimo `theme.target.minSize` (48). O estado é indicado por mais de um sinal além da cor. Os componentes usam papéis e `accessibilityState` de acessibilidade.
- `DI/container.ts` é o único módulo que pode importar ao mesmo tempo classes concretas de `infra/` e de `usecase/` (`ARCHITECTURE.md`, Seção 6.1). A View não conhece `DI/`.
- O container é imutável: `createContainer` aplica `Object.freeze` (raso) às suas partes. As `overrides` prevalecem chave a chave.

## Global Side Effects

- `app/_layout.tsx` configura a barra de status do sistema (`StatusBar style="light"`).
- `MainTabBar` emite `tabPress` e chama `navigation.navigate`. Também lê os insets de área segura.
- `FilterChips` move o foco e dispara `click()` no DOM ao navegar com as setas, só na web.
- `DI/container.ts` instancia o singleton `container` quando o módulo carrega, com fábricas vazias e sem I/O.
- Não há rede, persistência nem acesso a disco no código atual.

## System Verification

- Run: `npm test`
