# Orbity — Agent Harness

Você está operando no repositório do **Orbity** (aplicativo mobile para organização e hábitos de estudo, construído com **React Native 0.86 + Expo 57 + Expo Router + TypeScript**).

Este arquivo é o seu **roteador operacional**. Mantenha o contexto limpo e **não adivinhe convenções**: sempre que uma tarefa envolver um dos gatilhos abaixo, leia o documento indicado antes de agir.

---

## 1. Roteamento Obrigatório por Gatilho (Read-Before-Act)

| Quando a tarefa, operador ou skill exigir... | Leia obrigatoriamente antes de agir |
| :--- | :--- |
| **Criar/trocar branch ou iniciar atividade** | `CONTRIBUTING.md` (Seções 1.2 e 2.2) e `scripts/conventions.cjs` |
| **Fazer commit (manual ou via skill)** | `CONTRIBUTING.md` (Seções 1.1 e 2.3) e `commitlint.config.cjs` |
| **Abrir ou atualizar Pull Request (dev)** | `CONTRIBUTING.md` (Seções 1.4 e 2.5) e `.github/PULL_REQUEST_TEMPLATE/development.md` |
| **Preparar Release / PR para `main`** | `CONTRIBUTING.md` (Seções 1.5 e 4) e `.github/PULL_REQUEST_TEMPLATE/release.md` |
| **Criar ou refinar Issues** | `CONTRIBUTING.md` (Seção 1.3) e `.github/ISSUE_TEMPLATE/` |
| **Encontrar bug, inconsistência ou outro desvio durante a tarefa** | `CONTRIBUTING.md` (Seção 2.6) e a Seção 3 deste arquivo ("Desvios encontrados durante a tarefa") |
| **Criar/alterar arquitetura, camadas, rotas ou estado** | `ARCHITECTURE.md` |
| **Escrever ou refatorar código TS/React Native** | `RULES.md` |
| **Criar/editar telas, UI, estilos ou componentes** | `design-system/README.md` (Seção 9), `01-principios.md`, `02-tokens.md`, `03-fundamentos.md`, `04-componentes/`, `05-padroes.md` e `06-acessibilidade.md` |
| **Criar testes ou validar qualidade/CI/hooks** | `CONTRIBUTING.md` (Seções 2.4 e 3), `docs/06-quality/guia-testes.md`, `.github/workflows/ci.yml` e `scripts/verify-local-hooks.mjs` |
| **Escrever, revisar ou implementar um design técnico (skills `/egm:*`)** | `docs/designs/README.md` e o design da funcionalidade em `docs/designs/` |
| **Configurar identidade, build, assinatura ou distribuição Android** | `CONTRIBUTING.md` (Seção 4), `docs/08-distribution/README.md`, `docs/08-distribution/identidade-e-propriedade.md` e `docs/08-distribution/versionamento-do-app.md` |

---

## 2. Regras Rápidas de Git e Contribuição (Resumo Operacional)

- **Branch base:** Toda branch de trabalho deve partir de `development` atualizada (`git switch development && git pull --ff-only origin development`), com exceção de correções urgentes pós-release (hotfixes), que partem da `main` conforme `CONTRIBUTING.md` (Seção 4.8). Nunca faça alterações diretas em `main` ou `development`.
- **Formato de branch:** `<prefixo>/<descricao-curta>` com letras minúsculas, números e hífens, sem acentos (`^(feat|fix|docs|refactor|test|chore)/[a-z][a-z0-9]*(?:-[a-z0-9]+)*$`).
- **Formato de commit:** `<prefixo>(<escopo>): <descricao curta em pt-br>` — escopo obrigatório, inicial da descrição minúscula, sem ponto final.
- **Proteção de hooks:** Nunca utilize `--no-verify` em commits ou pushes, nem defina `HUSKY=0` localmente para contornar falhas de lint, commitlint ou validação de branch.

---

## 3. Guardrails de Código, Arquitetura, Idioma e Design System

- **Idioma:**
  - **Português Brasileiro (`pt-BR`):** comunicação com o operador, documentação, mensagens de commit, títulos/corpos de Issues e Pull Requests.
  - **Inglês (`en`):** identificadores de código em `src/` (nomes de arquivos, variáveis, funções, componentes, hooks, tipos e interfaces).
- **Bloqueio em lacunas e contradições:** Se a seção necessária para a decisão atual estiver vazia, contiver só um placeholder ou `TODO`, ou se dois documentos do harness (ou o harness e o código) se contradisserem nesse ponto, **não invente padrões nem escolha uma versão por conta própria** — pare e pergunte ao operador (desvio classe D, `CONTRIBUTING.md` Seção 2.6).
- **Desvios encontrados durante a tarefa** (resumo da `CONTRIBUTING.md` Seção 2.6). Antes de classificar, confirme se o problema já existia na `development` sem as suas alterações e procure Issues duplicadas.
  - **A. No escopo:** corrija na mesma branch, em commit próprio, e cite no PR.
  - **B. Fora do escopo, não bloqueante:** não corrija; **crie a Issue automaticamente** (template do tipo, label `deviation`, campo **Origem**) e continue a tarefa.
  - **C. Bloqueante:** **pare, crie a Issue** `[FIX]` (labels `deviation` e `blocker`, campos **Origem** e **Atividade bloqueada**), comente na Issue da tarefa bloqueada e **avise o operador** com a evidência e o link. Aguarde a decisão; o padrão é corrigir numa branch `fix/…` própria antes de retomar. Nunca contorne o bloqueio (desabilitar teste, `--no-verify`, `HUSKY=0`, relaxar lint ou CI).
  - **D. Inconsistência no harness:** crie uma Issue `[DOCS]` ou `[CHORE]` com a label `deviation`. Se a contradição estiver no ponto da decisão atual, ela é bloqueante: não escolha uma versão, trate como a classe C (label `blocker`) e avise o operador. Caso contrário, continue.
  - **Issues:** não peça confirmação para criá-las; procure duplicatas antes. Liste todos os desvios no relatório final e na seção **Desvios encontrados** do PR.
  - **PRs:** o operador em nome de quem você atua é o responsável (*assignee*) do PR (`CONTRIBUTING.md` Seção 1.4).
- **Fonte de verdade visual:** Nunca utilize valores literais (*hardcoded*) de cor, espaçamento, tipografia ou raio. Utilize exclusivamente os tokens definidos em `design-system/02-tokens.md`.
- **Princípios de produto:** Preserve a personalização do estudante, garanta acessibilidade (contraste ≥ 4,5:1, múltiplos indicadores perceptíveis além de cor) e nunca introduza mecânicas ou mensagens punitivas (`design-system/01-principios.md`).
- **Estrutura de diretórios:** Respeite a divisão `src/app/` (módulos de rota Expo Router em `kebab-case.tsx` que importam e re-exportam como `default` os componentes de tela da `view`), `src/view/` (componentes de tela em `kebab-case.tsx` com o mesmo nome do módulo de rota em `src/app/`, exportados como `default`; componentes reutilizáveis em `src/view/components/` em `PascalCase.tsx`, exportados de forma nomeada; além de `theme/`), `src/viewmodel/` (arquivos em `camelCase.ts` com o mesmo nome do hook de apresentação/estado que exportam, no formato `useNomeViewModel.ts`), `src/usecase/` (contratos e implementações de casos de uso), `src/model/` (domínio puro: `entities/`, `errors.ts`, `datasources/` e `services/`), `src/infra/` (implementações concretas: `datasources/` e `services/`) e `src/di/` (composição e injeção de dependências), com os arquivos dessas quatro camadas em `camelCase.ts` e prefixo `i` nos que contêm só uma interface (ex.: `iTaskUseCases.ts`, `taskUseCases.ts`), conforme `ARCHITECTURE.md` e as convenções em `RULES.md`.
- **Segurança:** Nunca inclua segredos, tokens, chaves de API ou credenciais no código ou nos commits.

---

## 4. Designs Técnicos (EGM, opcional)

EGM artifact directory: .dev/egm

O Elephant-Goldfish Model (EGM) é **opcional**: nem toda atividade tem design técnico. As regras abaixo valem só quando a atividade usa o EGM.

- **Design final:** `docs/designs/<funcionalidade>.md`, um por funcionalidade, registrado no índice `docs/designs/README.md`. É o único artefato EGM versionado.
- **Artefatos de trabalho** (`concepts_brief.md`, `design_draft.md`, relatórios de revisão e de drift): ficam em `.dev/egm/`, fora do Git. A pasta comporta uma tarefa por vez. Limpe-a antes de iniciar outra.
- Antes de implementar uma funcionalidade com design EGM, o design deve estar em `docs/designs/` e ter passado por `/egm:egm-review`.
- Se a implementação precisar divergir do design, atualize o design no mesmo PR (`CONTRIBUTING.md` Seção 2.6).

## 5. Checklist de Validação Local (Antes de Concluir ou Commitar)

Sempre que modificar código, tipos ou configurações, execute:

1. `npm run lint` — verificação do ESLint.
2. `npx --no-install tsc --noEmit` — verificação estrita de tipos TypeScript.
3. `npm test` — execução não interativa dos testes automatizados (Jest).
4. `npm run build-storybook` — obrigatório caso altere telas, componentes ou histórias (o CI falha com uma história quebrada).
5. `node tests/ods-theme.test.cjs` — obrigatório caso altere `src/view/theme/tokens.ts` (não é coletado pelo Jest).
6. `npm run lint:architecture` — não introduza violações além das já registradas em Issues abertas.
7. `node scripts/verify-local-hooks.mjs` — obrigatório caso altere `.husky/`, `scripts/` ou `commitlint.config.cjs`.
