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
| **Criar testes ou validar qualidade/CI/hooks** | `CONTRIBUTING.md` (Seções 2.4 e 3), `.github/workflows/ci.yml` e `scripts/verify-local-hooks.mjs` |

---

## 2. Regras Rápidas de Git e Contribuição (Resumo Operacional)

- **Branch base:** Toda branch de trabalho deve partir de `development` atualizada (`git switch development && git pull --ff-only origin development`). Nunca parta de `main` ou de outra branch de trabalho, e nunca faça alterações diretas em `main` ou `development`.
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
- **Estrutura de diretórios:** Respeite a divisão `src/app/` (módulos de rota Expo Router em `kebab-case.tsx` que importam e re-exportam como `default` os componentes de tela da `view`), `src/view/` (componentes de tela exportados como `default` e componentes reutilizáveis de UI), `src/viewmodel/` (lógica de apresentação/estado) e `src/model/` (domínio/dados) conforme `ARCHITECTURE.md` e as convenções em `RULES.md`.
- **Segurança:** Nunca inclua segredos, tokens, chaves de API ou credenciais no código ou nos commits.

---

## 4. Checklist de Validação Local (Antes de Concluir ou Commitar)

Sempre que modificar código, tipos ou configurações, execute:

1. `npm run lint` — verificação do ESLint.
2. `npx --no-install tsc --noEmit` — verificação estrita de tipos TypeScript.
3. `node scripts/verify-local-hooks.mjs` — obrigatório caso altere `.husky/`, `scripts/` ou `commitlint.config.cjs`.
