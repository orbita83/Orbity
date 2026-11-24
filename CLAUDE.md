# CLAUDE.md

Orientação para o Claude Code (claude.ai/code) neste repositório.

O harness operacional do projeto (roteamento obrigatório de leitura por gatilho, regras de Git, guardrails de idioma e design system e checklist de validação) está em `AGENTS.md`, importado abaixo. Ele é a fonte de verdade; este arquivo só complementa com comandos e visão geral.

@AGENTS.md

---

## Comandos

| Objetivo | Comando |
| :--- | :--- |
| Servidor de desenvolvimento (Expo) | `npm start` (`npm run android`) |
| Lint | `npm run lint` |
| Tipos (com rotas tipadas) | `npm run typecheck` |
| Testes (Jest, não interativo) | `npm test` |
| Um arquivo de teste | `npx jest caminho/do/arquivo.test.tsx` |
| Testes por caminho | `npx jest --testPathPattern=usecase` |
| Contratos de tema e contraste | `node tests/ods-theme.test.cjs` |
| Storybook | `npm run storybook` (porta 6006) / `npm run build-storybook` |
| Hooks locais | `node scripts/verify-local-hooks.mjs` |
| Linter de arquitetura | `npm run lint:architecture` |

- `tests/ods-theme.test.cjs` **não** é coletado pelo Jest (o `testMatch` só aceita `.js/.ts/.jsx/.tsx`). Rode-o com `node` sempre que alterar `src/view/theme/tokens.ts`: ele valida os valores dos temas e as razões de contraste.
- O CI (`.github/workflows/ci.yml`, em PRs para `development`) roda, nesta ordem: lint → `npm run typecheck` (`expo customize tsconfig.json && tsc --noEmit`, regenerando `.expo/types/router.d.ts` a partir de `src/app/` antes de validar os tipos) → `build-storybook` → `npm test` → `node tests/ods-theme.test.cjs`. Uma story quebrada falha o CI mesmo com os testes passando. O `npm run lint:architecture` ainda não faz parte do CI.
- Hooks do Husky: `pre-commit` roda o ESLint via lint-staged, `commit-msg` roda o commitlint e `pre-push` roda `scripts/validate-branch.mjs` (nome da branch).
- Em máquinas lentas, a suíte inteira do Jest pode estourar o tempo limite em testes de tela. Se um teste de tela falhar só na suíte completa, rode-o isolado ou com `npx jest --maxWorkers=2` antes de concluir que há defeito.

## Arquitetura (visão geral)

MVVM Sofisticado com Clean Architecture, descrito em `ARCHITECTURE.md` e baseado no Cap. 10 do livro *Tutoriais de PDM* (versão V5). O fluxo de dependência é:

```
src/app (rotas) → src/view → src/viewmodel → src/usecase (I*UseCases) → src/model ← src/infra
                                                         ↑
                                     src/di/container.ts (único ponto que liga infra + usecase)
```

- **Rotas:** `src/app/_layout.tsx` define um navegador `Tabs` com barra customizada (`MainTabBar`) e as abas `index`, `tasks`, `routines`, `cosmos` e `profile`. As rotas `new-task`, `new-routine`, `routine-details`, `achievements`, `categories` e `settings` ficam fora da barra (`href: null`). Cada módulo de rota só reexporta como `default` a tela de mesmo nome em `src/view/` (ex.: `src/app/tasks.tsx` → `src/view/tasks.tsx`).
- **Navegação:** quem navega é a ViewModel (`router` do `expo-router`, parâmetros de rota e foco da tela). A View não chama hooks de navegação (`RULES.md`, "Navegação na ViewModel").
- **Composição:** `src/di/container.ts` expõe `createContainer`, `createAppContainer`, `composeUseCase`, `resolveUseCase` e a instância `container`. As ViewModels recebem um `I*UseCases` opcional por parâmetro, o que permite trocar dependências em testes em três níveis: Use Case, overrides do container e ViewModel (`ARCHITECTURE.md`, Seção 6).
- **Persistência:** SQLite no Android (`src/di/persistence.ts`, ADR-0001). Só `src/infra/database/expoSqlExecutor.ts` importa o `expo-sqlite`; os testes usam `tests/fixtures/node-sqlite-executor.ts`, sobre o `node:sqlite` do Node.
- **Erros:** só a ViewModel usa `try/catch` na apresentação. A Infra converte falhas técnicas na subclasse de `DomainError` do seu tipo (`src/model/errors.ts`, ex.: `toDataSourceError` → `DataSourceError`), e a ViewModel decide pela subclasse com `instanceof`, e a View apenas lê `error`/`loading`.
- **Estado atual:** todas as camadas têm código. Há domínio e casos de uso para Tarefas, Rotinas, sequência (streak), Home e Perfil. Tarefas, Rotinas e o registro diário persistem em SQLite; o Perfil ainda fica em memória. Cosmos, Conquistas, Categorias e Configurações ainda são telas provisórias.
- **Tema:** `src/view/theme/tokens.ts` espelha `design-system/02-tokens.md` e exporta `themes.light`, `themes.dark` e `themes.cosmic`, além de grupos como `cosmicColors`, `motionTokens` e `accessibilityTokens`. Os componentes consomem `themes.<modo>`; nunca use valores literais. `useReduceMotion.ts` respeita a preferência de redução de movimento do sistema.
- **Alias:** `@/*` → `src/*` e `@/assets/*` → `assets/*` (tanto em `tsconfig.json` quanto em `jest.config.js`).

## Pontos de atenção

- `README.md` é a apresentação do projeto e o guia de primeiros passos (funcionalidades, stack, instalação, arquitetura, ODS, qualidade, build Android e mapa da documentação). Para regras de contribuição e de código, a fonte de verdade continua sendo `AGENTS.md` e os documentos que ele roteia.
- Bugs, inconsistências ou outros desvios encontrados durante uma tarefa seguem `CONTRIBUTING.md` (Seção 2.6), resumida no `AGENTS.md` (Seção 3).
- Nomes de arquivo (`RULES.md`): telas da `view` em `kebab-case.tsx` com o mesmo nome da rota em `src/app/`; partes de apresentação de uma tela em `kebab-case` com sufixo `-content`; componentes reutilizáveis de `src/view/components/` em `PascalCase.tsx`; ViewModels em `useNomeViewModel.ts`, com o mesmo nome do hook exportado; os arquivos de `model`, `usecase`, `infra` e `di`, e os da `view` que não são telas nem componentes, em `camelCase` (prefixo `i` nos que só têm uma interface, ex.: `iTaskDataSource.ts`).
- As stories (`*.stories.tsx`) ficam ao lado dos componentes e são renderizadas via `@storybook/react-native-web-vite` (`.storybook/`). No Storybook, o `expo-router` é substituído por `.storybook/mocks/expo-router.ts` (`docs/storybook.md`).
- Designs técnicos ficam em `docs/designs/`, um por funcionalidade (`AGENTS.md`, Seção 4). Decisões de arquitetura ficam em `docs/05-architecture/decisions/`.
