# Orbity

**Orbity** é um aplicativo mobile de organização pessoal e construção de hábitos de estudo voltado a estudantes, desenvolvido para **Android** (com distribuição prevista via Google Play Store) utilizando **React Native**, **Expo**, **Expo Router** e **TypeScript**.

O produto foi concebido sob os princípios do [Orbity Design System (ODS)](./design-system/README.md): foco e clareza cognitiva, acolhimento visual por meio de uma identidade cósmica, preservação da autonomia do estudante, acessibilidade nativa (contraste mínimo de 4,5:1, alvos de toque de 48 × 48 dp e múltiplos indicadores além da cor) e **ausência de mecânicas ou mensagens punitivas**.

---

## Sumário

- [1. Stack Tecnológica](#1-stack-tecnológica)
- [2. Arquitetura e Estrutura do Projeto](#2-arquitetura-e-estrutura-do-projeto)
- [3. Pré-requisitos](#3-pré-requisitos)
- [4. Onboarding: Instalação e Preparação do Ambiente](#4-onboarding-instalação-e-preparação-do-ambiente)
- [5. Execução no Ambiente de Desenvolvimento](#5-execução-no-ambiente-de-desenvolvimento)
- [6. Qualidade, Verificações e Testes Automatizados](#6-qualidade-verificações-e-testes-automatizados)
- [7. Catálogo Visual (Storybook)](#7-catálogo-visual-storybook)
- [8. Build e Distribuição Android (EAS)](#8-build-e-distribuição-android-eas)
- [9. Convenções de Contribuição e Governança](#9-convenções-de-contribuição-e-governança)
- [10. Mapa da Documentação Oficial](#10-mapa-da-documentação-oficial)

---

## 1. Stack Tecnológica

| Categoria | Tecnologia / Ferramenta | Versão configurada (`package.json`) |
| :--- | :--- | :--- |
| **Runtime & UI Mobile** | React Native / React | `0.86.3` / `19.2.3` |
| **Plataforma & Roteamento** | Expo SDK / Expo Router | `~57.0.30` / `~57.0.28` |
| **Linguagem** | TypeScript (modo estrito `"strict": true`) | `~6.0.3` |
| **Persistência Local** | SQLite (`expo-sqlite` no Android; `better-sqlite3` em testes Node) | `57.0.5` / `13.2.0` |
| **Catálogo de Componentes** | Storybook (`@storybook/react-native-web-vite` + Vite) | `10.6.2` / `6.4.4` |
| **Testes Automatizados** | Jest + `jest-expo` + `@testing-library/react-native` | `~29.7.0` / `~57.0.6` / `^14.1.0` |
| **Qualidade & Hooks Git** | ESLint (`eslint-config-expo`), Husky, lint-staged, Commitlint | `^9.0.0` / `^9.1.7` / `^16.4.0` / `^21.2.3` |
| **Build & Distribuição** | EAS CLI (vinculado localmente em `devDependencies`) | `27.5.0` |

---

## 2. Arquitetura e Estrutura do Projeto

O Orbity adota o padrão **MVVM Sofisticado** com **Inversão de Dependências (DIP)** e **Injeção de Dependências (DI)**, documentado em [`ARCHITECTURE.md`](./ARCHITECTURE.md) e regulamentado por [`RULES.md`](./RULES.md):

```text
View  -->  ViewModel  -->  Use Cases  -->  Domínio (Model)  <--  Infraestrutura
```

```text
src/
├── app/          # Módulos de rota do Expo Router (kebab-case.tsx) que re-exportam as telas da View
├── view/         # Telas (kebab-case.tsx), componentes reutilizáveis (components/ em PascalCase.tsx) e tokens (theme/)
├── viewmodel/    # Custom Hooks de apresentação e navegação (use*ViewModel.ts, retorno em tupla [state, actions])
├── usecase/      # Contratos (i*UseCases.ts) e implementações (*UseCases.ts) das regras de negócio
├── model/        # Domínio puro (entities/, errors.ts, datasources/ e services/) — zero dependência externa
├── infra/        # Implementações concretas (database/, datasources/ e services/) com tradução para DomainError
└── di/           # Composition Root (container.ts e persistence.ts) — único ponto que conecta infra e usecase
```

---

## 3. Pré-requisitos

Para desenvolver, executar os testes e validar o catálogo localmente:

1. **Node.js:** versão **22 LTS** recomendada (alinhada ao runner oficial do GitHub Actions em [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).
2. **npm:** versão **10+** (distribuída junto ao Node.js 22).
3. **Git:** versão **2.38+** com suporte a `git switch`.
4. **Ambiente Android (opcional para execução local do app):**
   - **Dispositivo físico Android:** aplicativo **Expo Go** compatível com o SDK 57 ou *development build* instalado, conectado à mesma rede local ou via cabo USB (`adb`); **ou**
   - **Emulador Android:** Android Studio com Android SDK, `platform-tools` (`adb`) e uma imagem de sistema virtual (AVD) configurada.

> **Nota sobre permissões e credenciais:** Nenhuma variável de ambiente, chave secreta ou conta externa é necessária para clonar o projeto, rodar o aplicativo em desenvolvimento, iniciar o Storybook ou executar a suíte de testes e verificações locais. Operações na nuvem do **EAS Build** e no **Google Play Console** são restritas às contas administrativas autorizadas (consulte a [Seção 8](#8-build-e-distribuição-android-eas)).

---

## 4. Onboarding: Instalação e Preparação do Ambiente

### 4.1. Clonar o repositório

```bash
git clone https://github.com/orbita83/Orbity.git
cd Orbity
```

### 4.2. Sincronizar a branch base e criar uma branch de trabalho

Conforme o [`CONTRIBUTING.md` (Seções 1.2 e 2.2)](./CONTRIBUTING.md#12-branches), **nunca** realize alterações diretamente nas branches protegidas `main` e `development`. Toda nova atividade deve partir da `development` atualizada:

```bash
git switch development
git pull --ff-only origin development
git switch -c <prefixo>/<descricao-curta>
```

- **Prefixos permitidos** ([`scripts/conventions.cjs`](./scripts/conventions.cjs)): `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- **Formato exigido:** apenas letras minúsculas, números e hífens, sem acentos (ex.: `feat/filtro-tarefas`, `fix/calculo-sequencia`, `docs/atualizar-guia`).

### 4.3. Instalar as dependências (instalação limpa)

Utilize `npm ci` para instalar exatamente a árvore de dependências congelada no `package-lock.json` e ativar automaticamente os hooks do Husky (`prepare`):

```bash
npm ci
```

---

## 5. Execução no Ambiente de Desenvolvimento

### 5.1. Scripts disponíveis no `package.json`

| Script | Comando | Finalidade |
| :--- | :--- | :--- |
| `npm start` | `expo start` | Inicia o servidor de desenvolvimento do Expo (Metro Bundler). |
| `npm run android` | `expo start --android` | Inicia o servidor Expo e solicita a abertura no emulador Android ou aparelho conectado via `adb`. |
| `npm run ios` | `expo start --ios` | Inicia o servidor Expo para simulador iOS (requer macOS com Xcode). |
| `npm run lint` | `expo lint` | Executa a verificação estática de código com ESLint. |
| `npm test` | `jest --watchAll=false` | Executa toda a suíte de testes automatizados em modo não interativo (CI/terminal). |
| `npm run test:watch` | `jest --watch` | Executa o Jest em modo interativo para desenvolvimento contínuo. |
| `npm run storybook` | `storybook dev -p 6006` | Inicia o catálogo interativo do Storybook em `http://localhost:6006`. |
| `npm run build-storybook` | `storybook build` | Gera o build estático do Storybook no diretório `storybook-static/`. |

### 5.2. Diferença entre servidor de desenvolvimento Expo e build Android (EAS)

- **Servidor de desenvolvimento (`npm start` / `npm run android`):** executa o Metro Bundler localmente para recarregamento rápido (*Fast Refresh*) durante a implementação de telas e regras de negócio, podendo ser aberto via **Expo Go** ou em um *development build* já instalado.
- **Build Android via EAS (`npx eas-cli build`):** compila o binário nativo completo (`.apk` para os perfis `development` e `preview`; `.aab` para o perfil `production`) nos servidores da Expo com as credenciais de assinatura do projeto.

---

## 6. Qualidade, Verificações e Testes Automatizados

Antes de realizar qualquer commit ou abrir um Pull Request para a `development`, execute o checklist completo de validação local (o mesmo exigido pelo workflow [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)):

```bash
# 1. Verificação de lint (ESLint)
npm run lint

# 2. Verificação estrita de tipos TypeScript
npx --no-install tsc --noEmit

# 3. Suíte completa de testes automatizados (Jest + Testing Library)
npm test

# 4. Verificação dos contratos cromáticos e contrastes WCAG do Design System
node tests/ods-theme.test.cjs

# 5. Build estático do catálogo Storybook
npm run build-storybook

# 6. Validação dos hooks locais do Git (obrigatório ao alterar .husky/, scripts/ ou commitlint.config.cjs)
node scripts/verify-local-hooks.mjs
```

Diretrizes detalhadas sobre a organização dos testes por camada, taxonomia de *test doubles* (*Dummy*, *Stub*, *Spy*, *Mock* e *Fake*), *fixtures* e testes de contrato estão disponíveis em [`docs/06-quality/guia-testes.md`](./docs/06-quality/guia-testes.md).

---

## 7. Catálogo Visual (Storybook)

O Orbity utiliza o Storybook para documentar e validar isoladamente os componentes e telas do Design System:

```bash
# Iniciar o catálogo interativo na porta 6006
npm run storybook

# Validar a compilação estática do catálogo (gera storybook-static/, ignorado pelo Git)
npm run build-storybook
```

Consulte [`docs/storybook.md`](./docs/storybook.md) para detalhes sobre como criar novas stories, utilizar os controles interativos, alternar temas e compreender o mock de navegação do `expo-router` no catálogo.

---

## 8. Build e Distribuição Android (EAS)

A esteira de build e distribuição Android está documentada em [`docs/08-distribution/README.md`](./docs/08-distribution/README.md) e utiliza o **EAS CLI** fixado localmente no projeto (`npx --no-install eas-cli --version`).

### 8.1. Perfis configurados em `eas.json`

| Perfil | Artefato | Finalidade |
| :--- | :--- | :--- |
| `development` | `.apk` (`developmentClient: true`) | Depuração e testes internos com `expo-dev-client`. |
| `preview` | `.apk` (distribuição interna) | Validação interna em dispositivos Android sem servidor de desenvolvimento. |
| `production` | `.aab` (Android App Bundle) | Pacote assinado para submissão à Google Play Store. |

### 8.2. Etapas que dependem de contas, permissões e credenciais autorizadas

Para proteger a identidade do aplicativo (`io.github.orbita83.orbity`) e suas chaves criptográficas:

1. **Inspeção local da configuração Expo (livre para qualquer integrante, sem login):**
   ```bash
   npx --no-install expo config --type public
   ```
2. **Validação da configuração EAS e disparo de builds na nuvem (requer autenticação na conta Expo proprietária `@mailsons`):**
   - Documentado em [`docs/08-distribution/eas-build.md`](./docs/08-distribution/eas-build.md) e [`docs/08-distribution/assinatura-e-builds-android.md`](./docs/08-distribution/assinatura-e-builds-android.md).
   - O keystore Android é gerenciado remotamente no EAS (`credentialsSource: remote`) e nunca é armazenado no repositório.
3. **Automação sob demanda no GitHub Actions (`.github/workflows/eas-build.yml`):**
   - Disparo manual (`workflow_dispatch`) protegido pelos environments do GitHub (`eas-internal` e `eas-production`) e pelo segredo `EXPO_TOKEN`, conforme [`docs/08-distribution/build-sob-demanda.md`](./docs/08-distribution/build-sob-demanda.md).
4. **Publicação na Google Play Store:**
   - Governada pela titularidade definida em [`docs/08-distribution/identidade-e-propriedade.md`](./docs/08-distribution/identidade-e-propriedade.md) e pelo procedimento manual descrito em [`docs/08-distribution/submissao-google-play.md`](./docs/08-distribution/submissao-google-play.md).

---

## 9. Convenções de Contribuição e Governança

Todas as regras de colaboração estão formalizadas no [`CONTRIBUTING.md`](./CONTRIBUTING.md):

- **Mensagens de commit** ([Seção 1.1](./CONTRIBUTING.md#11-commits) e [`commitlint.config.cjs`](./commitlint.config.cjs)): formato obrigatório `<prefixo>(<escopo>): <descricao curta em pt-br>`, com inicial minúscula e sem ponto final (ex.: `feat(tasks): adiciona filtro por prioridade`).
- **Proteção de hooks locais:** os hooks `.husky/pre-commit`, `.husky/commit-msg` e `.husky/pre-push` executam `lint-staged`, `commitlint` e a validação do nome da branch (`scripts/validate-branch-name.cjs`). Nunca utilize `--no-verify` ou `HUSKY=0` localmente.
- **Idioma:** Português Brasileiro (`pt-BR`) para documentação, interface do usuário, commits, issues e Pull Requests; Inglês (`en`) para identificadores de código em `src/`.
- **Pull Requests e Releases:**
  - PRs de desenvolvimento devem apontar para `development` usando [`.github/PULL_REQUEST_TEMPLATE/development.md`](./.github/PULL_REQUEST_TEMPLATE/development.md).
  - PRs de publicação (`development → main`), versionamento semântico, tags Git anotadas e critérios de aprovação seguem a política da [Seção 4 do `CONTRIBUTING.md`](./CONTRIBUTING.md#4-processo-de-publicação-e-governança-de-releases) e o template [`.github/PULL_REQUEST_TEMPLATE/release.md`](./.github/PULL_REQUEST_TEMPLATE/release.md).

---

## 10. Mapa da Documentação Oficial

| Documento | Conteúdo Principal |
| :--- | :--- |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Fluxo Git, convenções de branches/commits/issues/PRs, qualidade e governança de releases (`v0.1.0`). |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Arquitetura MVVM Sofisticado, limites estritos entre as 5 camadas, contratos, DIP e Composition Root (`src/di/`). |
| [`RULES.md`](./RULES.md) | Convenções de nomenclatura de arquivos/componentes/hooks, roteamento Expo Router na ViewModel, TypeScript e acessibilidade. |
| [`AGENTS.md`](./AGENTS.md) | Roteador operacional (*Read-Before-Act*) e guardrails para desenvolvedores e agentes de IA. |
| [`design-system/README.md`](./design-system/README.md) | Índice do **Orbity Design System (ODS)**: princípios, tokens (`02-tokens.md`), fundamentos, componentes, padrões e acessibilidade. |
| [`docs/storybook.md`](./docs/storybook.md) | Guia de execução, build estático e autoria de histórias no Storybook. |
| [`docs/shell-navegacao-inicial.md`](./docs/shell-navegacao-inicial.md) | Estrutura das 5 abas principais (`Início`, `Tarefas`, `Rotinas`, `Cosmos`, `Perfil`) e `MainTabBar`. |
| [`docs/06-quality/guia-testes.md`](./docs/06-quality/guia-testes.md) | Guia de testes automatizados com Jest e Testing Library, taxonomia de *test doubles* e *fixtures*. |
| [`docs/06-quality/validacao-epico-0.md`](./docs/06-quality/validacao-epico-0.md) | Relatório consolidado de validação integrada e rastreabilidade das 17 entregas do **ÉPICO 0 (EP0000)**. |
| [`docs/08-distribution/README.md`](./docs/08-distribution/README.md) | Índice de identidade, propriedade, versionamento Android, EAS Build, assinatura, automação sob demanda e Google Play. |
| [`docs/designs/README.md`](./docs/designs/README.md) | Índice dos designs técnicos das funcionalidades do produto (Tela Inicial, Tarefas, Rotinas). |
