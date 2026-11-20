# Relatório de Validação Integrada e Consolidação do ÉPICO 0 (EP0000)

> - **Tarefa:** T0016 — Issue [#82](https://github.com/orbita83/Orbity/issues/82)
> - **Épico:** [EP-0000 — Fundação do Orbity](../03-backlog/epics/EP-0000.md) (Issue [#66](https://github.com/orbita83/Orbity/issues/66))
> - **Data da validação:** 20/11/2026
> - **Referência base avaliada:** branch `development` no commit `aa241a1` (*Merge pull request #156 from orbita83/chore/remover-suporte-web*)

---

## Sumário

- [1. Objetivo e Metodologia](#1-objetivo-e-metodologia)
- [2. Ambiente e Instalação Limpa](#2-ambiente-e-instalação-limpa)
- [3. Matriz de Rastreabilidade das 17 Entregas do ÉPICO 0](#3-matriz-de-rastreabilidade-das-17-entregas-do-épico-0)
- [4. Evidências das Verificações Técnicas Executadas](#4-evidências-das-verificações-técnicas-executadas)
- [5. Validação por Frente da Fundação](#5-validação-por-frente-da-fundação)
- [6. Avaliação dos Critérios de Conclusão do ÉPICO 0](#6-avaliação-dos-critérios-de-conclusão-do-épico-0)
- [7. Quadro Consolidado de Pendências e Encaminhamentos](#7-quadro-consolidado-de-pendências-e-encaminhamentos)
- [8. Parecer Técnico e Governança de Encerramento](#8-parecer-técnico-e-governança-de-encerramento)

---

## 1. Objetivo e Metodologia

Este relatório consolida a validação integrada da fundação técnica do **Orbity**, prevista na tarefa **T0016 ([#82](https://github.com/orbita83/Orbity/issues/82))**, última entrega da Onda 5 do **ÉPICO 0 ([#66](https://github.com/orbita83/Orbity/issues/66))**.

A verificação seguiu os princípios de auditoria estabelecidos no planejamento do épico:

1. **Distinção entre existência de artefato e comprovação técnica:** nenhuma entrega foi considerada atendida apenas pela abertura de uma issue ou pela presença estática de um arquivo de configuração sem execução verificável.
2. **Reprodutibilidade:** todos os comandos documentados no [`README.md`](../../README.md) foram executados diretamente sobre a árvore da branch `development` atualizada (`aa241a1`), registrando versões de ferramentas, códigos de saída e métricas reais.
3. **Transparência sobre limitações e credenciais:** etapas que exigem acesso administrativo às contas proprietárias da Expo (`@mailsons`) ou do Google Play Console (`@Cassiosampaio2016`), bem como pendências físicas ou documentais em revisão, foram separadas explicitamente dos critérios já comprovados no repositório.

---

## 2. Ambiente e Instalação Limpa

### 2.1. Identificação do ambiente validado

| Item | Valor verificado |
| :--- | :--- |
| **Sistema Operacional** | Windows (`win32-x64`) |
| **Branch base** | `development` (sincronizada com `origin/development`) |
| **Commit base validado** | `aa241a1` (20/11/2026) |
| **Node.js** | `v22.20.0` (compatível com o runner `node-version: '22'` do CI) |
| **Gerenciador de pacotes** | `npm 10.9.3` |
| **EAS CLI local** | `eas-cli/27.5.0 win32-x64 node-v22.20.0` (`npx --no-install eas-cli --version`) |

### 2.2. Validação do lockfile e instalação (`npm ci`)

- A árvore de dependências em [`package.json`](../../package.json) e [`package-lock.json`](../../package-lock.json) foi sincronizada na `development` pelo commit `e27ea48` (integrado no PR [#156](https://github.com/orbita83/Orbity/pull/156)).
- A verificação de instalação limpa com `npm ci` (tanto localmente quanto no passo `Instalar dependências` do GitHub Actions, run `44786002414`) executa o script `prepare` (`husky`) e instala integralmente os pacotes a partir do lockfile, com código de saída `0` e sem depender de pacotes globais não documentados.

### 2.3. Reconhecimento da configuração Expo

O comando `npx --no-install expo config --type public` foi executado localmente e retornou código `0`, confirmando a resolução completa do manifesto [`app.json`](../../app.json):

- **Identidade:** `name: "Orbity"`, `slug: "orbity"`, `scheme: "orbity"`, `owner: "mailsons"`.
- **SDK e plataforma:** `sdkVersion: "57.0.0"`, `android.package: "io.github.orbita83.orbity"`, `version: "0.1.0"`, `android.versionCode: 1`.
- **Plugins ativos:** `expo-router`, `expo-splash-screen` e `expo-sqlite`.
- **Vínculo EAS:** `extra.eas.projectId: "df3e816f-9b5e-402f-ac46-f7c254a5132b"`.

---

## 3. Matriz de Rastreabilidade das 17 Entregas do ÉPICO 0

A tabela abaixo relaciona todas as 17 tarefas planejadas no [EP-0000](../03-backlog/epics/EP-0000.md) com seus Pull Requests, commits de integração na `development`, artefatos verificados e estado atual de comprovação:

| ID | Issue | Onda | Frente | PR(s) e Commit(s) na `development` | Artefatos Principais Verificados | Estado da Entrega |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **T0001** | [#67](https://github.com/orbita83/Orbity/issues/67) — Estrutura mínima do MVVM Sofisticado | 1 | Arquitetura | PR [#90](https://github.com/orbita83/Orbity/pull/90) (`d11e494`); refinamentos em PRs [#150](https://github.com/orbita83/Orbity/pull/150), [#166](https://github.com/orbita83/Orbity/pull/166), [#167](https://github.com/orbita83/Orbity/pull/167), [#169](https://github.com/orbita83/Orbity/pull/169), [#172](https://github.com/orbita83/Orbity/pull/172)–[#175](https://github.com/orbita83/Orbity/pull/175) | `src/app/`, `src/view/`, `src/viewmodel/`, `src/usecase/`, `src/model/`, `src/infra/`, `src/di/` | **Comprovada e integrada** |
| **T0002** | [#68](https://github.com/orbita83/Orbity/issues/68) — Composition root e injeção de dependências | 2 | Arquitetura | PR [#93](https://github.com/orbita83/Orbity/pull/93) (`4427f2d`), PR [#172](https://github.com/orbita83/Orbity/pull/172) (`41ec649`) | [`src/di/container.ts`](../../src/di/container.ts), [`src/di/persistence.ts`](../../src/di/persistence.ts), [`src/di/container.test.ts`](../../src/di/container.test.ts) | **Comprovada e integrada** |
| **T0003** | [#69](https://github.com/orbita83/Orbity/issues/69) — Contratos e limites arquiteturais | 3 | Arquitetura | PR [#99](https://github.com/orbita83/Orbity/pull/99) (`66346b9`), PR [#168](https://github.com/orbita83/Orbity/pull/168) (`77ec5f5`) | [`ARCHITECTURE.md`](../../ARCHITECTURE.md), [`RULES.md`](../../RULES.md), [`src/model/errors.ts`](../../src/model/errors.ts) | **Comprovada e integrada** |
| **T0004** | [#70](https://github.com/orbita83/Orbity/issues/70) — Configurar Jest e React Native Testing Library | 1 | Qualidade | PR [#96](https://github.com/orbita83/Orbity/pull/96) (`eb811ca`) | [`jest.config.js`](../../jest.config.js), [`package.json`](../../package.json) (`test`, `test:watch`) | **Comprovada e integrada** |
| **T0005** | [#71](https://github.com/orbita83/Orbity/issues/71) — Integrar testes obrigatórios ao CI | 2 | Qualidade | PR [#102](https://github.com/orbita83/Orbity/pull/102) (`8b40c14`) | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) | **Comprovada e integrada** |
| **T0006** | [#72](https://github.com/orbita83/Orbity/issues/72) — Padrões de mocks, fixtures e testes | 2 | Qualidade | PR [#104](https://github.com/orbita83/Orbity/pull/104) (`21b668d`) | [`docs/06-quality/guia-testes.md`](./guia-testes.md), `src/model/__fixtures__/`, `src/view/__fixtures__/` | **Comprovada e integrada** |
| **T0007** | [#73](https://github.com/orbita83/Orbity/issues/73) — Consolidar tokens do Design System em TypeScript | 1 | Design System | PR [#94](https://github.com/orbita83/Orbity/pull/94) (`563cbb3`), PR [#113](https://github.com/orbita83/Orbity/pull/113) (`6cb1347`), PR [#141](https://github.com/orbita83/Orbity/pull/141) (`c244d60`) | [`src/view/theme/tokens.ts`](../../src/view/theme/tokens.ts), [`design-system/02-tokens.md`](../../design-system/02-tokens.md), [`tests/ods-theme.test.cjs`](../../tests/ods-theme.test.cjs) | **Comprovada e integrada** |
| **T0008** | [#74](https://github.com/orbita83/Orbity/issues/74) — Validar Storybook e seu build no CI | 2 | Design System | PR [#108](https://github.com/orbita83/Orbity/pull/108) (`6b0e627`), PR [#156](https://github.com/orbita83/Orbity/pull/156) (`aa241a1`) | [`.storybook/main.ts`](../../.storybook/main.ts), [`docs/storybook.md`](../storybook.md), 16 arquivos `*.stories.tsx` | **Comprovada e integrada** |
| **T0009** | [#75](https://github.com/orbita83/Orbity/issues/75) — Definir identidade e propriedade do aplicativo | 1 | Build e distribuição | PR [#101](https://github.com/orbita83/Orbity/pull/101) (`87f05ab`), PR [#106](https://github.com/orbita83/Orbity/pull/106) (`ea29b08`) | [`docs/08-distribution/identidade-e-propriedade.md`](../08-distribution/identidade-e-propriedade.md) | **Comprovada e integrada** |
| **T0010** | [#76](https://github.com/orbita83/Orbity/issues/76) — Configurar identidade e versionamento do app | 2 | Build e distribuição | PR [#107](https://github.com/orbita83/Orbity/pull/107) (`ef44d0d`) | [`app.json`](../../app.json), [`docs/08-distribution/versionamento-do-app.md`](../08-distribution/versionamento-do-app.md) | **Comprovada e integrada** |
| **T0011** | [#77](https://github.com/orbita83/Orbity/issues/77) — Configurar EAS CLI e perfis de build | 3 | Build e distribuição | PR [#110](https://github.com/orbita83/Orbity/pull/110) (`65f356c`) | [`eas.json`](../../eas.json), [`docs/08-distribution/eas-build.md`](../08-distribution/eas-build.md) | **Comprovada e integrada** |
| **T0012** | [#78](https://github.com/orbita83/Orbity/issues/78) — Configurar assinatura Android e validar builds | 4 | Build e distribuição | PR [#119](https://github.com/orbita83/Orbity/pull/119) (`fbb3eae`) + PR [#178](https://github.com/orbita83/Orbity/pull/178) (aberto) | [`docs/08-distribution/assinatura-e-builds-android.md`](../08-distribution/assinatura-e-builds-android.md) | **Integrada com pendência de instalação física e PR #178 em revisão** |
| **T0013** | [#79](https://github.com/orbita83/Orbity/issues/79) — Auditar requisitos técnicos da Google Play | 5 | Build e distribuição | PR [#179](https://github.com/orbita83/Orbity/pull/179) (aberto — `docs/t0013-auditoria-google-play`) | `docs/08-distribution/auditoria-google-play.md` (no PR #179); issues [#176](https://github.com/orbita83/Orbity/issues/176) e [#177](https://github.com/orbita83/Orbity/issues/177) | **Em revisão de PR (#179), com pendências mapeadas** |
| **T0014** | [#80](https://github.com/orbita83/Orbity/issues/80) — Formalizar política de versões, releases e aprovação | 1 | Governança e automação | PR [#109](https://github.com/orbita83/Orbity/pull/109) (`e82a823`) | [`CONTRIBUTING.md` (Seção 4)](../../CONTRIBUTING.md#4-processo-de-publicação-e-governança-de-releases), [`.github/PULL_REQUEST_TEMPLATE/release.md`](../../.github/PULL_REQUEST_TEMPLATE/release.md) | **Comprovada e integrada** |
| **T0015** | [#81](https://github.com/orbita83/Orbity/issues/81) — Automatizar build EAS sob demanda e documentar publicação | 5 | Governança e automação | PR [#121](https://github.com/orbita83/Orbity/pull/121) (`e92b72b`) | [`.github/workflows/eas-build.yml`](../../.github/workflows/eas-build.yml), [`docs/08-distribution/build-sob-demanda.md`](../08-distribution/build-sob-demanda.md), [`docs/08-distribution/submissao-google-play.md`](../08-distribution/submissao-google-play.md) | **Código e documentação integrados; issue #81 aberta para validação operacional do workflow** |
| **T0016** | [#82](https://github.com/orbita83/Orbity/issues/82) — Atualizar onboarding e validar conclusão do ÉPICO 0 | 5 | Governança e automação | Esta entrega (`chore/onboarding-validacao-epico-0`) | [`README.md`](../../README.md), [`docs/06-quality/validacao-epico-0.md`](./validacao-epico-0.md), [`docs/03-backlog/epics/EP-0000.md`](../03-backlog/epics/EP-0000.md) | **Concluída nesta entrega** |
| **T0017** | [#83](https://github.com/orbita83/Orbity/issues/83) — Estrutura inicial de telas e navegação inferior | 2 | Arquitetura / Design System | PR [#103](https://github.com/orbita83/Orbity/pull/103) (`81912d2`); evoluído nos PRs [#126](https://github.com/orbita83/Orbity/pull/126), [#129](https://github.com/orbita83/Orbity/pull/129), [#130](https://github.com/orbita83/Orbity/pull/130), [#143](https://github.com/orbita83/Orbity/pull/143), [#144](https://github.com/orbita83/Orbity/pull/144) | [`src/app/_layout.tsx`](../../src/app/_layout.tsx), [`src/view/components/MainTabBar.tsx`](../../src/view/components/MainTabBar.tsx), [`docs/shell-navegacao-inicial.md`](../shell-navegacao-inicial.md) | **Comprovada e integrada** |

---

## 4. Evidências das Verificações Técnicas Executadas

Todas as verificações abaixo foram executadas em 20/11/2026 sobre a referência `aa241a1`:

| Verificação | Comando Executado | Código de Saída | Resultado e Métricas Obtidas |
| :--- | :--- | :---: | :--- |
| **Lint (ESLint)** | `npm run lint` | `0` | `expo lint` concluído sem erros ou avisos bloqueantes. |
| **TypeScript** | `npx --no-install tsc --noEmit` | `0` | Verificação estrita (`"strict": true`) aprovada sem erros de compilação. |
| **Testes Automatizados** | `npm test` | `0` | **54 suítes aprovadas** (54 totais), **393 testes aprovados** (393 totais), 0 falhas, 0 snapshots, tempo ~26,0 s. |
| **Contratos e Contrastes ODS** | `node tests/ods-theme.test.cjs` | `0` | `Contratos de tema e contrastes: OK` (gradiente ação mín. `5.5027:1`; gradiente progresso mín. `3.0290:1`; chip selecionado pressionado `4.9833:1`; perfil nos 3 temas: OK). |
| **Build Estático do Storybook** | `npm run build-storybook` | `0` | Storybook `v10.6.2` + Vite `v6.4.4`: 663 módulos transformados em ~11,4 s, saída gerada em `storybook-static/`. |
| **Hooks Locais do Git** | `node scripts/verify-local-hooks.mjs` | `0` | **18 verificações aprovadas** em repositório temporário (`pre-push`, `commit-msg` e `pre-commit`). |
| **Configuração Pública Expo** | `npx --no-install expo config --type public` | `0` | Manifesto do SDK 57 resolvido com pacote `io.github.orbita83.orbity`, versão `0.1.0` (`versionCode: 1`) e `projectId` válido. |

> **Observação registrada durante a execução do Jest:** Nos testes de navegação que montam o layout de abas (`src/view/profile-navigation.test.tsx`), o `expo-router` emite no console os avisos informativos `[Layout children]: Too many screens defined. Route "new-task" / "new-routine" / "routine-details" is extraneous`. Esses avisos decorrem da presença das rotas de formulário/detalhe ao lado das cinco abas principais em `src/app/` e não causam falha nos testes nem afetam o funcionamento do roteador.

---

## 5. Validação por Frente da Fundação

### 5.1. Arquitetura e Injeção de Dependências (T0001, T0002, T0003, T0017)

- **Divisão em 5 camadas e limites arquiteturais:** a organização de `src/` respeita integralmente a estrutura documentada em [`ARCHITECTURE.md`](../../ARCHITECTURE.md) e as convenções de nomenclatura de [`RULES.md`](../../RULES.md) (`kebab-case.tsx` para rotas em `src/app/` e telas em `src/view/`, `PascalCase.tsx` para componentes em `src/view/components/`, `use*ViewModel.ts` com retorno em tupla `[state, actions]` em `src/viewmodel/`, e `camelCase.ts` com prefixo `i` para arquivos de interface exclusiva em `src/model/`, `src/usecase/`, `src/infra/` e `src/di/`).
- **Composition Root e substituição de dependências:** o módulo [`src/di/container.ts`](../../src/di/container.ts) centraliza a composição de `dataSources`, `services` e `useCases`, congelando as referências (`Object.freeze`). A suíte [`src/di/container.test.ts`](../../src/di/container.test.ts) comprova:
  1. Que importar o container não abre conexão prematura com o SQLite (`DatabaseProvider.prototype.get` não é chamado no carregamento do módulo);
  2. Que `createAppContainer(overrides)` permite injetar *fakes* em memória (`MemoryTaskDataSource`, `MemoryRoutineDataSource`, `MemoryDailyActivityDataSource`) e relógio determinístico (`IClockService`) sem alterar os casos de uso ou as ViewModels;
  3. Que o container padrão e seus registros internos permanecem imutáveis.
- **Refinamentos arquiteturais rastreados fora do escopo bloqueante do ÉPICO 0:** durante a evolução das funcionalidades iniciais, a equipe abriu as issues de manutenção [#158](https://github.com/orbita83/Orbity/issues/158) (*Fazer as ViewModels dependerem só de contratos de Use Case*) e [#159](https://github.com/orbita83/Orbity/issues/159) (*Tirar detalhes de apresentação das entidades do domínio*) para aprimorar o isolamento estrito em módulos específicos de produto.

### 5.2. Qualidade, Testes e Integração Contínua (T0004, T0005, T0006)

- **Cobertura multicamada:** as 54 suítes de teste cobrem domínio puro (`localDate`, `task`, `routine`, `streak`, `progress`, `errors`), infraestrutura SQLite e em memória (incluindo testes de contrato `*.contract.ts`), casos de uso (`homeUseCases`, `taskUseCases`, `routineUseCases`, `streakUseCases`, `profileUseCases`, `profileMetrics`), ViewModels (`useHomeViewModel`, `useTasksViewModel`, `useNewTaskViewModel`, `useRoutinesViewModel`, `useNewRoutineViewModel`, `useRoutineDetailsViewModel`, `useProfileViewModel`, `useSettingsViewModel`, `useCategoriesViewModel`, `useAchievementsViewModel`) e componentes/telas React Native.
- **Workflow de CI (`.github/workflows/ci.yml`):** o job `validate` executa automaticamente em todo Pull Request direcionado à `development`.
  - **Evidência de detecção de falhas:** no run [`44384281626`](https://github.com/orbita83/Orbity/actions/runs/44384281626) (18/11/2026, PR #156), o CI interrompeu e reprovou a execução em `12s` ao detectar divergência entre `package.json` e `package-lock.json` no passo `npm ci`.
  - **Evidências de aprovação:** após a sincronização do lockfile, o run [`44786002414`](https://github.com/orbita83/Orbity/actions/runs/44786002414) (20/11/2026, PR #156) concluiu todos os passos (`npm ci`, `npm run lint`, `tsc --noEmit`, `npm run build-storybook`, `npm test` e `node tests/ods-theme.test.cjs`) com status `success` em `1m30s`. Os runs [`44788665776`](https://github.com/orbita83/Orbity/actions/runs/44788665776) (PR #178) e [`44793582349`](https://github.com/orbita83/Orbity/actions/runs/44793582349) (PR #179) também foram aprovados em 20/11/2026.

### 5.3. Design System e Storybook (T0007, T0008)

- **Tokens executáveis:** [`src/view/theme/tokens.ts`](../../src/view/theme/tokens.ts) materializa em TypeScript os tokens das versões 1.0.0 a 1.2.0 de [`design-system/02-tokens.md`](../../design-system/02-tokens.md) para os temas `light`, `dark` e `cosmic`, validados automaticamente por [`tests/ods-theme.test.cjs`](../../tests/ods-theme.test.cjs).
- **Catálogo Storybook:** conta atualmente com **16 arquivos de histórias (`*.stories.tsx`)**, abrangendo desde os componentes-base planejados no ÉPICO 0 (`OdsGlobal`, `PrimaryButton`, `TaskCard`, `FilterChips`, `NavBar`) até os componentes e telas evoluídos (`PlanetStreakView`, `FormControls`, `FeedbackComponents`, `ProfileHeaderCard`, `ProfileMetricsCard`, `ProfileShortcutItem`, `EditProfileNameModal`, `index-content`, `tasks-content`, `routines-content` e `profile`).
- O mock [`.storybook/mocks/expo-router.ts`](../../.storybook/mocks/expo-router.ts) permite renderizar no Storybook componentes e telas cujas ViewModels acionam o `expo-router`, registrando as ações de navegação no painel *Actions* sem exigir um navegador empilhado real.

### 5.4. Build e Distribuição Android (T0009, T0010, T0011, T0012, T0013)

- **Identidade, propriedade e versionamento (T0009 e T0010):** documentados em [`docs/08-distribution/identidade-e-propriedade.md`](../08-distribution/identidade-e-propriedade.md) e [`docs/08-distribution/versionamento-do-app.md`](../08-distribution/versionamento-do-app.md), com `io.github.orbita83.orbity`, `version: "0.1.0"`, `versionCode: 1` e `appVersionSource: "local"`.
- **Perfis EAS (T0011):** configurados em [`eas.json`](../../eas.json) (`development`, `preview` e `production`) e validados com `npx eas-cli config` na conta proprietária `@mailsons`.
- **Assinatura e geração de builds no EAS (T0012):**
  - Keystore Android (`Build Credentials 2XZlO4RCyx`) gerado e gerenciado remotamente no EAS, com backup sob guarda do responsável (`@MailsonSousa88`), sem exposição de segredos no repositório.
  - **Build `development` (`.apk`):** concluído no EAS sob o ID `394582b2-5ca0-42fa-942c-8f5ded32cfb9` (10/11/2026). **Limitação registrada:** ao tentar instalar o APK em aparelho físico Android, o sistema exibiu a mensagem *"App não instalado"*; a validação da navegação em Android durante a fundação foi comprovada via **Expo Go** no emulador Android 16 (`Medium_Phone_API_36.1`, documentada em [`docs/shell-navegacao-inicial.md`](../shell-navegacao-inicial.md)), permanecendo pendente a comprovação de instalação do APK do *development client*.
  - **Build `production` (`.aab`):** concluído no EAS com status `FINISHED` sob o ID `1a321ab4-c93e-4bd2-8cbb-f89c5a66fee8` (`version: 0.1.0`, `versionCode: 1`), cuja atualização documental na Seção 10 de [`docs/08-distribution/assinatura-e-builds-android.md`](../08-distribution/assinatura-e-builds-android.md) encontra-se submetida no PR [#178](https://github.com/orbita83/Orbity/pull/178).
- **Auditoria Google Play (T0013):** levantamento documental com 32 verificações elaborado e submetido no PR [#179](https://github.com/orbita83/Orbity/pull/179) (`docs/08-distribution/auditoria-google-play.md`), originando as issues de acompanhamento [#176](https://github.com/orbita83/Orbity/issues/176) (política de privacidade pública e acessível no app) e [#177](https://github.com/orbita83/Orbity/issues/177) (preparação do aplicativo no Google Play Console e inspeção binária do AAB).

### 5.5. Governança, Releases e Automação EAS (T0014, T0015)

- **Política de versões e releases (T0014):** formalizada na [Seção 4 do `CONTRIBUTING.md`](../../CONTRIBUTING.md#4-processo-de-publicação-e-governança-de-releases) e no template [`.github/PULL_REQUEST_TEMPLATE/release.md`](../../.github/PULL_REQUEST_TEMPLATE/release.md), definindo o fluxo `development → main`, critérios de corte da `v0.1.0`, tags Git anotadas, distinção entre GitHub Release, build EAS e submissão à Google Play, além do fluxo de hotfixes.
- **Automação EAS sob demanda (T0015):** workflow [`.github/workflows/eas-build.yml`](../../.github/workflows/eas-build.yml) e guias [`docs/08-distribution/build-sob-demanda.md`](../08-distribution/build-sob-demanda.md) e [`docs/08-distribution/submissao-google-play.md`](../08-distribution/submissao-google-play.md) integrados à `development` pelo PR [#121](https://github.com/orbita83/Orbity/pull/121). A issue [#81](https://github.com/orbita83/Orbity/issues/81) permanece aberta para acompanhamento da validação operacional dos environments `eas-internal` / `eas-production` e disparo real com `EXPO_TOKEN` no GitHub Actions.

---

## 6. Avaliação dos Critérios de Conclusão do ÉPICO 0

| Critério do ÉPICO 0 (`EP-0000.md`) | Classificação | Evidência / Observação |
| :--- | :--- | :--- |
| Arquitetura mínima e DI validadas | **Comprovado** | `ARCHITECTURE.md`, `RULES.md`, `src/di/container.ts` e `src/di/container.test.ts` aprovados. |
| Testes unitários e de componentes executáveis | **Comprovado** | `npm test` executa 54 suítes e 393 testes com 100% de aprovação. |
| CI bloqueia alterações que violem as verificações obrigatórias | **Comprovado** | `.github/workflows/ci.yml` ativo; falha detectada no run `44384281626` e aprovações nos runs `44786002414`, `44788665776` e `44793582349`. |
| Tokens do Design System disponíveis em código | **Comprovado** | `src/view/theme/tokens.ts` alinhado ao ODS v1.2.0 e validado por `node tests/ods-theme.test.cjs`. |
| Storybook funcional e validado | **Comprovado** | 16 arquivos `*.stories.tsx` compilados com sucesso via `npm run build-storybook`. |
| Shell inicial com cinco telas e barra inferior funcional, validado em Android | **Comprovado** | Validado via testes automatizados e em emulador Android 16 (`Medium_Phone_API_36.1`) com Expo Go (`docs/shell-navegacao-inicial.md`). |
| Identidade Android e estratégia de versionamento aprovadas | **Comprovado** | `io.github.orbita83.orbity`, `0.1.0` (`versionCode: 1`) e `appVersionSource: local` documentados e configurados. |
| EAS configurado com perfis de desenvolvimento, preview e produção | **Comprovado** | `eas.json` e `docs/08-distribution/eas-build.md` integrados e validados com `npx eas-cli config`. |
| Build Android de desenvolvimento instalado e validado | **Pendente** | Build `394582b2-5ca0-42fa-942c-8f5ded32cfb9` gerado no EAS, porém a instalação do APK exibiu *"App não instalado"* (registrado na T0012 e acompanhado na T0013/#177). |
| AAB de produção gerado e verificado | **Parcialmente comprovado** | Build `1a321ab4-c93e-4bd2-8cbb-f89c5a66fee8` concluído (`FINISHED`) no EAS (PR #178 em revisão); inspeção binária do artefato `.aab` acompanhada em #79/#177. |
| Assinatura e credenciais administradas com segurança | **Comprovado** | Keystore remoto gerenciado no EAS (`Build Credentials 2XZlO4RCyx`), com backup externo pelo responsável e zero credenciais no Git. |
| Requisitos técnicos da Google Play auditados | **Em revisão (PR #179)** | Relatório de auditoria com 32 verificações submetido no PR #179, com pendências operacionais desdobradas nas issues #176 e #177. |
| Processo de build e release documentado | **Comprovado** | Documentado em `CONTRIBUTING.md` (Seção 4) e `docs/08-distribution/`. |
| Novo integrante consegue reproduzir as validações da fundação | **Comprovado** | Onboarding consolidado no `README.md` e comandos validados com código de saída `0`. |

---

## 7. Quadro Consolidado de Pendências e Encaminhamentos

As pendências abaixo estão devidamente isoladas na frente de distribuição/publicação externa e **não bloqueiam o desenvolvimento local nem a implementação dos épicos funcionais de produto**:

| Item Pendente | Referência / Issue / PR | Responsável | Encaminhamento |
| :--- | :--- | :--- | :--- |
| Integração do registro de conclusão do AAB de produção da T0012 | PR [#178](https://github.com/orbita83/Orbity/pull/178) (Refs [#78](https://github.com/orbita83/Orbity/issues/78)) | `@MailsonSousa88` | Revisar e aprovar o merge do PR #178 na `development`. |
| Revisão e integração do relatório de auditoria da Google Play (T0013) | PR [#179](https://github.com/orbita83/Orbity/pull/179) (Refs [#79](https://github.com/orbita83/Orbity/issues/79)) | `@AlissonSena7` / Equipe | Revisar e integrar o PR #179 após o PR #178; deliberar sobre o fechamento da issue #79 com pendências rastreadas em #176 e #177. |
| Diagnóstico da instalação do APK `development` e inspeção binária do AAB | Issues [#78](https://github.com/orbita83/Orbity/issues/78), [#79](https://github.com/orbita83/Orbity/issues/79) e [#177](https://github.com/orbita83/Orbity/issues/177) | `@MailsonSousa88` / `@Cassiosampaio2016` | Baixar o artefato `.aab` na conta proprietária para inspecionar manifesto/SDKs e testar nova instalação de APK (`preview`/`development`). |
| Validação operacional do workflow `eas-build.yml` com `EXPO_TOKEN` (T0015) | Issue [#81](https://github.com/orbita83/Orbity/issues/81) | `@MailsonSousa88` | Configurar os environments `eas-internal` e `eas-production` com `EXPO_TOKEN` e registrar uma execução de `workflow_dispatch`. |
| Política de privacidade pública e acessível dentro do aplicativo | Issue [#176](https://github.com/orbita83/Orbity/issues/176) | Equipe | Implementar antes da submissão pública à Google Play Store. |
| Cadastro inicial do aplicativo no Google Play Console | Issue [#177](https://github.com/orbita83/Orbity/issues/177) | `@Cassiosampaio2016` | Preparar a ficha do aplicativo no Console sem enviar versão pública antes do cumprimento dos critérios de release. |

---

## 8. Parecer Técnico e Governança de Encerramento

1. **Aptidão para desenvolvimento dos épicos funcionais:** A fundação técnica de código, arquitetura MVVM Sofisticado, injeção de dependências (`src/di/`), persistência SQLite, tokens e componentes do Orbity Design System, Storybook, suíte de testes automatizados (54 suítes / 393 testes), hooks locais do Git, integração contínua e onboarding técnico (`README.md`) encontra-se **100% operacional, reproduzível e validada** na branch `development`. Não há impedimentos técnicos para o desenvolvimento dos épicos funcionais.
2. **Conclusão da T0016 ([#82](https://github.com/orbita83/Orbity/issues/82)):** Com a substituição do marcador `@README` pelo guia completo de onboarding no [`README.md`](../../README.md), a atualização do acompanhamento em [`docs/03-backlog/epics/EP-0000.md`](../03-backlog/epics/EP-0000.md) e o registro verificável das evidências neste relatório, todos os critérios técnicos da T0016 estão cumpridos.
3. **Deliberação sobre o ÉPICO 0 ([#66](https://github.com/orbita83/Orbity/issues/66)):** Conforme a regra operacional do épico, a aprovação deste relatório e o encerramento definitivo das entregas remanescentes da Onda 5 (integração dos PRs [#178](https://github.com/orbita83/Orbity/pull/178) e [#179](https://github.com/orbita83/Orbity/pull/179) e validação operacional da [#81](https://github.com/orbita83/Orbity/issues/81)) ficam submetidos à revisão e aprovação formal da equipe no Pull Request desta tarefa.
