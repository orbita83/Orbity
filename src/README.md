# src Blueprint

## System Overview

Código-fonte do Orbity (React Native + Expo + Expo Router + TypeScript), organizado em camadas conforme o [`ARCHITECTURE.md`](../ARCHITECTURE.md). Todas as camadas têm código:

- `app/`: roteamento Expo Router. O `_layout.tsx` monta a navegação por abas (`Tabs`) com a barra customizada `MainTabBar`; os demais arquivos só re-exportam a tela de mesmo nome da `view/`.
- `view/`: telas (`kebab-case.tsx`), partes de tela (`*-content.tsx`), componentes reutilizáveis (`components/`), textos (`*Copy.ts`) e tokens de tema (`theme/`).
- `viewmodel/`: hooks `use*ViewModel` que guardam o estado das telas, chamam os contratos `I*UseCases` e cuidam da navegação.
- `usecase/`: contratos `I*UseCases` e implementações para Tarefas, Rotinas, sequência (streak), Início e Perfil.
- `model/`: entidades, erros de domínio (`errors.ts`) e contratos de DataSources e serviços.
- `infra/`: DataSources em memória e em SQLite (Android, ADR-0001), banco e migrações, e o relógio do sistema.
- `di/`: Composition Root (`container.ts` e `persistence.ts`), que liga a `infra/` aos Use Cases.

Fluxo atual: `app/<rota>.tsx` → tela de `view/` → `use*ViewModel` → `container.useCases` → Use Case → contratos de `model/`, implementados pela `infra/`. Cosmos, Conquistas, Categorias e Configurações ainda são telas provisórias (`PlaceholderScreen` no Cosmos e `ProfilePlaceholderScreen` nas demais).

## Subdirectories & System Boundaries

- `app`: [./app/README.md](./app/README.md) — módulos de rota sem lógica. O `RootLayout` define as cinco abas (Início, Tarefas, Rotinas, Cosmos, Perfil), a rota inicial `index`, `headerShown: false` e a `StatusBar` `light`.
- `view`: [./view/README.md](./view/README.md) — telas, partes de tela e textos, mais:
  - `components`: [./view/components/README.md](./view/components/README.md) — `MainTabBar`, `NavBar`, `TaskCard`, `FilterChips`/`FilterChipItem`, `PrimaryButton`, `MaterialSymbol` e `PlaceholderScreen`.
  - `theme`: [./view/theme/README.md](./view/theme/README.md) — `tokens.ts`, com `primitives`, `cosmicColors`, `accessibilityTokens`, `sharedTokens` e `themes` (`light`, `dark`, `cosmic`).
- `di`: [./di/README.md](./di/README.md) — `createContainer`, `createAppContainer`, `composeUseCase`, `resolveUseCase`, `appContainerDefinition` e o singleton `container`.

## Global Invariants

- Rotas e telas casam um a um. Cada `Tabs.Screen` de `app/_layout.tsx` (`index`, `tasks`, `routines`, `cosmos`, `profile`) tem um arquivo de rota que re-exporta uma tela `default` de `view/`. O `MainTabBar` mapeia essas rotas para os `NavTabId` (`inicio`, `tarefas`, `rotinas`, `cosmos`, `perfil`) da `NavBar`.
- Os estilos de UI vêm de `view/theme/tokens.ts`, que espelha `design-system/02-tokens.md`. Há exceções literais registradas em [./view/components/README.md](./view/components/README.md): opacidades, sombra da `NavBar` e `fontWeight` de `FilterChipItem`.
- A acessibilidade é transversal. Os alvos de toque têm no mínimo `theme.target.minSize` (48). O estado é indicado por mais de um sinal além da cor. Os componentes usam papéis e `accessibilityState` de acessibilidade.
- `di/container.ts` é o único módulo que pode importar ao mesmo tempo classes concretas de `infra/` e de `usecase/` (`ARCHITECTURE.md`, Seção 6.1). A View não conhece `di/`.
- O container é imutável: `createContainer` aplica `Object.freeze` (raso) às suas partes. As `overrides` prevalecem chave a chave.

## Global Side Effects

- `app/_layout.tsx` configura a barra de status do sistema (`StatusBar style="light"`).
- `MainTabBar` emite `tabPress` e chama `navigation.navigate`. Também lê os insets de área segura.
- `di/container.ts` instancia o singleton `container` quando o módulo carrega. Criar o container não abre o banco: o `DatabaseProvider` só abre o SQLite no primeiro uso.
- Tarefas, Rotinas e o registro diário persistem em SQLite no aparelho. O Perfil ainda fica em memória. Não há acesso à rede.

## System Verification

- Run: `npm test`
