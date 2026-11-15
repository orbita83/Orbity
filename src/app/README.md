# src/app

## Overview

Camada de roteamento do Orbity baseada em Expo Router (o `package.json` declara `"main": "expo-router/entry"`). Cada arquivo `kebab-case.tsx` deste diretório é um módulo de rota que apenas importa um componente de tela de `src/view/` e o re-exporta como `default`. O arquivo `_layout.tsx` define o layout raiz como uma navegação por abas (`Tabs` de `expo-router`) com barra de abas customizada.

## Interface

| Arquivo | Export `default` | Origem | Rota / aba |
| :--- | :--- | :--- | :--- |
| `_layout.tsx` | `RootLayout` | local | Layout raiz (`Tabs`) |
| `index.tsx` | `HomeScreen` | `../view/HomeScreen` | `index` — título "Início" |
| `tasks.tsx` | `TasksScreen` | `../view/TasksScreen` | `tasks` — título "Tarefas" |
| `routines.tsx` | `RoutinesScreen` | `../view/RoutinesScreen` | `routines` — título "Rotinas" |
| `cosmos.tsx` | `CosmosScreen` | `../view/CosmosScreen` | `cosmos` — título "Cosmos" |
| `profile.tsx` | `ProfileScreen` | `../view/ProfileScreen` | `profile` — título "Perfil" |

- `RootLayout` (`_layout.tsx`): renderiza `StatusBar` (`expo-status-bar`, `style="light"`) e `Tabs` com `initialRouteName="index"`, `backBehavior="firstRoute"`, `screenOptions={{ headerShown: false }}` e `tabBar={(props) => <MainTabBar {...props} />}`.
- Dependência de UI: `MainTabBar` (export nomeado de `src/view/components/MainTabBar.tsx`, importado via alias `@/view/components/MainTabBar`).

## Invariants

- Os módulos de rota não contêm lógica própria: apenas `import <Tela> from "../view/<Tela>"` seguido de `export default <Tela>`.
- Cada valor `name` de `Tabs.Screen` em `_layout.tsx` (`index`, `tasks`, `routines`, `cosmos`, `profile`) corresponde exatamente ao nome de um arquivo de rota deste diretório; adicionar, renomear ou remover uma rota exige atualizar `_layout.tsx` em conjunto.
- A ordem dos `Tabs.Screen` em `_layout.tsx` define a ordem das abas: Início, Tarefas, Rotinas, Cosmos, Perfil.
- `index` é a rota inicial (`initialRouteName="index"`) e o destino do botão voltar (`backBehavior="firstRoute"`).
- O cabeçalho nativo fica desativado em todas as abas (`headerShown: false`); a navegação é feita pela `MainTabBar`.

## Side Effects

- `_layout.tsx` configura a barra de status do sistema com `StatusBar style="light"`.
- Nenhum outro efeito colateral (sem I/O, rede ou estado persistente) nos módulos deste diretório.

## Verification

- Run: `npm test`
