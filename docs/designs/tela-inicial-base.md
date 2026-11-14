# Base da tela Início: sequência, trava do Modo Foco e barra de progresso

*   **Author:** MailsonSousa88
*   **Status:** Approved
*   **Date:** 2026-11-13 (revisado em 2026-11-14 depois da revisão EGM)

--------------------------------------------------------------------------------

## Overview

A aba Início é a primeira tela do Orbity ([UC-0009](../04-specifications/use-cases/UC-0009-consultar-tela-inicial.md), [FL-0009](../04-specifications/flows/FL-0009.md)). Na `development`, ela é um placeholder (`src/view/HomeScreen.tsx`), e as camadas `model`, `usecase`, `infra` e `viewmodel` estão vazias.

A branch `origin/feat/tela-principal-prototipo` tem um protótipo da tela, com 9 commits sem merge (último: `54a5d90`; base comum com a branch atual: `73230cc`):
*   painel deslizante com gestos (`activity-sheet-geometry.ts`, `use-activity-sheet-motion.ts`);
*   visualizador de planeta (`planet-streak-view.tsx`) e `focus-bottom-sheet.tsx`;
*   tokens cósmicos próprios (`cosmicTokens`);
*   domínio, use case, repositório em memória e DI próprios.

Este design parte desse protótipo (D4).

O domínio do protótipo diverge dos requisitos:
*   a sequência é um número guardado (`HomeDashboardData.streakDays`), sem registro diário;
*   o progresso conta minutos de foco, e não tarefas e rotinas;
*   uma sessão de foco atualiza o dashboard e não tem vínculo com tarefa;
*   as conquistas já existem como dados, embora estejam fora de escopo ([RF-0017](../02-requirements/functional/RF-0017.md), [RF-0018](../02-requirements/functional/RF-0018.md)).

Este design cria a **base** da tela em três partes:

1. **Sequência:** o registro dos dias com atividade e o cálculo dos dias consecutivos ([RF-0014](../02-requirements/functional/RF-0014.md), [RF-0015](../02-requirements/functional/RF-0015.md), [RF-0016](../02-requirements/functional/RF-0016.md)). É o elemento principal da tela.
2. **Trava do Modo Foco:** a entrada do cronômetro pomodoro aparece com as durações pré-definidas ([RF-0019](../02-requirements/functional/RF-0019.md)). Ela fica bloqueada enquanto não existir tarefa ou rotina para vincular ([RN-0001](../02-requirements/business-rules/RN-0001.md), [EC-0001](../04-specifications/edge-cases/EC-0001-inicio-modo-foco-sem-tarefa-ou-rotina.md)). O motor da sessão (iniciar, contar, terminar, interromper) fica para a mudança de Tarefas (D2).
3. **Barra de progresso:** tarefas e rotinas concluídas sobre o total cadastrado ([RN-0007](../02-requirements/business-rules/RN-0007.md)).

Tarefas, rotinas e conquistas ainda não existem. Por isso, nesta entrega a tela mostra os estados vazios reais: 0 dias, `0/0` e o Modo Foco bloqueado com uma orientação.

Quando Tarefas e Rotinas forem criadas, elas vão registrar atividade e preencher uma fonte de dados que hoje está vazia. Os contratos e a exibição da sequência e do progresso não mudam. O seletor de tarefa do Modo Foco e o motor da sessão ainda serão desenhados.

**Termos usados aqui:**
*   **ODS:** Orbity Design System (`design-system/`).
*   **EGM:** Elephant-Goldfish Model, o processo de design e revisão usado neste documento (`docs/designs/README.md`).
*   **EP-0000:** o épico de fundação do Orbity ([EP-0000](../03-backlog/epics/EP-0000.md)).

## The Problem

O estudante abre o Orbity e não encontra nada que mostre a constância dos estudos dele. Na `development`, a tela Início é só um texto de espera.

O protótipo reproduz o painel e o visualizador do FL-0009, mas os números que ele mostra não seguem as regras documentadas:
*   a sequência não zera;
*   o progresso mede outra coisa;
*   o foco não se vincula a nada.

O produto se apoia na sequência de dias com atividade (RF-0015), e ela não tem nem as regras implementadas nem persistência local.

Há também um problema de ordem. A sequência depende de conclusões de tarefas e rotinas, e o Modo Foco depende de existir uma tarefa ou rotina para vincular. Essas funcionalidades ainda não existem. Se a tela Início esperar por elas, fica parada. Se for construída com dados inventados, as regras serão escritas sobre premissas falsas e refeitas depois.

A proposta é construir agora o que **não depende** de tarefas e rotinas:
*   o registro diário;
*   o cálculo da sequência;
*   a contagem do progresso;
*   a trava do foco;
*   a tela que mostra tudo isso.

Os pontos de entrada que Tarefas e Rotinas vão usar ficam definidos desde já. A tela mostra os estados vazios reais (0 dias, `0/0`) e orienta o estudante sem linguagem punitiva ([RNF-0002](../02-requirements/non-functional/RNF-0002.md)).

## Goals

*   **G1 — Sequência calculada pelas regras do RF-0015.** Dada uma lista de dias com atividade e a data local de hoje, a sequência (a quantidade de dias consecutivos que termina na atividade mais recente) segue o mapeamento abaixo:

    | Critério do RF-0015 | Regra | Onde é garantido |
    | :--- | :--- | :--- |
    | CA-01 | o primeiro dia com atividade inicia a sequência em 1 | `calculateStreak` |
    | CA-02 | uma atividade no dia seguinte ao último contabilizado soma 1 | `calculateStreak` |
    | CA-03 | não soma mais de uma vez no mesmo dia | `calculateStreak` + chave única por data |
    | CA-04 | mantém o valor no dia seguinte à última atividade | `calculateStreak` |
    | CA-05 | zera depois de um dia inteiro sem atividade | `calculateStreak` |
    | CA-06 | recalcula ao abrir o app | `HomeViewModel` (D17) |
    | CA-07 | recomeça em 1 depois de uma interrupção | `calculateStreak` |
    | CA-08 | o dia é o calendário local do estudante | `IClockService.todayLocal()` |

    Cada linha tem um teste automatizado com o ID do critério no nome.
*   **G2 — Registro diário idempotente.** Registrar atividade várias vezes no mesmo dia gera um único dia registrado (RF-0014 CA-03). O `IDailyActivityRepository` não tem operação de apagar (RF-0014 CA-04). O comportamento de desfazer uma conclusão será testado na mudança de Tarefas.
*   **G3 — Persistência local verificada pelo contrato.** A suíte de contrato roda o SQL real no `better-sqlite3` e mostra que os dias continuam registrados depois de fechar e reabrir a conexão com o banco ([RNF-0004](../02-requirements/non-functional/RNF-0004.md), [ADR-0001](../05-architecture/decisions/ADR-0001.md)). Nesta iteração não há checagem no aparelho (E6).
*   **G4 — Ponto de entrada pronto para Tarefas e Rotinas.** Existe um único caso de uso para registrar atividade. O tipo da origem só admite tarefa sem rotina ou rotina ([RN-0002](../02-requirements/business-rules/RN-0002.md)), então sessões de foco não conseguem registrar atividade (RF-0019 CA-04). Classificar uma tarefa como avulsa ou de rotina é responsabilidade de quem chama.
*   **G5 — Barra de progresso conforme o RN-0007.** Mostra `concluídas/total` sobre o total geral, e `0/0` quando não há nada cadastrado, sem dividir por zero e sempre com o texto visível, não só a cor.
*   **G6 — Modo Foco bloqueado com orientação acessível.** Sem tarefa ou rotina para vincular, o botão Iniciar fica desabilitado (RN-0001, EC-0001, D7). A orientação aparece como texto visível e também como `accessibilityHint`. As durações oferecidas são exatamente 5, 10, 15, 20, 25 e 30 minutos, com 15 marcado por padrão (D12).
*   **G7 — Tela Início com estados distintos.** A tela mostra o visualizador de sequência e o painel com Modo Foco, progresso e atalho de Conquistas. Ela separa "carregando", "erro ao ler os dados" e "0 dias", para que uma falha nunca pareça perda de sequência. Usa só tokens do ODS 1.2.0, com o tema `themes.cosmic`, e os textos da tabela da Etapa 7 (D22).
*   **G8 — Validação local verde em todo commit.** Passam `npm run lint`, `npx --no-install tsc --noEmit`, `npm test`, `npm run build-storybook` e `node tests/ods-theme.test.cjs` ([AGENTS.md](../../AGENTS.md) §5 e `.github/workflows/ci.yml`).

## Non-Goals

*   Criar, listar, concluir ou excluir tarefas e rotinas (RF-0001 a RF-0013).
*   O motor da sessão de foco: iniciar, contar o tempo, terminar, interromper, persistir a sessão, restaurar depois que o app é morto e esconder a barra de abas durante a sessão. Também ficam de fora o efeito visual do [RN-0006](../02-requirements/business-rules/RN-0006.md) e os casos [EC-0007](../04-specifications/edge-cases/EC-0007-interrupcao-sessao-modo-foco-em-andamento.md) e [EC-0008](../04-specifications/edge-cases/EC-0008-alteracao-tarefa-ou-rotina-vinculada-ao-modo-foco.md). Tudo isso entra com a mudança de Tarefas e o [UC-0010](../04-specifications/use-cases/UC-0010-iniciar-modo-foco.md) (D2).
*   A regra "rotina concluída uma vez por dia" ([RF-0011](../02-requirements/functional/RF-0011.md) CA-05). Ela pertence à rotina.
*   Conquistas, estrelas, constelação e a tela Cosmos ([RN-0003](../02-requirements/business-rules/RN-0003.md), [RN-0005](../02-requirements/business-rules/RN-0005.md), RF-0017, RF-0018). O atalho de Conquistas aparece desabilitado (D16).
*   Recalcular a sequência à meia-noite com a tela aberta (D17).
*   Design visual definitivo, que vem em iterações futuras.
*   Teste manual no aparelho: ainda não há como testar manualmente (E6).
*   Build de dev client ou EAS. O autor faz o build quando quiser (E7).
*   Sincronização, backup, conta de usuário ou backend.
*   Persistência na web: os dados ficam só em memória e se perdem ao recarregar (D8).

## Decisions & Open Questions

Os rótulos "(era Qn)" apontam para as perguntas do brainstorm e do draft. As decisões marcadas como **retirada** ficam aqui só para o histórico, porque a revisão EGM adiou o motor do foco (E1).

*   **D1 (era Q1):** conta para a sequência concluir **uma tarefa sem rotina ou uma rotina** (RN-0002). Uma subtarefa dentro de uma rotina não conta sozinha. O [EC-0003](../04-specifications/edge-cases/EC-0003-conclusao-parcial-entre-rotina-e-tarefa-avulsa.md), que exige as duas categorias, contradiz isso e passa a `Superseded`.
*   **D2 (era Q2, revista na E1):** a iteração entrega o registro diário, a sequência, o progresso, a trava do foco e a tela. O motor da sessão de foco fica para a mudança de Tarefas, porque nesta iteração nenhuma sessão pode começar (não há alvo) e o seletor de alvo ainda não foi desenhado.
*   **D3 (era Q12):** o painel usa o gesto de deslizar do protótipo (`PanResponder` + `Animated`, sem `react-native-gesture-handler`).
*   **D4:** o protótipo é integrado inteiro e depois refatorado (decisão do autor, mantida na E2). Antes de refatorar, a Etapa 0.2b produz a tabela "sobrevive / renomeia / apaga".
*   **D5 — retirada (E1):** a marcação "sessão ativa" do RN-0006 sai junto com o motor.
*   **D6 (era Q9):** a constelação **não volta** quando a sequência zera. O RN-0003 CA-02 é atualizado nesta mudança. A constelação em si fica fora do código.
*   **D7 (era Q11):** o botão Iniciar fica desabilitado, com o texto de apoio sempre visível.
*   **D8 (era Q5):** na web, os dados ficam só em memória e se perdem ao recarregar.
*   **D9 (era Q6, corrigida na revisão):** os nomes de arquivo seguem o [`RULES.md`](../../RULES.md):
    *   **PascalCase** em `src/view/` e `src/viewmodel/`;
    *   **kebab-case** em `src/model/`, `src/usecase/`, `src/infra/` e `src/app/`;
    *   prefixo `I` nas interfaces.

    A primeira versão da D9 dizia, por engano, que o `RULES.md` pede PascalCase em todo o `src/`. Os componentes kebab-case que já existem em `src/view/components/` ficam como dívida registrada.
*   **D10 — retirada (E1):** a sessão de foco não é persistida nesta iteração, e o esquema v1 fica só com o registro diário.
*   **D11 — retirada (E1):** o comportamento de reabertura com sessão salva vai para a mudança de Tarefas.
*   **D12 (parte da Q7):** a duração padrão do Modo Foco é **15 minutos**.
*   **D13 (parte da Q7):** o EC-0008 fica para a mudança de Tarefas.
*   **D14 (parte da Q3):** o ADR-0001 passa a `Accepted`, e o esquema v1 tem uma única tabela, `daily_activity`. Se o banco no aparelho tiver `user_version` maior do que o app conhece (só acontece instalando um APK mais antigo), o app não abre o banco, não apaga nada e mostra o estado de erro sem nova tentativa (texto `error.schema`).
*   **D15 (era Q4):** o código SQLite depende de uma porta `ISqlExecutor`, implementada com `expo-sqlite` no app e com `better-sqlite3` nos testes. A mesma suíte de contrato roda contra a implementação SQLite e a em memória. A transação é um lote declarativo de comandos, para os dois drivers se comportarem igual. A camada fina sobre o `expo-sqlite` fica sem teste automatizado.
*   **D16 (era Q10):** o atalho de Conquistas aparece desabilitado com o texto "em breve" e não navega. Os dados de conquistas do protótipo saem do domínio da Home.
*   **D17 (era Q13, revista na E3):** a sequência é recalculada **ao abrir o app** (RF-0015 CA-06) e **quando o app volta do segundo plano**. Dias com data maior que hoje continuam no banco, mas não entram na conta. Não há temporizador da meia-noite. O incremento depende só de concluir uma tarefa ou rotina no dia local, o que os CAs atuais do RF-0015 já cobrem.
*   **D18 (Plano Técnico):** a navegação continua com `Tabs` e `MainTabBar` da `development`. A Home perde a `NavBar` interna do protótipo. O `MainTabBar` não muda nesta iteração.
*   **D19 — retirada (E1):** a diferença entre `finished` e `interrupted` com o app vivo ou morto vai para a mudança de Tarefas.
*   **D20 (Implementação):** a branch de trabalho `feat/tela-inicial-base` parte da `chore/integracao-tela-inicial`, e não da `development`, como manda o [AGENTS.md](../../AGENTS.md) §2. Os pontos principais:
    *   A branch de integração junta **três** PRs em rascunho, mais o protótipo: [#113](https://github.com/orbita83/Orbity/pull/113) (ODS 1.2.0, `docs/atualiza-ods-1-2-0`), [#119](https://github.com/orbita83/Orbity/pull/119) (assinatura Android, `chore/assinatura-builds-android`) e [#121](https://github.com/orbita83/Orbity/pull/121) (build EAS, `chore/build-eas-sob-demanda`).
    *   É uma exceção consciente: as telas estão sendo adiantadas antes do fim do [EP-0000](../03-backlog/epics/EP-0000.md), enquanto o resto do time trata a Play Store.
    *   Verificado em 2026-11-14: o ODS 1.2.0 da branch de integração é idêntico ao commit `2d787eb` do #113.
    *   O PR desta mudança é aberto **como rascunho contra a `development`** (E8). Ele só sai de rascunho depois do merge de #113, #119 e #121, porque até lá o diff dele inclui os commits desses três.
*   **D21 (revisão):** a ViewModel usa o `AppState` do React Native diretamente, como exceção aceita ao [ARCHITECTURE.md](../../ARCHITECTURE.md) §3.1, que só lista hooks do React. Uma porta de ciclo de vida seria código sem segundo uso.
*   **D22 (revisão, E9):** os textos da interface são os da tabela da Etapa 7, aprovados pelo autor. Nenhum texto pode conter termos da lista `PUNITIVE_TERMS`.

### Ainda em aberto

*   **RN-0007, pontos pendentes:** como uma rotina recorrente conta como "concluída" no total geral, e se as tarefas de uma rotina entram no total por conta própria. Isso fica para a mudança de Tarefas e Rotinas. O contrato `IActivityCatalog.getProgressCounts()` pode mudar então.

## Critical User Journeys (CUJs)

### CUJ 1: Estudante abre o app sem nenhuma atividade cadastrada

*   **Given**: Instalação nova; nenhuma tarefa, rotina ou dia de atividade registrado.
*   **When**: O estudante abre o app na aba Início.
*   **Then**:
    *   O visualizador mostra 0 dias e o texto `streak.empty`.
    *   O painel mostra a barra com o texto `0/0` sempre visível.
    *   O Modo Foco aparece com o botão Iniciar desabilitado e o texto `focus.blocked`.
    *   O atalho de Conquistas aparece desabilitado, com o texto `achievements.soon`.
    *   Nenhuma mensagem de erro aparece.

### CUJ 2: Sequência calculada a partir de dias registrados

*   **Given**: Existem dias registrados (inseridos pelos testes ou, no futuro, pela conclusão de tarefas e rotinas). A data local de hoje é D.
*   **When**: A tela Início carrega.
*   **Then**: O valor mostrado segue a tabela do G1:
    *   se a atividade mais recente for D ou D−1, a tela mostra quantos dias consecutivos terminam nela;
    *   se for D−2 ou antes, mostra 0;
    *   uma nova atividade depois de um intervalo recomeça em 1.

### CUJ 3: Várias conclusões no mesmo dia

*   **Given**: Hoje ainda não há dia registrado.
*   **When**: O caso de uso de registrar atividade é chamado três vezes hoje.
*   **Then**: Existe exatamente um dia registrado para hoje, e a sequência sobe uma única vez.

### CUJ 4: Falha ao ler os dados

*   **Given**: A leitura do armazenamento local falha.
*   **When**: A tela Início carrega.
*   **Then**:
    *   **Falha passageira (`PERSISTENCE_FAILURE`):** a tela mostra o texto `error.persistence` com o botão "Tentar de novo". A nova tentativa abre o banco outra vez.
    *   **Versão do banco não suportada (`SCHEMA_VERSION_UNSUPPORTED`):** a tela mostra o texto `error.schema`, sem botão.
    *   Em nenhum dos dois casos a tela mostra o número da sequência, nem "0".
    *   O erro chega à ViewModel como `DomainError`, e não como erro bruto do driver.

### CUJ 5: Estudante chega ao Modo Foco sem tarefa

*   **Given**: Não existe tarefa nem rotina para vincular.
*   **When**: O estudante abre o painel e chega ao Modo Foco, pelo toque ou pelo leitor de tela.
*   **Then**:
    *   O botão Iniciar está desabilitado (`accessibilityState.disabled = true`).
    *   O texto `focus.blocked` está visível e também é o `accessibilityHint` do botão.
    *   As durações aparecem como um `radiogroup` com 5, 10, 15, 20, 25 e 30 minutos, com 15 marcado e sem campo de valor livre.

### CUJ 6: Volta do segundo plano depois da meia-noite

*   **Given**: A Home mostra N dias, e o app vai para o segundo plano no dia D.
*   **When**: O estudante volta ao app no dia D+2, sem ter registrado atividade em D+1.
*   **Then**: A sequência é recalculada e mostra 0. Durante o recálculo, a tela continua mostrando o valor anterior (não volta para "carregando").

## Technical Plan (Architecture)

### 1. Ponto de partida: integração do protótipo

A implementação começa com o merge de `origin/feat/tela-principal-prototipo` (`54a5d90`) na branch de trabalho (D4). Uma simulação com `git merge-tree` contra a base `73230cc` mostra conflito em 8 arquivos:

*   `design-system/02-tokens.md`, `design-system/04-componentes/visualizacao-sequencia.md` e `design-system/README.md`;
*   `src/app/_layout.tsx` e `src/app/index.tsx`;
*   `src/view/components/nav-bar.tsx` e `src/view/components/primary-button.tsx`;
*   `src/view/theme/tokens.ts`.

Regras de resolução:

*   **Tokens e design system:** vale o ODS 1.2.0, porque o `design-system/02-tokens.md` é a fonte de verdade visual ([AGENTS.md](../../AGENTS.md) §3). O `cosmicTokens` do protótipo é substituído por `themes.cosmic` e pelos grupos do ODS 1.2.0. A tabela de tokens da Etapa 0.2a é aprovada pelo autor antes de seguir.
*   **Navegação:** vale o `_layout.tsx` da `development`, com `Tabs` e `MainTabBar` (D18). O `Stack` e a rota duplicada `src/app/home-screen.tsx` saem.
*   **`nav-bar.tsx` e `primary-button.tsx`:** vale a versão atual.
*   **`src/di/` do protótipo:** o repositório roda com `core.ignorecase = true` no Windows, então `src/di/` e `src/DI/` viram a mesma pasta. O `src/di/home-factory.ts` é removido no próprio commit de merge.
*   **Compilação em todo commit:** um shim temporário (`cosmicTokens` montado a partir de `themes.cosmic`) e correções mínimas de import fazem o merge compilar. O shim sai na Etapa 7.

### 2. Visão geral das camadas

```text
 src/app/index.tsx ──re-exporta──▶ src/view/HomeScreen.tsx (default: chama o hook)
                                          │
                                          ▼
                                   src/view/HomeScreenContent.tsx (props puras; testes e histórias)
                                          ▲ estado e ações
                     src/viewmodel/HomeViewModel.ts ── ActivitySheetMotionViewModel.ts / ActivitySheetGeometry.ts
                                          │ resolveUseCase(container.useCases.home)
                                          ▼
                     src/usecase/  i-home-use-cases · home-use-cases · i-streak-use-cases · streak-use-cases
                                          │ dependem só de contratos de src/model/
                                          ▼
                     src/model/    entities (local-date, streak, progress, activity-source, focus-duration,
                                             home-summary) · repositories (i-daily-activity-repository,
                                             i-activity-catalog) · services (i-clock-service) · errors
                                          ▲ implementam
                     src/infra/    repositories/ (sqlite-*, in-memory-*, empty-activity-catalog)
                                   services/ (system-clock-service) · database/ (i-sql-executor,
                                   expo-sql-executor, database-provider, migrations)
                                          ▲ compõe: o único ponto de composição
                     src/DI/container.ts + src/DI/persistence.ts (Android) / persistence.web.ts (web)
```

### 3. Domínio (`src/model/`)

O domínio não depende de React, Expo nem de SDKs ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2, Domínio).

*   **`LocalDate`** (`entities/local-date.ts`): data de calendário `AAAA-MM-DD`, sem hora e sem fuso. É a única forma de representar "um dia" no domínio. O `toISOString()` é proibido para datas locais, porque devolve UTC e joga a atividade feita à noite para o dia errado.
*   **`ActivitySource`** (`entities/activity-source.ts`): `{ kind: 'standalone-task' | 'routine'; id: string }`. O tipo impede que sessões de foco registrem atividade (G4).
*   **`StreakSnapshot`** e **`calculateStreak`** (`entities/streak.ts`): função pura. Ignora datas maiores que hoje (D17) e cobre a tabela do G1.
*   **`Progress`** (`entities/progress.ts`): `{ completed; total; ratio: number | null }`. O `ratio` é `null` quando `total = 0`.
*   **`FocusDuration`** (`entities/focus-duration.ts`): o tipo `5 | 10 | 15 | 20 | 25 | 30`, mais `FOCUS_DURATIONS`, `DEFAULT_FOCUS_DURATION = 15` e `isFocusDuration(n)`.
*   **`FocusAvailability`** e **`HomeSummary`** (`entities/home-summary.ts`): `FocusAvailability = { canStart: boolean; reason: 'no-targets' | null; durations: readonly FocusDuration[]; defaultDuration: FocusDuration }`, e `HomeSummary = { streak: StreakSnapshot; progress: Progress; focus: FocusAvailability }`.
*   **Erros** (`errors/domain-error.ts`): `DomainError`, com `code` e `retryable`, e `ValidationError extends DomainError`. Os códigos são `VALIDATION_ERROR`, `PERSISTENCE_FAILURE` (passível de nova tentativa) e `SCHEMA_VERSION_UNSUPPORTED` (não passível).
*   **Contratos:**
    *   `IDailyActivityRepository`: `recordDay` é idempotente, e `listDays` lista os dias. Não existe operação de apagar.
    *   `IActivityCatalog`: somente leitura, com `getProgressCounts()` (`{ completed; total }`, lidos juntos) e `hasFocusTargets()`.
    *   `IClockService`: `now()` (instante ISO com o deslocamento do fuso) e `todayLocal()`.

### 4. Casos de uso (`src/usecase/`)

*   **`IStreakUseCases`:** `recordActivity(source)` grava `clock.todayLocal()` e valida que o `source.id` não está vazio. É o ponto de entrada que Tarefas e Rotinas vão chamar. Nesta iteração, só os testes chamam. O `getStreak()` aplica `calculateStreak` sobre `listDays()`.
*   **`IHomeUseCases`:** `loadHome(): Promise<HomeSummary>`. Depende **direto** dos contratos `IDailyActivityRepository`, `IActivityCatalog` e `IClockService`, e não de outros use cases ([ARCHITECTURE.md](../../ARCHITECTURE.md) §3.1). O `focus.canStart` vem de `hasFocusTargets()`.
*   Os métodos `loadDashboard` e `completeFocusSession` do protótipo deixam de existir.

### 5. Persistência (`src/infra/`)

*   **`ISqlExecutor`** (`database/i-sql-executor.ts`): `all(sql, params)`, `run(sql, params)` e `runInTransaction(statements)`. A transação é um **lote declarativo**: os dois executores rodam `BEGIN`, os comandos e `COMMIT`, e em caso de erro `ROLLBACK`. Sem callback, o `better-sqlite3` (síncrono) e o `expo-sqlite` (assíncrono) se comportam igual (D15).
*   **Esquema v1** (`database/migrations.ts`): só a tabela `daily_activity` (D14).

    ```sql
    CREATE TABLE daily_activity (
      local_date  TEXT PRIMARY KEY
                  CHECK (local_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
      recorded_at TEXT NOT NULL  -- instante ISO-8601 com o deslocamento do fuso, ex.: 2026-11-14T23:59:00-03:00
    );
    ```

    O `recorded_at` guarda o deslocamento do fuso para permitir, no futuro, investigar dias contados em dobro ou pulados depois de uma viagem.
*   **`DatabaseProvider`** (`database/database-provider.ts`):
    *   abre o banco e aplica as migrações pendentes no primeiro uso, e não na importação;
    *   compartilha uma única tentativa entre chamadas simultâneas;
    *   grava o `user_version` depois de cada migração;
    *   **se a tentativa falha com `PERSISTENCE_FAILURE`, descarta a promessa guardada**, e a próxima chamada tenta de novo;
    *   `SCHEMA_VERSION_UNSUPPORTED` fica guardado, sem nova tentativa (D14);
    *   qualquer outra exceção do driver vira `PERSISTENCE_FAILURE`.
*   **Repositórios:**
    *   `sqlite-daily-activity-repository` usa `INSERT OR IGNORE`;
    *   `in-memory-daily-activity-repository` tem o mesmo comportamento, em memória;
    *   `empty-activity-catalog` é provisório e devolve `{ completed: 0, total: 0 }` e `false`.
*   **`system-clock-service`:** monta a data local pelo calendário local do aparelho.

### 6. Composição (`src/DI/`)

*   O `container.ts` troca os registros genéricos `Record<string, unknown>` pelos tipos `AppRepositories` (`dailyActivity`, `activityCatalog`), `AppServices` (`clock`) e `AppUseCases` (`streak`, `home`).
*   **Troca por plataforma dentro do DI** (ADR-0001 §5):
    *   `src/DI/persistence.ts` liga `DatabaseProvider` + `ExpoSqlExecutor` aos repositórios SQLite;
    *   `src/DI/persistence.web.ts` devolve os repositórios em memória (D8);
    *   o Metro escolhe o `.web.ts` na web, inclusive na renderização estática.

    Os dois arquivos só são importados pelo `container.ts`. É o único mecanismo para manter o `expo-sqlite` fora da web, dos testes e do Storybook. A F11 verifica isso com `npm test` e `build-storybook`.
*   O `createContainer` congela (`Object.freeze`) cada registro, para nenhuma camada trocar uma dependência em tempo de execução. Os testes substituem repositórios ou o relógio por `ContainerOverrides`. O `resolveUseCase(override, padrão)` devolve o override quando ele é passado e, se não, o use case do container.
*   O `src/di/home-factory.ts` do protótipo é removido (Technical Plan §1).

### 7. Apresentação (`src/viewmodel/` e `src/view/`)

Correções obrigatórias de camada no protótipo:
*   a View para de importar o DI;
*   a ViewModel para de importar a infraestrutura (`PROTOTYPE_HOME_DASHBOARD`) e a View (`NavTabId`);
*   o hook de gesto para de importar `view/theme/tokens`. A geometria e o `reduceMotion` passam a chegar por parâmetro.

Os arquivos:
*   **`HomeViewModel.ts` → `useHomeViewModel(homeUseCases = resolveUseCase(undefined, container.useCases.home))`:**
    *   estado: `status: 'loading' | 'error' | 'ready'`, `error: { messageKey; retryable } | null`, `summary: HomeSummary | null`, `progressLabel`, `selectedDuration` e `sheetStage`;
    *   ações: `retry()`, `selectDuration(d)` e as ações do painel do protótipo;
    *   recalcula ao montar e quando o `AppState` volta para `active` (D17, D21);
    *   um recálculo em segundo plano **não** volta para `loading`, e um erro depois de `ready` não apaga o que já está na tela;
    *   na camada de apresentação, só esta ViewModel usa `try/catch` ([ARCHITECTURE.md](../../ARCHITECTURE.md) §5).
*   **`ActivitySheetGeometry.ts`:** funções puras de geometria do painel e o tipo `FocusSheetStage` (`'collapsed' | 'stage1_1' | 'stage1_2'`). É um auxiliar da camada ViewModel.
*   **`ActivitySheetMotionViewModel.ts`:** a lógica de gesto do protótipo, que recebe `SheetGeometryConfig` e `reduceMotion` como parâmetros.
*   **`HomeScreen.tsx`** (`default`): chama `useHomeViewModel()` e `useReduceMotion()`, monta o `SheetGeometryConfig` a partir de `themes.cosmic` e renderiza o `HomeScreenContent`.
*   **`HomeScreenContent.tsx`:** a tela do protótipo refatorada, só de apresentação, que recebe estado e ações por props. Testes e histórias renderizam este componente e nunca importam `@/DI`. Ela:
    *   não tem `NavBar` própria;
    *   tem estados de carregando, erro e pronto;
    *   não tem os diálogos de conquista nem de "última sessão".
*   **`FocusBottomSheet.tsx`:**
    *   barra com o texto `concluídas/total` sempre visível (com `ratio = null`, a barra fica vazia, sem porcentagem);
    *   `radiogroup` de durações;
    *   `PrimaryButton` desabilitado, com o texto de apoio;
    *   atalho de Conquistas desabilitado;
    *   um botão acessível para abrir e fechar o painel, que expõe `handleExpandSheet` e `handleReduceSheet` (já existentes) como alternativa ao gesto.

    Cada componente segue a sua especificação em `design-system/04-componentes/` (`painel-deslizante.md`, `barra-progresso.md`, `visualizacao-sequencia.md`, `cartao-conquista.md`, `botao.md`).
*   **`PlanetStreakView.tsx`:** recebe só `days`.

## Alternatives Considered

### Alternative A: Guardar a sequência como contador que só incrementa

*   **Pros**: Leitura imediata, sem cálculo de datas.
*   **Cons**: Desmarcar e marcar de novo contaria duas vezes. Zerar exige um processo diário ou uma verificação que altera o valor guardado.
*   **Reason for Rejection**: Rejected by author: o RF-0014 já define um registro por dia, e calcular a partir dele atende à idempotência e ao reset sem estado extra (ADR-0001).

### Alternative B: AsyncStorage em vez de SQLite

*   **Pros**: Comum no Expo, sem dependência nativa nova.
*   **Cons**: Chave-valor. Consultas por data e tipo teriam de ser feitas em memória, com índices mantidos à mão.
*   **Reason for Rejection**: Rejected by author: tarefas, rotinas e registros são relacionais (ADR-0001 §2).

### Alternative C: Outros recortes de escopo do brainstorm (S2 mínima em memória, S3 S2 com SQLite, S4 cinco mudanças)

*   **Pros**: S2 e S3 têm menos código. S4 separa a revisão em partes: documentação, sequência, inventário de atividades, foco e tela.
*   **Cons**: S2 adia a persistência, e S4 multiplica branches e PRs, num momento em que o time está ocupado com a Play Store.
*   **Reason for Rejection**: Rejected by author: ele escolheu S1 (fatia completa) para deixar a persistência pronta antes de Tarefas. A revisão EGM depois tirou o motor do foco (D2).

### Alternative D: Trazer só a camada visual do protótipo

*   **Pros**: Diff menor. Cerca de 13 arquivos do protótipo não entrariam no PR só para serem apagados.
*   **Cons**: O histórico e a autoria dos commits do protótipo não entram na branch.
*   **Reason for Rejection**: Rejected by author: o protótipo é integrado inteiro (D4, mantida na E2), e a tabela 0.2b torna explícito o que sobrevive.

### Alternative E: Navegação `Stack` com `NavBar` desenhada em cada tela (modelo do protótipo)

*   **Pros**: A Home controla a própria barra.
*   **Cons**: Todas as abas precisariam desenhar a `NavBar`, o `MainTabBar` e os testes dele seriam descartados, e o voltar do Android passaria a voltar entre abas.
*   **Reason for Rejection**: Rejected by author: a `development` já tem uma navegação testada (D18).

### Alternative F: PascalCase em todo o `src/`

*   **Pros**: Um único formato.
*   **Cons**: Contraria o `RULES.md`, que pede kebab-case em model, usecase, infra e rotas.
*   **Reason for Rejection**: Rejected by author: seguir o `RULES.md` (D9).

### Alternative G: Construir o motor do foco agora (sessão persistida, restauração, término)

*   **Pros**: Lógica pronta e testada para quando Tarefas existir.
*   **Cons**: Nenhum caminho do app chega até ele nesta iteração. A máquina de estados e a tabela `focus_session` ficariam fixas antes do seletor de alvo e dos EC-0007 e EC-0008, e o esquema v1 é permanente.
*   **Reason for Rejection**: Rejected by author na revisão (E1): adiado para a mudança de Tarefas.

### Alternative H: Temporizador para recalcular à meia-noite com a tela aberta

*   **Pros**: A sequência fica certa mesmo com a Home aberta durante a virada do dia.
*   **Cons**: O RF-0015 não pede isso. Exigiria um método no relógio, testes com timers falsos e um critério novo no RF só para justificar o design.
*   **Reason for Rejection**: Rejected by author na revisão (E3): recalcular ao abrir e ao voltar do segundo plano basta.

### Alternative I: Duração padrão de 25 minutos, ou a última usada

*   **Pros**: 25 é o valor clássico do pomodoro, e "última usada" se adapta ao estudante.
*   **Cons**: 25 é uma sessão longa para quem está começando. "Última usada" exige guardar uma preferência, sem ganho enquanto nenhuma sessão começa.
*   **Reason for Rejection**: Rejected by author: 15 minutos, fixo (D12).

### Alternative J: Mock do `expo-sqlite`, lacuna aceita, ou `node:sqlite` nos testes

*   **Pros**: O mock e a lacuna não acrescentam dependência. O `node:sqlite` já vem no Node.
*   **Cons**: O mock só confere o texto do SQL, e a lacuna deixa a parte mais arriscada sem teste. O `node:sqlite` ainda é experimental no Node 22 usado no CI.
*   **Reason for Rejection**: Rejected by author: `better-sqlite3` atrás do `ISqlExecutor`, com transação em lote (D15).

### Alternative K: Atalho de Conquistas oculto, ou com rota provisória

*   **Pros**: Oculto não mostra controle morto. A rota provisória deixa a navegação pronta.
*   **Cons**: Oculto muda o layout quando o atalho entrar. A rota provisória cria uma rota em `src/app/` para algo fora de escopo.
*   **Reason for Rejection**: Rejected by author: o atalho aparece desabilitado com "em breve" (D16).

### Alternative L: Troca por plataforma dentro de `src/infra/`

*   **Pros**: Mantém a infraestrutura autocontida.
*   **Cons**: Cria um segundo ponto de composição, contra o ADR-0001 §5 e o ARCHITECTURE §6.1.
*   **Reason for Rejection**: Rejected na revisão: a troca fica em `src/DI/persistence(.web).ts`.

### Alternative M: Web com `expo-sqlite` (WASM) ou IndexedDB

*   **Pros**: Os dados sobreviveriam a recarregar a página.
*   **Cons**: Exige cabeçalhos COOP/COEP e configuração de bundler na web e no Storybook, e o alvo do produto é o Android.
*   **Reason for Rejection**: Rejected by author: na web, só memória (D8).

### Alternative N: Construir Tarefas e Rotinas mínimas, ou semear dados fictícios para teste manual

*   **Pros**: A tela mostraria dados reais.
*   **Cons**: Não há dados reais até existirem Tarefas e Rotinas. Construí-las agora antecipa as especificações delas, e dados semeados esconderiam os estados vazios reais.
*   **Reason for Rejection**: Rejected by author.

### Alternative O: Valor livre de duração, ou barra de progresso só do dia

*   **Pros**: Mais flexibilidade, e um sinal diário de progresso.
*   **Cons**: Contrariam o RF-0019 (valores pré-definidos) e o RN-0007 (total geral).
*   **Reason for Rejection**: Rejected by author.

### Alternative P: Evitar o reset da sequência (RF-0015 CA-05)

*   **Pros**: Evita uma mecânica que conflita com o `design-system/01-principios.md` (Princípio 1).
*   **Cons**: Muda uma regra de produto já decidida.
*   **Reason for Rejection**: Rejected by author: a constelação (tela Cosmos) é o contrapeso e não volta junto com a sequência (D6, RN-0003 atualizado nesta mudança).

## Risks & Mitigations

| Risco | Impacto | Mitigação |
| :--- | :--- | :--- |
| Integrar uma branch de outra pessoa do time, com 8 conflitos conhecidos e a colisão `src/di`/`src/DI` no Windows | Merge quebrado ou CI falhando no Linux | Shim de compilação, remoção de `src/di/` no commit de merge, tabela 0.2b e combinação prévia com quem escreveu o protótipo para que a branch não mude mais |
| Depender de três PRs em rascunho (D20) | O PR fica bloqueado ou é rebaseado se um rascunho mudar | Conferir na Etapa 0.1 se houve commits novos. O PR fica em rascunho até o merge dos três |
| Relógio do aparelho alterado, ou troca de fuso | Um dia contado em dobro ou pulado | Aceito (ADR-0001 §5). O `recorded_at` guarda o deslocamento do fuso para investigação |
| Comportamento do SQLite no aparelho diferente do `better-sqlite3` | Erro que só aparece no Android | Transação em lote, igual nos dois drivers (D15). Sem checagem no aparelho nesta iteração (E6): aceito |
| Backup automático do Android copiando o banco | Cópia dos dias de atividade | Aceito: não há dado pessoal sensível ([RNF-0007](../02-requirements/non-functional/RNF-0007.md)) |

Os demais riscos de persistência estão no [ADR-0001](../05-architecture/decisions/ADR-0001.md) §5.

## Non-Functional Requirements

*   **Privacidade:** os dados ficam só no aparelho, sem rede (RNF-0004 e RNF-0007).
*   **Desempenho:** no máximo uma linha por dia em `daily_activity`, cerca de 365 por ano. O cálculo da sequência lê todas, e esse custo não foi medido. O banco abre no primeiro uso, não na importação.
*   **Implantação e reversão:** o `expo-sqlite` é dependência nativa e exige um novo build, que o autor faz quando quiser (E7). O esquema v1 é permanente depois de publicado. Para reverter, volta-se o código, e o banco fica intacto (D14).
*   **Acessibilidade:** a orientação do foco aparece como texto visível e como `accessibilityHint`. O progresso aparece como texto, além da barra. O painel tem um botão alternativo ao gesto ([RNF-0003](../02-requirements/non-functional/RNF-0003.md), `design-system/06-acessibilidade.md`).

## Additional Resources

*   [ADR-0001](../05-architecture/decisions/ADR-0001.md); [RF-0011](../02-requirements/functional/RF-0011.md), [RF-0014](../02-requirements/functional/RF-0014.md), [RF-0015](../02-requirements/functional/RF-0015.md), [RF-0016](../02-requirements/functional/RF-0016.md), [RF-0019](../02-requirements/functional/RF-0019.md); [RN-0001](../02-requirements/business-rules/RN-0001.md), [RN-0002](../02-requirements/business-rules/RN-0002.md), [RN-0003](../02-requirements/business-rules/RN-0003.md), [RN-0006](../02-requirements/business-rules/RN-0006.md), [RN-0007](../02-requirements/business-rules/RN-0007.md); [EC-0001](../04-specifications/edge-cases/EC-0001-inicio-modo-foco-sem-tarefa-ou-rotina.md), [EC-0003](../04-specifications/edge-cases/EC-0003-conclusao-parcial-entre-rotina-e-tarefa-avulsa.md), [EC-0004](../04-specifications/edge-cases/EC-0004-multiplas-conclusoes-no-mesmo-dia.md); [UC-0009](../04-specifications/use-cases/UC-0009-consultar-tela-inicial.md), [UC-0011](../04-specifications/use-cases/UC-0011-atualizar-sequencia-estudos.md); [FL-0009](../04-specifications/flows/FL-0009.md), [FL-0011](../04-specifications/flows/FL-0011.md).
*   [ARCHITECTURE.md](../../ARCHITECTURE.md) §2, §3, §5 e §6; [RULES.md](../../RULES.md); [guia de testes](../06-quality/guia-testes.md) §3, §4.3 e §6; [01-principios.md](../../design-system/01-principios.md); [02-tokens.md](../../design-system/02-tokens.md).
*   Branch `origin/feat/tela-principal-prototipo` (`54a5d90`) e PRs em rascunho #113, #119 e #121.
*   Relatórios da revisão EGM em `.dev/egm/`, fora do Git.

## Future Improvements

*   **Mudança de Tarefas e Rotinas:**
    *   trocar o `EmptyActivityCatalog` por uma implementação real;
    *   chamar `recordActivity`;
    *   desenhar o seletor de alvo e o motor do foco (o G9 e as decisões D5, D10, D11 e D19, retiradas);
    *   resolver o EC-0007, o EC-0008 e os pontos pendentes do RN-0007;
    *   criar a migração v2.
*   **Constelação e Conquistas:** consomem o mesmo registro diário. Métricas que nunca diminuem (total de dias ativos, melhor sequência) podem vir do mesmo log.
*   **PR de manutenção:**
    *   corrigir o `defaultContainer`, usado sem definição no ARCHITECTURE §4.2;
    *   rodar o `/egm:egm-bootstrap` para atualizar os READMEs de contrato por pasta;
    *   renomear para PascalCase os componentes kebab-case de `src/view/` (`primary-button.tsx`, `nav-bar.tsx`, `card-tarefa.tsx`, `filter-chips.tsx`, `material-symbol.tsx`, `src/view/theme/use-reduce-motion.ts`).

--------------------------------------------------------------------------------

## Detailed Implementation Plan

**Regra de cada etapa:** todo commit passa nos hooks, sem `--no-verify` ([AGENTS.md](../../AGENTS.md) §2). Ao fim de cada etapa rodam `npm run lint`, `npx --no-install tsc --noEmit`, `npm test`, `npm run build-storybook` e `node tests/ods-theme.test.cjs`. As mensagens de commit seguem `<prefixo>(<escopo>): <descrição em pt-br>` (CONTRIBUTING §1.1).

**Rótulos:** **Create**, **Modify**, **Delete** e **Rename** (`git mv <origem> <destino>`, depois Modify). Os passos condicionais trazem a condição verificável entre parênteses.

### Etapa 0 — Branch e integração

*   **0.1 Atualizar a integração e criar a branch.**
    *   `git switch chore/integracao-tela-inicial && git pull --ff-only`, depois `git fetch origin`.
    *   Para cada branch, nesta ordem: `docs/atualiza-ods-1-2-0` (#113), `chore/assinatura-builds-android` (#119), `chore/build-eas-sob-demanda` (#121) e `feat/tela-principal-prototipo` (protótipo). Se `git log chore/integracao-tela-inicial..origin/<branch>` não sair vazio, rodar `git merge --no-ff origin/<branch>` na integração.
    *   `git switch -c feat/tela-inicial-base`.
*   **0.2 Merge do protótipo.**
    *   `git merge --no-ff origin/feat/tela-principal-prototipo` e resolver os 8 conflitos pelas regras do Technical Plan §1.
    *   No mesmo commit: `git rm src/di/home-factory.ts`, o shim `src/view/theme/prototype-tokens-shim.ts` (`cosmicTokens` montado a partir de `themes.cosmic`) e as correções mínimas de import para compilar.
    *   Conferir que `git ls-files src/di` sai vazio e que `grep -rn "@/di/" src` não acha nada.
    *   O corpo do commit traz uma linha por arquivo em conflito, com a versão mantida e o motivo.
*   **0.2a Tabela de tokens (parada para aprovação).**
    *   Listar cada chave do `cosmicTokens` do protótipo e associar a um token do ODS 1.2.0 com valor **idêntico**. Se não houver, escrever "novo: grupo/nome/valor".
    *   Salvar a lista como `.dev/egm/tokens-mapping.md` e **parar até o autor aprovar**.
    *   Os tokens novos aprovados entram primeiro em `design-system/02-tokens.md` e depois em `src/view/theme/tokens.ts`, cada um com uma asserção de contraste em `tests/ods-theme.test.cjs`.
    *   O `07-home-cosmica.md` do protótipo vira `design-system/08-home-cosmica.md` (**Rename**), porque o `07-teste-com-ia.md` já existe, e é registrado no índice do `design-system/README.md`.
*   **0.2b Tabela de arquivos do protótipo.** Rodar `git diff --name-status 73230cc origin/feat/tela-principal-prototipo` e anotar no PR cada caminho com: mantém, Rename para X ou Delete na Etapa N. Arquivos do protótipo que não aparecem nas Etapas 2 a 7 recebem uma ação aqui.

### Etapa 1 — Dependências e configuração

*   **`package.json` e `package-lock.json` (Modify):**
    *   `npx expo install expo-sqlite`, fixando no `package.json` a versão exata resolvida;
    *   `npm install -D --save-exact better-sqlite3 @types/better-sqlite3`, numa versão com binário pronto para linux-x64 e win32-x64 no Node 22;
    *   regenerar o lockfile com o npm do Node 22. O motivo é o commit `aac51ad`: um lockfile gerado com outro npm quebrou o `npm ci`.
*   **`app.json` (Modify, condicional: o `expo install` acrescentou `"expo-sqlite"` em `plugins`):** aceitar a alteração.
*   **`eslint.config.js` (Modify):** um bloco de flat config com `files: ["src/**"]`, `ignores: ["src/infra/database/expo-sql-executor.ts"]` e `no-restricted-imports` para `expo-sqlite` e `better-sqlite3`.
*   **`jest.config.js` (Modify):** acrescentar `globalSetup: '<rootDir>/tests/setup/timezone.cjs'`.
*   **`tests/setup/timezone.cjs` (Create):** `process.env.TZ = 'America/Sao_Paulo'`, para os testes de data rodarem fora de UTC.
*   **`.github/workflows/ci.yml` (Modify, condicional: o `npm ci` falha ao instalar `better-sqlite3`):**
    *   antes do `npm ci`, adicionar `sudo apt-get install -y build-essential python3`;
    *   adicionar um passo `node tests/ods-theme.test.cjs` depois de `npm test`, sem condição.

### Etapa 2 — Domínio (`src/model/`)

**Assinaturas:**

```ts
// entities/local-date.ts
export class LocalDate {
  static parse(value: string): LocalDate;          // ValidationError se não for AAAA-MM-DD válido
  toString(): string;                              // "AAAA-MM-DD"
  addDays(n: number): LocalDate;                   // aritmética de calendário
  equals(other: LocalDate): boolean;
  compare(other: LocalDate): -1 | 0 | 1;
}
// entities/streak.ts
export type StreakSnapshot = { currentDays: number; lastActiveDate: LocalDate | null; asOf: LocalDate };
export function calculateStreak(days: readonly LocalDate[], today: LocalDate): StreakSnapshot;
// entities/progress.ts
export type Progress = { completed: number; total: number; ratio: number | null };
export function createProgress(completed: number, total: number): Progress; // ValidationError se negativo ou completed > total
// errors/domain-error.ts
export type DomainErrorCode = 'VALIDATION_ERROR' | 'PERSISTENCE_FAILURE' | 'SCHEMA_VERSION_UNSUPPORTED';
export class DomainError extends Error { constructor(code: DomainErrorCode, message?: string); readonly retryable: boolean }
export class ValidationError extends DomainError {}
// repositories
export interface IDailyActivityRepository { recordDay(date: LocalDate, recordedAt: string): Promise<void>; listDays(): Promise<LocalDate[]> }
export interface IActivityCatalog { getProgressCounts(): Promise<{ completed: number; total: number }>; hasFocusTargets(): Promise<boolean> }
// services
export interface IClockService { now(): string; todayLocal(): LocalDate }
```

O `retryable` de `DomainError` é `true` só para `PERSISTENCE_FAILURE`.

**Arquivos:**
*   **Create:** `src/model/entities/local-date.ts`, `streak.ts`, `progress.ts`, `activity-source.ts`, `focus-duration.ts` e `home-summary.ts`; `src/model/errors/domain-error.ts`; `src/model/repositories/i-daily-activity-repository.ts` e `i-activity-catalog.ts`; `src/model/services/i-clock-service.ts`.
*   **Testes (Create):**
    *   `local-date.test.ts`: virada de mês, de ano e ano bissexto com `addDays`, e `parse` inválido.
    *   `progress.test.ts`: `createProgress(0, 0)` → `{ completed: 0, total: 0, ratio: null }`; `(3, 30)` → `ratio: 0.1`; `(-1, 0)` e `(4, 3)` → `ValidationError`.
    *   `streak.test.ts`: a tabela-verdade, com hoje = D e um teste por linha:

        | Entrada | Resultado | Critério |
        | :--- | :--- | :--- |
        | nenhum dia | 0 | — |
        | D | 1 | CA-01 |
        | D, D−1 | 2 | CA-02 |
        | D, D, D−1 (repetidos) | 2 | CA-03 |
        | D−1 | 1 | CA-04 |
        | D−2 como mais recente | 0 | CA-05 |
        | D, D−2 | 1 | CA-07 |
        | D, D−1, D−3 | 2 | — |
        | D+1, D | 1 | D17 (futuro ignorado) |
*   **Delete:** `src/model/entities/home-dashboard.ts` e `src/model/repositories/i-home-repository.ts` (protótipo), mais os `.gitkeep` de `src/model/`, `src/model/entities/`, `errors/`, `repositories/` e `services/`.

### Etapa 3 — Infraestrutura (`src/infra/`)

**Assinaturas:**

```ts
// database/i-sql-executor.ts
export type SqlStatement = { sql: string; params?: readonly unknown[] };
export interface ISqlExecutor {
  all<T>(sql: string, params?: readonly unknown[]): Promise<T[]>;
  run(sql: string, params?: readonly unknown[]): Promise<void>;
  runInTransaction(statements: readonly SqlStatement[]): Promise<void>; // BEGIN … COMMIT; ROLLBACK se falhar
}
// database/migrations.ts
export type Migration = { version: number; statements: readonly SqlStatement[] };
export const MIGRATIONS: readonly Migration[]; // v1: CREATE TABLE daily_activity (Technical Plan §5)
// database/database-provider.ts
export class DatabaseProvider {
  constructor(openExecutor: () => Promise<ISqlExecutor>, migrations?: readonly Migration[]);
  get(): Promise<ISqlExecutor>;
}
```

O `DatabaseProvider` aplica cada migração com `runInTransaction`, e o último comando do lote é `PRAGMA user_version = <versão>`.

**Arquivos (Create):**
*   `src/infra/database/i-sql-executor.ts`, `migrations.ts` e `database-provider.ts`.
*   `src/infra/database/expo-sql-executor.ts`: único arquivo que importa `expo-sqlite`, com import estático.
*   `src/infra/database/database-provider.test.ts`, com o `BetterSqliteExecutor` em `:memory:`:
    *   banco novo → `user_version = 1`;
    *   chamar `get()` duas vezes → as migrações rodam uma vez só;
    *   `user_version = 99` → `SCHEMA_VERSION_UNSUPPORTED`, sem alterar as tabelas;
    *   migração com o segundo comando inválido → `ROLLBACK`, e a tabela não existe;
    *   a primeira abertura falha, a segunda funciona → `get()` resolve na segunda chamada;
    *   duas chamadas simultâneas → uma só abertura.
*   `src/infra/repositories/sqlite-daily-activity-repository.ts`: `constructor(provider: DatabaseProvider)`, usando `INSERT OR IGNORE`.
*   `src/infra/repositories/in-memory-daily-activity-repository.ts`.
*   `src/infra/repositories/daily-activity-repository.contract.ts`: `describeDailyActivityRepositoryContract(name, factory)`. Casos:
    *   o mesmo dia duas vezes → um dia só;
    *   ordem decrescente;
    *   lista vazia;
    *   para SQLite: fechar e reabrir o banco no mesmo arquivo temporário → os dias continuam (G3).
*   `src/infra/repositories/sqlite-daily-activity-repository.test.ts` e `in-memory-daily-activity-repository.test.ts`: cada um roda o contrato.
*   `src/infra/repositories/empty-activity-catalog.ts`.
*   `src/infra/services/system-clock-service.ts` e `system-clock-service.test.ts` (fuso `America/Sao_Paulo` pela Etapa 1):
    *   `new Date(2026, 10, 14, 23, 59)` → `todayLocal()` = `2026-11-14`;
    *   `new Date(2026, 10, 15, 0, 1)` → `2026-11-15`;
    *   `new Date(2026, 10, 14, 22, 0)` → `2026-11-14`, embora o instante em UTC já seja dia 15;
    *   `now()` termina em `-03:00`.
*   `tests/fixtures/better-sqlite-executor.ts`: o `ISqlExecutor` de teste com `better-sqlite3`, fora de `src/` ([guia de testes](../06-quality/guia-testes.md) §3).

**Delete:** `src/infra/repositories/in-memory-home-repository.ts` (protótipo) e os `.gitkeep` de `src/infra/repositories/` e `src/infra/services/`.

### Etapa 4 — Casos de uso (`src/usecase/`)

**Construtores:**
*   `new StreakUseCases(dailyActivity: IDailyActivityRepository, clock: IClockService)`;
*   `new HomeUseCases(dailyActivity: IDailyActivityRepository, activityCatalog: IActivityCatalog, clock: IClockService)`.

**Arquivos:**
*   **Create:** `src/usecase/i-streak-use-cases.ts` e `streak-use-cases.ts`.
*   **Rename e Modify:** `src/usecase/i-home-use-cases.ts` e `home-use-cases.ts`, do protótipo, reescritos para `loadHome(): Promise<HomeSummary>`.
*   **`streak-use-cases.test.ts` (Create):**
    *   três `recordActivity` no mesmo dia → `listDays()` com um dia, e `getStreak().currentDays` = 1;
    *   `source.id` vazio → `ValidationError`;
    *   dia registrado às 23h59 de D, relógio falso avança para 00h01 de D+1 → `getStreak().currentDays` = 1;
    *   avança para D+2 → 0.
*   **`home-use-cases.test.ts` (Create):**
    *   catálogo vazio → `progress` `{ completed: 0, total: 0, ratio: null }`, `focus.canStart = false`, `reason = 'no-targets'`, `defaultDuration = 15` e `streak.currentDays = 0`;
    *   catálogo falso com `{ completed: 3, total: 30 }` → `ratio: 0.1`;
    *   repositório que rejeita com `PERSISTENCE_FAILURE` → `loadHome()` rejeita com o mesmo `DomainError`.
*   **Delete:** `src/usecase/.gitkeep`.

### Etapa 5 — Composição (`src/DI/`)

*   **`src/DI/container.ts` (Modify):** os tipos `AppRepositories { dailyActivity; activityCatalog }`, `AppServices { clock }` e `AppUseCases { streak; home }`. O `appContainerDefinition` usa `createPersistence()` de `./persistence`, `EmptyActivityCatalog` e `SystemClockService`. A API pública não muda.
*   **`src/DI/persistence.ts` (Create):** `createPersistence(): { dailyActivity: IDailyActivityRepository }`, com `DatabaseProvider(() => ExpoSqlExecutor.open('orbity.db'))`.
*   **`src/DI/persistence.web.ts` (Create):** a mesma assinatura, com `InMemoryDailyActivityRepository`.
*   **`src/DI/container.test.ts` (Create):**
    *   com `jest.isolateModules` e `jest.spyOn(DatabaseProvider.prototype, 'get')` antes de `require('@/DI/container')`, importar o módulo não abre o banco (0 chamadas);
    *   `container.useCases.streak` usa o `dailyActivity` em memória passado em `overrides`;
    *   o container está congelado.
*   **`src/DI/persistence.web.test.ts` (Create):** `createPersistence()` devolve um `InMemoryDailyActivityRepository`.

### Etapa 6 — ViewModel (`src/viewmodel/`)

*   **`src/viewmodel/HomeViewModel.ts` (Rename de `use-home-view-model.ts`, depois Modify):** o estado e as ações do Technical Plan §7. Mapeia `DomainError.code` para as chaves `error.persistence` e `error.schema`. Remove do protótipo:
    *   `activeTab` e `handleSelectTab`;
    *   `selectedAchievement`;
    *   `isFocusMode`, `focusStartedAt`, `elapsedSeconds` e `focusTimerLabel`;
    *   `handleToggleFocusMode`;
    *   o import de `PROTOTYPE_HOME_DASHBOARD` e de `NavTabId`.
*   **`src/viewmodel/HomeViewModel.test.ts` (Create):** `renderHook` do RNTL, com um `IHomeUseCases` falso:
    *   `loading` → `ready`;
    *   rejeição com `PERSISTENCE_FAILURE` → `status: 'error'`, `retryable: true` e `summary: null`;
    *   `retry()` com sucesso → `ready`;
    *   rejeição com `SCHEMA_VERSION_UNSUPPORTED` → `retryable: false`;
    *   `progressLabel` = `"0/0"`;
    *   `jest.spyOn(AppState, 'addEventListener')` e disparar `'active'` → `loadHome` chamado de novo, sem o status passar por `loading` (RF-0015 CA-06 e D17);
    *   erro num recálculo depois de `ready` → `summary` continua com o valor anterior;
    *   `jest.restoreAllMocks()` no `afterEach`.
*   **`src/viewmodel/ActivitySheetGeometry.ts` (Rename de `activity-sheet-geometry.ts`, depois Modify):** recebe um `SheetGeometryConfig { sceneHeight; expandedTop; collapsedHeight }` por parâmetro e passa a declarar o `FocusSheetStage`.
*   **`src/viewmodel/ActivitySheetGeometry.test.ts` (Create):** os pontos de parada para três alturas de cena, mais a decisão de soltar acima e abaixo da metade.
*   **`src/viewmodel/ActivitySheetMotionViewModel.ts` (Rename de `use-activity-sheet-motion.ts`, depois Modify):** exporta `useActivitySheetMotionViewModel({ stage, geometry, reduceMotion, onStageChange })`, sem importar `view/`.
*   **Delete:** `src/viewmodel/use-reduced-motion.ts` (protótipo) e `src/viewmodel/.gitkeep`.

### Etapa 7 — View, textos e rotas

**Textos da interface (aprovados pelo autor, D22).** Ficam em `src/view/home-copy.ts`, junto com `PUNITIVE_TERMS = ['zerou', 'perdeu', 'falhou', 'fracasso', 'quebrou']`.

| Chave | Texto | Uso |
| :--- | :--- | :--- |
| `streak.empty` | "Sua jornada começa com a primeira atividade concluída." | Visualizador com 0 dias |
| `error.persistence` | "Não conseguimos carregar seus dados agora." | Erro passível de nova tentativa |
| `error.retry` | "Tentar de novo" | Botão do erro passível de nova tentativa |
| `error.schema` | "Atualize o Orbity para ver seus dados." | Erro sem nova tentativa (sem botão) |
| `focus.blocked` | "Para iniciar o foco, crie uma tarefa ou rotina primeiro." | Texto de apoio e `accessibilityHint` do botão Iniciar |
| `focus.duration` | "{n} minutos" | Rótulo de cada duração |
| `achievements.soon` | "Conquistas — em breve" | Atalho desabilitado; rótulo acessível "Conquistas, disponível em breve" |
| `sheet.open` / `sheet.close` | "Abrir painel" / "Fechar painel" | Botão alternativo ao gesto (`accessibilityRole="button"`) |

**Arquivos:**
*   **`src/view/home-copy.ts` (Create):** a tabela acima e o `PUNITIVE_TERMS`.
*   **`src/view/home-copy.test.ts` (Create):** nenhum texto contém um termo de `PUNITIVE_TERMS`, sem diferenciar maiúsculas e minúsculas.
*   **`src/view/HomeScreen.tsx` (Modify):** o `default` só chama `useHomeViewModel()` e `useReduceMotion()` e renderiza o `HomeScreenContent`.
*   **`src/view/HomeScreenContent.tsx` (Rename de `src/view/home-screen.tsx`, depois Modify):** a tela do protótipo, só de apresentação, com estado e ações por props. Não tem `NavBar` própria, `makeHomeUseCases` nem `HomeDialog`. O `showPreviewChrome` fica desligado por padrão.
*   **`src/view/HomeScreenContent.test.tsx` (Create):**
    *   estado vazio → texto "0", `streak.empty`, `0/0`, Iniciar com `accessibilityState.disabled`, `focus.blocked` visível e como `accessibilityHint`, e `achievements.soon`;
    *   estado de erro passível → `error.persistence` e o botão `error.retry`, sem o valor da sequência nem "0";
    *   estado de erro do esquema → `error.schema`, sem botão;
    *   botão do painel → alterna entre `sheet.open` e `sheet.close`;
    *   o texto renderizado não contém termos de `PUNITIVE_TERMS`.
*   **`src/view/HomeScreenContent.stories.tsx` (Rename de `home-screen.stories.tsx`, depois Modify):** histórias "vazio", "com sequência (12 dias, 3/30)", "erro" e "erro de esquema", montadas com props fixas e sem importar `@/DI`.
*   **`src/view/components/FocusBottomSheet.tsx` (Rename de `focus-bottom-sheet.tsx`, depois Modify):** as props passam a ser `progressLabel`, `progressRatio`, `focus: FocusAvailability`, `selectedDuration`, `onSelectDuration`, `stage` e as ações do painel. Saem `DailyFocusProgress`, `achievements`, `onToggleFocus`, `onSelectAchievement` e `lastSessionLabel`.
*   **`src/view/components/FocusBottomSheet.test.tsx` (Create):**
    *   seis durações, com 15 marcado (`accessibilityState.checked`);
    *   `onSelectDuration(20)` ao tocar em "20 minutos";
    *   `progressRatio = null` → sem porcentagem no texto;
    *   o Conquistas sem `onPress` de navegação.
*   **`src/view/components/PlanetStreakView.tsx`, `PlanetStreakView.stories.tsx`, `PlanetIllustration.tsx`, `CosmicIcon.tsx`, `CosmicStarfield.tsx` e `GradientSurface.tsx` (Rename dos arquivos kebab-case do protótipo, depois Modify):** os tokens são migrados para o ODS 1.2.0 pela tabela aprovada na 0.2a, sem valores literais. O `PlanetStreakView` recebe só `days`.
*   **Delete:**
    *   `src/view/components/home-dialog.tsx` (D16);
    *   `src/view/theme/prototype-tokens-shim.ts`, depois que `grep -rn "prototype-tokens-shim" src` não achar nada;
    *   `src/app/home-screen.tsx` (rota duplicada).
*   **`src/view/components/material-symbol.tsx` (Modify, condicional: o merge trouxe ícones usados pela Home):** manter os ícones novos.
*   **`src/app/index.tsx` e `src/app/_layout.tsx`:** ficam como na `development`, conforme a resolução da 0.2.

### Etapa 8 — Documentação

*   **`docs/05-architecture/decisions/ADR-0001.md` (Modify):**
    *   status `Accepted` (2026-11-14);
    *   nomes `IDailyActivityRepository`, com prefixo `I`, e arquivos kebab-case;
    *   esquema v1 só com `daily_activity`;
    *   `ISqlExecutor` com transação em lote e `better-sqlite3` nos testes (D15);
    *   troca por plataforma em `src/DI/persistence(.web).ts` (D8);
    *   o motor do foco e a sessão saem do contexto.
*   **`docs/05-architecture/decisions/README.md` (Modify):** o status do ADR-0001 passa a `Accepted`.
*   **`docs/02-requirements/business-rules/RN-0003.md` (Modify):** o CA-02 passa a ser "o progresso da constelação acompanha cada incremento da sequência e não volta quando a sequência zera" (D6).
*   **`docs/04-specifications/edge-cases/EC-0003-conclusao-parcial-entre-rotina-e-tarefa-avulsa.md` (Modify):** a linha `> **Status:** Superseded por [RN-0002](../../02-requirements/business-rules/RN-0002.md) (D1), 2026-11-14.`, logo abaixo do título.
*   **`docs/04-specifications/edge-cases/README.md` (Modify):** o sufixo "(Superseded)" na linha do EC-0003.
*   **`docs/04-specifications/edge-cases/EC-0004-multiplas-conclusoes-no-mesmo-dia.md` (Modify):** reescrever as frases que falam em "contador incrementado" para "o dia fica registrado uma vez; a sequência é recalculada na leitura (RF-0014 e RF-0015)", mantendo os critérios.
*   **`docs/02-requirements/functional/RF-0015.md` (Modify):** um critério novo, CA-09: "A sequência deve ser recalculada quando o aplicativo volta do segundo plano, e registros com data posterior à data local atual não devem ser contabilizados (D17)." Não há critério sobre meia-noite (E3).
*   **`docs/02-requirements/functional/RF-0019.md` (Modify):** o ponto pendente vira o CA-05: "A duração selecionada por padrão deve ser de 15 minutos (D12)."
*   **`docs/04-specifications/use-cases/UC-0011-atualizar-sequencia-estudos.md` e `docs/04-specifications/flows/FL-0011.md` (Modify):** "incrementa o contador" vira "registra o dia; a sequência é recalculada na leitura", com links para o RF-0014 e o RF-0015. Fica anotado que a parte de constelação e conquistas não é entregue nesta mudança.
*   **`ARCHITECTURE.md` (Modify):** a árvore do §3 ganha `infra/database/` e os arquivos `DI/persistence(.web).ts`.
*   **`design-system/README.md` (Modify):** o índice registra o `08-home-cosmica.md` (Etapa 0.2a).

### Verification Plan

*   **Checagem de tipos:** `npx --no-install tsc --noEmit`.
*   **Lint:** `npm run lint`, com as regras novas de importação proibida.
*   **Testes:** `npm test`. Inclui as suítes de contrato, que executam o SQL real no `better-sqlite3`, a tabela-verdade do RF-0015, a ViewModel e a tela.
*   **Contraste dos tokens:** `node tests/ods-theme.test.cjs`.
*   **Storybook:** `npm run build-storybook`, que também mostra que o bundle web usa o `persistence.web.ts`.
*   **Cobertura por requisito:** cada teste ligado a um critério traz o ID no nome, por exemplo `RF-0015 CA-05: …`.
*   **Build e checagem no aparelho:** não fazem parte desta mudança (E6, E7).
*   **Hooks:** não se aplica. `.husky/`, `scripts/` e `commitlint.config.cjs` não mudam.
*   **PR:** aberto como rascunho contra a `development` (D20).

--------------------------------------------------------------------------------

*Drafted with EGM*
