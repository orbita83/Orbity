# Orbity — Agent Harness

Você está operando no repositório do **Orbity** (aplicativo mobile/web para organização e hábitos de estudo, construído com **React Native 0.86 + Expo 57 + Expo Router + TypeScript**).

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
- **Bloqueio em Placeholders e `TODO`s:** Se um documento consultado contiver apenas um placeholder (`@ARCHITECTURE`, `@RULES`, `@README`) ou `TODO` na seção necessária para a decisão atual, **não invente padrões ou arquiteturas** — pare e pergunte ao operador.
- **Fonte de verdade visual:** Nunca utilize valores literais (*hardcoded*) de cor, espaçamento, tipografia ou raio. Utilize exclusivamente os tokens definidos em `design-system/02-tokens.md`.
- **Princípios de produto:** Preserve a personalização do estudante, garanta acessibilidade (contraste ≥ 4,5:1, múltiplos indicadores perceptíveis além de cor) e nunca introduza mecânicas ou mensagens punitivas (`design-system/01-principios.md`).
- **Estrutura de diretórios:** Respeite a divisão `src/app/` (módulos de rota Expo Router em `kebab-case.tsx` que importam e re-exportam como `default` os componentes de tela da `view`), `src/view/` (componentes de tela em `kebab-case.tsx` com o mesmo nome do módulo de rota em `src/app/`, exportados como `default`; componentes reutilizáveis em `src/view/components/` em `PascalCase.tsx`, exportados de forma nomeada; além de `theme/`), `src/viewmodel/` (arquivos em `camelCase.ts` com o mesmo nome do hook de apresentação/estado que exportam, no formato `useNomeViewModel.ts`), `src/usecase/` (contratos e implementações de casos de uso), `src/model/` (domínio puro: `entities/`, `errors/`, `repositories/` e `services/`), `src/infra/` (implementações concretas: `repositories/` e `services/`) e `src/DI/` (composição e injeção de dependências) conforme `ARCHITECTURE.md` e as convenções em `RULES.md`.
- **Segurança:** Nunca inclua segredos, tokens, chaves de API ou credenciais no código ou nos commits.

---

## 4. Designs Técnicos (EGM)

EGM artifact directory: .dev/egm

- **Design final:** `docs/designs/<funcionalidade>.md`, um por funcionalidade, registrado no índice `docs/designs/README.md`. É o único artefato EGM versionado.
- **Artefatos de trabalho** (`concepts_brief.md`, `design_draft.md`, relatórios de revisão e de drift): ficam em `.dev/egm/`, fora do Git. A pasta comporta uma tarefa por vez. Limpe-a antes de iniciar outra.
- Antes de implementar, o design deve estar em `docs/designs/` e ter passado por `/egm:egm-review`.

## 5. Checklist de Validação Local (Antes de Concluir ou Commitar)

Sempre que modificar código, tipos ou configurações, execute:

1. `npm run lint` — verificação do ESLint.
2. `npx --no-install tsc --noEmit` — verificação estrita de tipos TypeScript.
3. `npm test` — execução não interativa dos testes automatizados (Jest).
4. `node scripts/verify-local-hooks.mjs` — obrigatório caso altere `.husky/`, `scripts/` ou `commitlint.config.cjs`.
