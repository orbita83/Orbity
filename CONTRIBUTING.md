# Guia de Contribuição

Este documento estabelece as diretrizes de colaboração, desenvolvimento, versionamento e qualidade que devem ser seguidas por todos os contribuidores deste projeto.

O objetivo é manter um processo de desenvolvimento organizado, rastreável e consistente, facilitando o trabalho em equipe e garantindo que as alterações sejam devidamente revisadas e validadas antes de sua integração.

As regras descritas neste documento aplicam-se a todos os integrantes da equipe.

---

## Sumário

- [Guia de Contribuição](#guia-de-contribuição)
  - [Sumário](#sumário)
  - [1. Convenções de Contribuição](#1-convenções-de-contribuição)
    - [1.1. Commits](#11-commits)
    - [1.2. Branches](#12-branches)
    - [1.3. Issues](#13-issues)
    - [1.4. Pull Requests de Desenvolvimento](#14-pull-requests-de-desenvolvimento)
    - [1.5. Pull Requests de Publicação](#15-pull-requests-de-publicação)
  - [2. Fluxo de Desenvolvimento](#2-fluxo-de-desenvolvimento)
    - [2.1. Início de uma atividade](#21-início-de-uma-atividade)
    - [2.2. Preparação da branch](#22-preparação-da-branch)
    - [2.3. Implementação e commits](#23-implementação-e-commits)
    - [2.4. Validação local](#24-validação-local)
    - [2.5. Integração na development](#25-integração-na-development)
  - [3. Qualidade e Validação](#3-qualidade-e-validação)
    - [3.1. Padrões de qualidade](#31-padrões-de-qualidade)
    - [3.2. Testes](#32-testes)
    - [3.3. Revisão de código](#33-revisão-de-código)
    - [3.4. Integração contínua (CI)](#34-integração-contínua-ci)
  - [4. Processo de Publicação e Governança de Releases](#4-processo-de-publicação-e-governança-de-releases)
    - [4.1. Papel dos elementos no fluxo de publicação](#41-papel-dos-elementos-no-fluxo-de-publicação)
    - [4.2. Planejamento de versões e escopo](#42-planejamento-de-versões-e-escopo)
    - [4.3. Critérios para a primeira versão estável (v0.1.0)](#43-critérios-para-a-primeira-versão-estável-v010)
    - [4.4. Fluxo development → main e congelamento](#44-fluxo-development--main-e-congelamento)
    - [4.5. Critérios de aprovação de releases](#45-critérios-de-aprovação-de-releases)
    - [4.6. Política de versionamento e alinhamento com Android](#46-política-de-versionamento-e-alinhamento-com-android)
    - [4.7. Convenções de Git tags e GitHub Releases](#47-convenções-de-git-tags-e-github-releases)
    - [4.8. Correções urgentes e sincronização de branches](#48-correções-urgentes-e-sincronização-de-branches)
  - [5. Responsabilidades e Exceções](#5-responsabilidades-e-exceções)
    - [5.1. Responsabilidades dos contribuidores](#51-responsabilidades-dos-contribuidores)
    - [5.2. Tratamento de exceções](#52-tratamento-de-exceções)
    - [5.3. Atualização das diretrizes](#53-atualização-das-diretrizes)
  - [Considerações finais](#considerações-finais)

---

## 1. Convenções de Contribuição

### 1.1. Commits

Todas as mensagens de commit devem seguir o formato:

`prefixo(escopo): descricao curta`

**Exemplos:**

- `feat(auth): adiciona validacao do login`
- `fix(api): corrige tratamento de erros`
- `docs(readme): atualiza topico de dependencias`
- `refactor(tasks): reorganiza servico de tarefas`
- `test(auth): adiciona testes de autenticacao`
- `chore(gradle): atualiza configuracao do projeto`

**Prefixos permitidos:**

| Prefixo    | Finalidade                                                          |
| ---------- | ------------------------------------------------------------------- |
| `feat`     | Implementação de novas funcionalidades                              |
| `fix`      | Correção de defeitos                                                |
| `docs`     | Alterações na documentação                                          |
| `refactor` | Reestruturação do código sem alteração intencional de comportamento |
| `test`     | Criação ou manutenção de testes                                     |
| `chore`    | Tarefas de manutenção e configuração                                |

**Regras:**

- O prefixo e o escopo são obrigatórios.
- O escopo deve identificar objetivamente a área afetada.
- A descrição deve ser escrita em português brasileiro (pt-BR).
- A descrição deve ser objetiva e iniciar com letra minúscula.
- Não utilizar símbolos decorativos ou caracteres especiais desnecessários.
- Cada commit deve representar uma alteração coerente e identificável.
- Não incluir credenciais, tokens, senhas ou outras informações sensíveis nos commits.
- Prefixos adicionais somente poderão ser utilizados após aprovação da equipe e inclusão na convenção oficial do projeto.

As mensagens devem permitir que outros integrantes compreendam a finalidade da alteração sem precisar analisar todo o código.

### 1.2. Branches

As branches de trabalho devem seguir o formato:

`prefixo/descricao-curta`

**Exemplos:**

- `feat/autenticacao-usuario`
- `fix/login-usuario`
- `docs/documentacao-epicos`
- `refactor/servico-tarefas`
- `test/autenticacao`
- `chore/configuracao-gradle`

**Regras:**

- Utilizar letras minúsculas.
- Separar palavras com hífen.
- Não utilizar espaços, acentos ou caracteres especiais.
- Utilizar prefixos coerentes com a natureza da atividade.
- Criar branches de trabalho a partir da versão atualizada da `development`.
- Não iniciar uma nova atividade a partir de uma branch de trabalho antiga.
- Utilizar uma branch própria para cada atividade independente.
- Não realizar alterações diretamente nas branches protegidas `main` e `development`.
- Evitar reutilizar branches que já tiveram suas atividades concluídas.
- Após o merge do Pull Request, a branch de trabalho remota é removida automaticamente pelo GitHub; `main` e `development` são protegidas contra exclusão.

**Branches permanentes:**

| Branch        | Responsabilidade                                                          |
| ------------- | ------------------------------------------------------------------------- |
| `main`        | Manter o histórico das versões estáveis e publicadas do projeto           |
| `development` | Integrar funcionalidades, correções e melhorias durante o desenvolvimento |

A branch `development` é a referência para iniciar novas atividades, mesmo quando a `main` receber commits relacionados a uma publicação.

Alterações exclusivas realizadas na `main` deverão ser sincronizadas com a `development`, quando necessário, para evitar divergências entre as branches permanentes.

### 1.3. Issues

As Issues são utilizadas para registrar funcionalidades, defeitos, tarefas e necessidades de documentação.

Todas as Issues devem seguir o padrão de título:

`[PREFIXO] descrição curta`

**Exemplos:**

- `[FIX] Corrigir falha na autenticação`
- `[FEATURE] Implementar recuperação de senha`
- `[DOCS] Atualizar documentação da API`
- `[TASK] Configurar ferramenta de análise estática`

**Requisitos:**

- O prefixo deve corresponder ao tipo de Issue selecionado.
- O título deve ser claro, objetivo e escrito em português brasileiro (pt-BR).
- A descrição deve seguir os campos definidos pelo template correspondente.
- As informações obrigatórias do template devem ser preenchidas adequadamente.
- Os critérios de aceitação devem ser informados quando aplicáveis.
- As labels devem corresponder à classificação da Issue.
- Antes de criar uma Issue, deve-se verificar a existência de registros duplicados.
- A Issue deve apresentar informações suficientes para compreender a necessidade e orientar sua implementação.

**Obrigatoriedade:**

A existência de uma Issue relacionada não é obrigatória para toda contribuição.

Entretanto, recomenda-se sua criação para funcionalidades planejadas, defeitos relevantes, tarefas que exijam discussão e atividades que precisem de acompanhamento pela equipe.

Alterações pequenas e pontuais poderão ser realizadas sem Issue, desde que estejam devidamente descritas no Pull Request.

**Templates:**

A criação de Issues deve utilizar obrigatoriamente os templates oficiais disponíveis em `.github/ISSUE_TEMPLATE/`.

Cada template estabelece os campos e requisitos específicos de seu respectivo tipo de Issue.

**Relação entre Épicos, Issues e Milestones:**

No planejamento e rastreabilidade das entregas do Orbity, os seguintes elementos possuem papéis complementares e não intercambiáveis:

- **Épico:** Agrupa um objetivo maior de produto ou infraestrutura técnica (ex.: `EP-0000 — Fundação do Orbity`). Define as metas globais, as frentes de trabalho e a cadeia de precedência entre atividades.
- **Issue:** Representa a menor unidade de trabalho rastreável (funcionalidade, correção, tarefa técnica ou documentação). Sempre que originada de um épico, deve referenciar o identificador correspondente no corpo (ex.: `> Origem: T0014 — issue #80 do EP-0000`).
- **Milestone:** Representa um marco temporal de entrega ou o agrupador de uma versão planejada (ex.: `v0.1.0`). É adotada de forma deliberada pela equipe para acompanhar o progresso de um conjunto de issues. A associação de issues a uma milestone é flexível: não existe obrigatoriedade de que cada issue pertença a uma milestone, nem que cada épico corresponda a uma única versão.
- **Desacoplamento de conclusão e publicação:** A conclusão de uma issue ou o encerramento de um épico **não implica a publicação automática** de uma versão estável. O encerramento de atividades apenas integra código à branch `development`. A publicação exige um processo formal e controlado de release (detalhado na [Seção 4](#4-processo-de-publicação-e-governança-de-releases)).

### 1.4. Pull Requests de Desenvolvimento

Os Pull Requests de desenvolvimento são responsáveis por integrar alterações das branches de trabalho à `development`.

Todos os Pull Requests de desenvolvimento devem seguir o padrão de título:

`prefixo(escopo): descricao curta`

**Exemplos:**

- `feat(auth): adiciona recuperacao de senha`
- `fix(api): corrige tratamento de timeout`
- `docs(contributing): atualiza regras de pull request`

**Requisitos:**

- A criação do Pull Request deve ser realizada manualmente ou de forma automática pelo agente, seguindo o template descrito no workflow da pasta .github.
- A branch de destino deve ser `development`.
- O prefixo deve corresponder ao tipo principal da alteração.
- O escopo deve indicar objetivamente a área afetada.
- O título deve ser claro, objetivo e escrito em português brasileiro (pt-BR).
- A descrição deve seguir os campos definidos pelo template oficial.
- As principais alterações implementadas devem ser informadas.
- As formas de validação e os testes realizados devem ser descritos.
- A documentação afetada deve ser atualizada, quando aplicável.
- A Issue relacionada deve ser referenciada com `Closes #numero`, quando houver e quando o merge deva encerrar essa Issue.
- A existência de uma Issue relacionada não é obrigatória.
- Os Pull Requests de desenvolvimento não exigem definição ou classificação de versão. O versionamento estável é tratado durante o processo de publicação.
- As verificações obrigatórias do CI devem ser concluídas com sucesso.
- As aprovações exigidas devem ser obtidas antes do merge.
- Comentários e solicitações de alteração dos revisores devem ser tratados antes da integração.

A abertura de um Pull Request não autoriza sua integração imediata. O merge depende do cumprimento dos requisitos de qualidade e revisão estabelecidos pelo projeto.

**Templates:**

A criação de Pull Requests de desenvolvimento deve utilizar o template oficial estabelecido para esse tipo de contribuição.

O template deve permitir descrever as alterações, registrar as validações realizadas e fornecer informações relevantes para a revisão.

O modelo está em `.github/PULL_REQUEST_TEMPLATE/development.md`. Ao abrir o Pull Request para `development` pela interface do GitHub, acrescente `template=development.md` à URL de comparação (`?template=development.md` ou `&template=development.md`, se já houver outros parâmetros).

### 1.5. Pull Requests de Publicação

Os Pull Requests de publicação são responsáveis por integrar à branch `main` as alterações acumuladas e validadas na branch `development`, estabelecendo uma nova versão estável do projeto.

Diferentemente dos Pull Requests de desenvolvimento, os Pull Requests de publicação devem seguir o padrão de título:

`release: publicar versão X.Y.Z`

**Exemplo:**

- `release: publicar versão 1.3.0`

**Requisitos:**

- A criação do Pull Request de publicação deve ser realizada manualmente por um integrante da equipe.
- O Pull Request deve ter como origem a branch `development` e como destino a branch `main`.
- A publicação deve ocorrer somente após a equipe considerar as alterações integradas à `development` prontas para uma nova versão estável.
- O título deve identificar claramente a versão proposta para publicação.
- A descrição deve apresentar um resumo das principais alterações incluídas na versão.
- As validações e os testes realizados devem ser informados.
- As verificações obrigatórias do CI devem ser concluídas com sucesso.
- As aprovações exigidas devem ser obtidas antes do merge.
- Alterações incorporadas durante a revisão devem ser novamente consideradas nas validações.
- Não devem ser integradas alterações inesperadas à publicação sem a devida revisão e aprovação.

**Templates:**

A criação de Pull Requests de publicação deve seguir o modelo específico estabelecido pela equipe, contendo as informações necessárias para a revisão e aprovação da nova versão.

O modelo está em `.github/PULL_REQUEST_TEMPLATE/release.md`. Ao abrir o Pull Request de `development` para `main` pela interface do GitHub, acrescente `template=release.md` à URL de comparação (`?template=release.md` ou `&template=release.md`, se já houver outros parâmetros).

O GitHub não escolhe automaticamente um modelo conforme a branch de destino. Os modelos só ficam disponíveis na interface após integrarem a branch padrão do repositório.

---

## 2. Fluxo de Desenvolvimento

### 2.1. Início de uma atividade

Toda contribuição deve começar com a identificação de uma necessidade de desenvolvimento.

Essa necessidade pode corresponder à implementação de uma funcionalidade, correção de defeito, atualização de documentação, refatoração, criação de testes ou manutenção do projeto.

Antes de iniciar, o contribuidor deve:

1. Compreender o objetivo da atividade.
2. Verificar se existe uma Issue relacionada.
3. Consultar implementações existentes que possam ser afetadas.
4. Identificar dependências ou possíveis conflitos com atividades de outros integrantes.
5. Confirmar que a alteração está alinhada às decisões técnicas do projeto.

Quando houver dúvidas relevantes sobre requisitos ou comportamento esperado, elas devem ser discutidas antes da implementação.

### 2.2. Preparação da branch

Toda nova atividade independente deve partir da versão atualizada da branch `development`.

**Procedimento recomendado:**

```bash
git switch development
git pull --ff-only origin development
git switch -c feat/nome-da-atividade
```

O prefixo da nova branch deve ser adaptado ao tipo de contribuição.

**Regras:**

- Verificar a existência de alterações locais antes de trocar de branch.
- Atualizar a `development` utilizando sua referência remota.
- Não criar novas branches a partir de branches de trabalho anteriores.
- Não utilizar a `main` como origem padrão das atividades.
- Caso a atualização da `development` apresente conflitos ou divergências, resolver a situação antes de iniciar o novo trabalho.
- Não descartar alterações locais sem verificar sua necessidade.

O objetivo desse procedimento é garantir que novas implementações utilizem a base de integração mais atualizada disponível.

### 2.3. Implementação e commits

Durante a implementação, o contribuidor deve manter as alterações relacionadas ao objetivo da atividade.

**Recomendações:**

- Realizar alterações pequenas e coerentes sempre que possível.
- Evitar incluir mudanças sem relação com a atividade.
- Respeitar os padrões arquiteturais e as convenções existentes.
- Evitar duplicação desnecessária de código.
- Manter nomes e responsabilidades compreensíveis.
- Atualizar testes e documentação quando necessário.
- Utilizar mensagens de commit conforme a Seção 1.1.

Caso sejam identificadas necessidades independentes durante a implementação, recomenda-se registrá-las separadamente, evitando ampliar excessivamente o escopo original.

### 2.4. Validação local

Antes de abrir um Pull Request, o contribuidor deve verificar se sua alteração está pronta para revisão.

A validação local deve incluir, quando aplicável:

- Verificação de formatação e padrões de código.
- Execução dos linters configurados (`npm run lint`).
- Execução dos testes automatizados (`npm test`).
- Verificação de compilação ou análise estática (`npx --no-install tsc --noEmit`).
- Testes manuais dos comportamentos afetados.
- Revisão das alterações realizadas.
- Verificação de arquivos sensíveis ou informações que não devem ser versionadas.

O contribuidor deve informar no Pull Request quais validações foram executadas e quais não puderam ser realizadas.

A validação local não substitui as verificações obrigatórias executadas pelo CI.

Após `npm install` ou `npm ci`, com as dependências de desenvolvimento e os scripts de instalação habilitados, o script `prepare` configura os hooks locais do Husky. O `pre-commit` executa ESLint apenas nos arquivos de código preparados para commit. O `commit-msg` exige um prefixo permitido, escopo, descrição e inicial minúscula na descrição; o idioma e a pertinência do escopo devem ser conferidos na revisão.

O `pre-push` valida o nome de cada branch remota que será criada ou atualizada, conforme a Seção 1.2. Tags e exclusões de referências não passam por essa validação. As branches `main` e `development` são exceções de nomenclatura, sem autorização para pushes diretos. Os hooks não executam testes, compilação ou análise de tipos completa.

### 2.5. Integração na development

Após concluir a implementação e as validações locais, o contribuidor deve abrir um Pull Request destinado à `development`.

O processo de integração deve seguir esta sequência:

1. Enviar a branch de trabalho ao repositório remoto.
2. Abrir manualmente o Pull Request de desenvolvimento.
3. Preencher o template correspondente.
4. Aguardar as verificações automáticas.
5. Solicitar ou aguardar a revisão da equipe.
6. Corrigir eventuais problemas identificados.
7. Obter as aprovações exigidas.
8. Realizar o merge conforme a política estabelecida pelo projeto.

Caso novas alterações sejam enviadas ao Pull Request, as verificações e revisões afetadas deverão ser consideradas novamente.

Após a integração, a alteração passa a fazer parte da `development`, mas isso não significa que já tenha sido publicada como uma versão estável.

Quando um Pull Request é integrado à `development`, a automação em `.github/workflows/fechar-issues-development.yml` analisa a descrição do PR e fecha as issues locais referenciadas pelas keywords `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves` ou `resolved`, seguidas de `#numero`. A automação não atua em PRs fechados sem merge, em merges para outras branches, em referências `Refs`, em referências externas ou em Pull Requests; issues inexistentes e falhas de processamento são registradas nos logs.

O workflow possui somente a permissão `issues: write`, não executa código do PR e remove blocos e trechos de código da análise para evitar fechamentos acidentais. Issues já fechadas são ignoradas, e referências repetidas são processadas uma única vez.

Após o merge, o GitHub remove automaticamente a branch de trabalho remota. Para manter o repositório local sincronizado, atualize a `development` e remova a referência local da branch integrada:

```bash
git switch development
git pull --ff-only origin development
git fetch --prune
git branch -d nome-da-branch
```

Utilize `git branch -d`, que recusa a remoção de branches com commits não integrados; não utilize `-D`. Caso uma branch remota seja removida por engano, ela pode ser restaurada pelo botão **Restore branch** na página do Pull Request.

---

## 3. Qualidade e Validação

### 3.1. Padrões de qualidade

Todos os contribuidores são responsáveis por preservar a qualidade e a consistência do projeto.

As alterações devem:

- Respeitar a arquitetura e as convenções estabelecidas.
- Manter responsabilidades bem definidas.
- Evitar complexidade desnecessária.
- Preservar o funcionamento das funcionalidades existentes.
- Considerar o tratamento adequado de erros.
- Evitar a introdução de dependências sem justificativa.
- Não incluir informações sensíveis no repositório.
- Manter a documentação coerente com o comportamento implementado.

Mudanças arquiteturais relevantes devem ser discutidas com a equipe antes de sua adoção.

Quando necessário, as decisões técnicas devem ser registradas na documentação apropriada.

### 3.2. Testes

As alterações devem ser acompanhadas de verificações proporcionais ao seu impacto. O guia consolidado de testes automatizados, taxonomia de test doubles, criação de fixtures e testabilidade no MVVM Sofisticado encontra-se em [`docs/06-quality/guia-testes.md`](docs/06-quality/guia-testes.md).

**Diretrizes gerais:**

- **Novas funcionalidades:** Devem incluir testes proporcionais ao seu escopo (regras de negócio em Use Cases, reatividade em ViewModels e acessibilidade na View).
- **Correções de defeitos:** Devem verificar o problema corrigido e, quando viável, prevenir sua recorrência por meio de testes automatizados.
- **Refatorações:** Devem preservar integralmente os comportamentos observáveis existentes.
- **Componentes compartilhados:** Devem considerar impactos em outras telas e assegurar conformidade de acessibilidade (WCAG 2.5.5 / 2.5.8 e Material 3).
- **Integridade da suíte:** Testes existentes não devem ser removidos ou desabilitados apenas para permitir a aprovação de uma alteração.
- **Test Doubles e Mocks:** Utilizar Stubs e Fakes in-memory para prover dados e estados previsíveis; reservar Mocks (`jest.fn()`) e Spies (`jest.spyOn()`) para verificar efeitos colaterais estritamente necessários, evitando testes frágeis acoplados a detalhes de implementação interna.
- **Fixtures:** Utilizar funções geradoras (*factory functions*) que retornam novos objetos imutáveis com dados mínimos suficientes para o cenário, sem compartilhar estado mutável global entre testes.
- **Respeito às Camadas (MVVM Sofisticado):** Use Cases devem ser testados isoladamente sem dependência de UI ou React; ViewModels devem ser testadas com `renderHook`; e componentes devem ser testados de forma assíncrona com React Native Testing Library (`await render(...)`).

Quando a criação de testes automatizados não for viável, o contribuidor deverá descrever detalhadamente as verificações manuais realizadas no Pull Request.

A equipe poderá estabelecer verificações adicionais conforme a evolução do projeto.

### 3.3. Revisão de código

A revisão de código é uma etapa obrigatória antes da integração de alterações nas branches protegidas.

**Responsabilidades do autor:**

- Apresentar claramente o objetivo da alteração.
- Fornecer informações suficientes para a revisão.
- Responder às dúvidas dos revisores.
- Corrigir problemas identificados.
- Evitar integrar alterações enquanto existirem solicitações de correção pendentes.

**Responsabilidades do revisor:**

- Verificar a coerência da implementação com os requisitos.
- Avaliar possíveis impactos no restante do projeto.
- Identificar problemas de qualidade, manutenção e comportamento.
- Conferir as evidências de validação apresentadas.
- Registrar observações de forma objetiva e construtiva.
- Aprovar somente alterações consideradas adequadas para integração.

A aprovação deve representar uma avaliação efetiva da alteração, e não apenas uma formalidade.

A quantidade de aprovações obrigatórias e as permissões de merge serão definidas nas configurações de proteção do repositório.

O arquivo `.github/CODEOWNERS` define os responsáveis por todos os arquivos. O GitHub consulta a versão desse arquivo na branch de destino do Pull Request para solicitar revisão aos responsáveis elegíveis. Portanto, ele precisa estar tanto na `development` quanto na `main` para atender aos dois fluxos de PR. O CODEOWNERS, por si só, não torna aprovações obrigatórias; isso depende das configurações de proteção das branches.

### 3.4. Integração contínua (CI)

O projeto utilizará verificações automatizadas para auxiliar na manutenção da qualidade e no cumprimento das convenções.

O CI poderá contemplar:

- Validação das convenções de commits.
- Validação dos títulos dos Pull Requests.
- Validação da versão proposta nos Pull Requests de publicação.
- Execução de linters.
- Verificação de formatação.
- Análise estática.
- Execução de testes automatizados.
- Verificações relacionadas à integridade do projeto.
- Validações específicas do processo de publicação.

**Regras:**

- Verificações configuradas como obrigatórias devem ser concluídas com sucesso antes do merge.
- Falhas no CI devem ser investigadas e corrigidas.
- Não é permitido modificar ou desabilitar verificações apenas para contornar problemas sem autorização da equipe.
- Alterações nas regras de CI devem ser revisadas.
- O resultado das verificações automatizadas não substitui a revisão humana.

As ferramentas, comandos e jobs específicos serão definidos na configuração técnica do projeto.

Nos Pull Requests direcionados à branch `development`, o workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (`CI development` / job `validate`) executa automaticamente:

1. Instalação reproduzível de dependências (`npm ci`).
2. Verificação de lint (`npm run lint`).
3. Verificação estrita de tipos (`npx --no-install tsc --noEmit`).
4. Execução não interativa dos testes automatizados (`npm test`).

Para reproduzir localmente as mesmas validações antes de enviar alterações, execute `npm run lint`, `npx --no-install tsc --noEmit` e `npm test`. Caso ocorra falha no CI, os detalhes completos (etapa com erro, asserção violada e *stack trace*) podem ser consultados na aba **Checks** do Pull Request, expandindo o job `validate` nos logs do GitHub Actions (veja mais detalhes em [`docs/06-quality/guia-testes.md`](docs/06-quality/guia-testes.md)).

Na configuração de proteção da branch `development` (Ruleset **Branch Protection (Development)**), o status check `validate` deve permanecer configurado como obrigatório (*Require status checks to pass*) junto às regras existentes de revisão e aprovação de Pull Requests.

---

## 4. Processo de Publicação e Governança de Releases

Esta seção estabelece a política oficial de versões, releases e aprovação do Orbity, conectando o planejamento das atividades ao ciclo de vida de publicação estável.

### 4.1. Papel dos elementos no fluxo de publicação

Para assegurar rastreabilidade e integridade no ciclo de vida do projeto, cada elemento desempenha uma responsabilidade específica no fluxo:

| Elemento | Responsabilidade no fluxo de entrega | Escopo de atuação |
|---|---|---|
| **Épico** | Agrupar um objetivo maior de arquitetura ou produto | Planejamento estratégico e arquitetural |
| **Issue** | Descrever uma atividade técnica rastreável e verificável | Execução de tarefas individuais |
| **Milestone** | Representar um marco de entrega ou conjunto planejado para uma versão | Acompanhamento do progresso da release |
| **Branch de trabalho** | Isolar o desenvolvimento da atividade (`feat/`, `fix/`, etc.) | Espaço de trabalho temporário |
| **Pull Request de desenvolvimento** | Integrar e validar alterações na base de integração | Validação contínua (`development`) |
| **Branch `development`** | Centralizar a integração contínua do desenvolvimento | Base de integração ativa |
| **Pull Request de publicação** | Propor, revisar e homologar a transição de versão estável | Governança de release (`development` → `main`) |
| **Branch `main`** | Manter o histórico consolidado das versões estáveis publicadas | Referência estável do produto |
| **Git tag (`vX.Y.Z`)** | Marcar o commit exato da publicação na `main` | Rastreabilidade imutável de código |
| **GitHub Release** | Registrar notas de lançamento, changelog e artefatos de entrega | Comunicação oficial da versão |

**Princípio de desacoplamento:**
A existência de alterações concluídas na `development`, o fechamento de uma issue ou o término de um épico não deflagram publicação automática. A criação de uma release é um ato planejado, deliberado e controlado pela equipe.

### 4.2. Planejamento de versões e escopo

O planejamento de uma versão estável determina quais funcionalidades, correções e melhorias comporão a próxima publicação.

**Diretrizes de escopo:**
- **Seleção de escopo:** O escopo de uma versão é definido previamente pela equipe com base nas entregas concluídas e integradas na branch `development`.
- **Classificação dos estados de uma versão:**
  1. *Versão Planejada:* Representa o escopo previsto no backlog ou agrupado em uma milestone no GitHub.
  2. *Versão Candidata:* Conjunto de alterações congelado na `development`, submetido a validações finais e documentado em um Pull Request de publicação aberto para a `main`.
  3. *Versão Publicada:* Estado estável consolidado na `main`, referenciado por Git tag anotada e registrado em uma GitHub Release.
- **Tratamento de escopo pendente ou com instabilidades:** Caso uma issue vinculada ao escopo planejado de uma versão não atinja a maturidade exigida, apresente defeitos impeditivos ou não seja concluída a tempo, a equipe poderá **desassociá-la da versão** sem interromper o ciclo de publicação das demais entregas concluídas. A funcionalidade postergada permanece na `development` para consolidação em ciclo futuro.
- **Alterações não versionáveis:** Atividades exclusivamente documentais, tarefas internas de manutenção de repositório e ajustes de governança não provocam incremento de versão do aplicativo por si mesmas. Nessas situações, a equipe avalia se há necessidade de consolidação na `main` ou se tais mudanças aguardarão a próxima versão com impacto observável.

### 4.3. Critérios para a primeira versão estável (v0.1.0)

A primeira versão pública e estável do Orbity marca o encerramento da fase de fundação técnica e arquitetural do produto.

**Desmistificação da versão inicial:**
O valor `1.0.0` presente inicialmente em `app.json` e `package.json` é decorrente do scaffold padrão gerado pelo template Expo e **não comprova a existência de uma versão estável já publicada**. A equipe adota formalmente **`v0.1.0`** como o identificador da primeira release estável do aplicativo. O ajuste técnico dos manifestos para `0.1.0` é de responsabilidade da tarefa técnica de versionamento ([T0010 — #76](https://github.com/orbita83/Orbity/issues/76)).

**Critérios mínimos para autorização da `v0.1.0`:**
Para que o primeiro Pull Request de publicação (`release: publicar versão 0.1.0`) seja autorizado e integrado à `main`, todos os seguintes critérios devem ser atendidos:
1. **Conclusão do ÉPICO 0:** Todas as entregas fundamentais de governança, arquitetura e qualidade do [EP-0000](docs/03-backlog/epics/EP-0000.md) devem estar integradas à `development` com seus critérios de aceitação cumpridos.
2. **Shell navegável validado:** O shell inicial de navegação com as cinco abas funcionais (Hoje, Tarefas, Foco, Rotinas, Perfil) implementado na [T0017](https://github.com/orbita83/Orbity/issues/83) deve renderizar perfeitamente e navegar sem falhas em ambiente Android.
3. **Qualidade e testes automatizados:** Suíte de testes unitários, testes de componentes e verificações estáticas (ESLint, TypeScript estrito) executando com 100% de sucesso no CI (`npm run lint`, `npx --no-install tsc --noEmit`, `npm test`).
4. **Build Android gerado:** Build Android gerado e assinado via EAS Build (APK de preview e AAB de produção) conforme os perfis e credenciais estabelecidos nas tarefas [T0011](https://github.com/orbita83/Orbity/issues/77) e [T0012](https://github.com/orbita83/Orbity/issues/78).
5. **Ausência de defeitos bloqueadores:** Inexistência de defeitos críticos (prioridade P0) que causem encerramento inesperado do aplicativo, falhas de renderização de telas ou quebra de acessibilidade fundamental.
6. **Evidências de validação manual:** Relatório de testes exploratórios em aparelho físico ou emulador Android registrado na descrição do Pull Request de publicação.

**Distinção entre release estável no GitHub e distribuição na Google Play:**
A geração da tag e release `v0.1.0` no repositório GitHub comprova a estabilidade do código-fonte. A disponibilização pública para usuários finais na Google Play Store seguirá etapas graduais (Closed Testing / Faixa de Teste Fechado) coordenadas com a auditoria de requisitos de loja ([T0013](https://github.com/orbita83/Orbity/issues/79)), sem obrigar publicação imediata em produção aberta.

### 4.4. Fluxo development → main e congelamento

A transição entre a base de desenvolvimento e a branch de produção estável é realizada por meio de um processo estrito de Pull Request:

1. **Abertura do Pull Request de publicação:**
   - Origem: `development`.
   - Destino: `main`.
   - Título obrigatório: `release: publicar versão X.Y.Z` (ex.: `release: publicar versão 0.1.0`).
   - Template: Utilização obrigatória de [`.github/PULL_REQUEST_TEMPLATE/release.md`](.github/PULL_REQUEST_TEMPLATE/release.md).
2. **Política de congelamento (Release Freeze):**
   - Durante o período em que o Pull Request de publicação estiver em revisão e homologação, a integração de novas funcionalidades (`feat/`) na branch `development` deve ser suspensa ou postergada pela equipe.
   - Apenas correções de defeitos bloqueadores identificados durante a validação da própria release podem ser integradas à `development` nesse intervalo.
3. **Tratamento de alterações tardias na development:**
   - Caso qualquer alteração seja integrada à branch `development` após a abertura do Pull Request de publicação, o PR de release deve ser obrigatoriamente atualizado com o novo commit de integração (`git merge development` ou rebase correspondente).
   - Todo o checklist de escopo e validação automatizada deve ser reexecutado e documentado antes do merge final.
4. **Proibição de alterações diretas:**
   - Permanece terminantemente proibido qualquer commit ou push direto nas branches protegidas `development` e `main`.
   - O merge para a `main` deve ser realizado exclusivamente pela interface do GitHub após o cumprimento de todas as aprovações e status checks.

### 4.5. Critérios de aprovação de releases

O merge de uma release na branch `main` exige uma avaliação colegiada e rigorosa de conformidade:

- **Papéis e responsabilidades:**
  - *Autor do Release (Preparador):* Integrante responsável por abrir o PR de publicação, consolidar o changelog, preencher o template oficial e anexar as evidências de validação.
  - *Revisores Formais:* Integrantes designados (conforme `.github/CODEOWNERS` e regras de proteção de branch) responsáveis por auditar o escopo, conferir o changelog e validar a ausência de regressões.
- **Aprovações humanas obrigatórias:** Ao menos 1 aprovação formal de revisor qualificado é necessária antes que o merge seja autorizado.
- **Verificações automatizadas (CI):** O status check `validate` (lint, checagem estrita de tipos TypeScript e suíte completa de testes Jest) deve ser concluído com sucesso de forma 100% verde no GitHub Actions.
- **Validação de build e integridade:** Confirmação de que os identificadores de versão estão perfeitamente sincronizados com as configurações técnicas do aplicativo.
- **Tolerância zero a bloqueadores:** Nenhum defeito de severidade P0 ou que cause quebra de contrato arquitetural pode ser aceito na release. Riscos ou limitações conhecidas não bloqueadoras devem ser expressamente catalogados na seção de informações adicionais do template.
- **Inviolabilidade das checagens:** É expressamente vedado contornar verificações obrigatórias de qualidade por meio de flags como `--no-verify`, variáveis `HUSKY=0` ou permissões administrativas de bypass de regras de proteção.

### 4.6. Política de versionamento e alinhamento com Android

O Orbity adota o padrão de Versionamento Semântico (**SemVer**), estruturado no formato:

`X.Y.Z`

| Componente | Identificador | Classificação | Critério de aplicação |
|---|---|---|---|
| `X` | `MAJOR` | Versão principal | Mudanças arquiteturais profundas, reestruturações de banco de dados locais incompatíveis ou quebras estruturais de contratos existentes. |
| `Y` | `MINOR` | Novas funcionalidades | Inclusão de novas telas, fluxos de estudo, componentes do Design System ou regras de negócio mantendo compatibilidade retroativa. |
| `Z` | `PATCH` | Correções | Ajustes finos de layout, correções de defeitos e bugs, refatorações internas sem impacto funcional perceptível. |

Quando um componente de nível superior é incrementado, os componentes subordinados são reiniciados em zero (ex.: após `0.1.4`, uma nova funcionalidade resulta em `0.2.0`).

**Alinhamento com versionamento Android:**
A versão SemVer aprovada na governança reflete-se diretamente nos identificadores técnicos gerenciados pelo Expo e pelo ecossistema Android, conforme documentado em [`docs/08-distribution/identidade-e-propriedade.md`](docs/08-distribution/identidade-e-propriedade.md) e [`docs/08-distribution/versionamento-do-app.md`](docs/08-distribution/versionamento-do-app.md):
- **`versionName` (`app.json` → `expo.version` e `package.json` → `version`):** Corresponde fielmente à versão pública `X.Y.Z` apresentada aos usuários e ao Google Play Console.
- **`versionCode` (`app.json` → `expo.android.versionCode`):** Número inteiro estritamente incremental e monotônico crescente (ex.: `1`, `2`, `3`...), exigido pela Google Play para cada novo pacote gerado (AAB). O `versionCode` nunca retrocede, mesmo entre versões com mesmo SemVer ou correções de build.
- **Consistência obrigatória:** Os manifestos técnicos do aplicativo somente são atualizados pela equipe no contexto da preparação da release, mantendo sincronia absoluta com a tag Git a ser gerada. Contribuidores em tarefas de desenvolvimento comuns não devem alterar os campos de versão em seus PRs individuais.

### 4.7. Convenções de Git tags e GitHub Releases

A rastreabilidade histórica de cada versão publicada é assegurada pela marcação de tags e publicação de releases no GitHub:

1. **Formato da Git tag:**
   As tags devem seguir rigorosamente o padrão:
   `vX.Y.Z` (ex.: `v0.1.0`, `v0.2.0`, `v1.0.0`).
2. **Criação da tag:**
   - A tag deve ser criada **imediatamente após o merge** do Pull Request de publicação na branch `main`.
   - A tag deve apontar com precisão para o commit de merge resultante na `main`.
   - Deve ser utilizada obrigatoriamente uma **tag anotada** contendo mensagem explicativa:
     ```bash
     git tag -a vX.Y.Z -m "release: publicar versão X.Y.Z"
     ```
3. **Publicação da GitHub Release:**
   - Uma GitHub Release oficial deve ser publicada na interface do repositório vinculada à tag `vX.Y.Z`.
   - **Título da Release:** `Orbity vX.Y.Z`.
   - **Conteúdo da Release (Notas de Versão / Changelog):** O corpo da release deve ser estruturado em seções padronizadas:
     - *Novidades (Features)* — principais funcionalidades adicionadas.
     - *Correções (Bug Fixes)* — defeitos corrigidos desde a versão anterior.
     - *Melhorias e Manutenção (Chores/Refactors)* — aprimoramentos técnicos e de arquitetura.
     - *Documentação (Docs)* — alterações relevantes de documentação e governança.
     - *Rastreabilidade* — links para os Pull Requests integrados e referências às issues fechadas.
4. **Imutabilidade e integridade das tags:**
   - Uma tag publicada na `main` é **imutável**.
   - É expressamente proibido deletar, mover ou sobrescrever uma tag existente para reaproveitá-la após alterações no código.
   - Qualquer correção identificada após a geração de uma release deve ser tratada por meio do processo de correção urgente (*hotfix*), resultando em um novo incremento de versão `PATCH` (`vX.Y.(Z+1)`).

### 4.8. Correções urgentes e sincronização de branches

Quando um defeito crítico ou impeditivo é identificado em ambiente de produção após a publicação de uma versão na branch `main`, deve ser acionado o fluxo de **correção urgente (Hotfix)**:

1. **Criação da branch de hotfix:**
   - A branch de trabalho deve partir diretamente da tag da versão afetada ou do topo da branch `main`:
     `fix/<descricao-curta-do-problema>`
2. **Implementação e escopo mínimo:**
   - A alteração deve restringir-se estritamente à resolução do defeito impeditivo, evitando refatorações secundárias ou inclusão de novas funcionalidades.
   - Testes automatizados que reproduzam o defeito e comprovem a correção devem ser incluídos.
3. **Pull Request de publicação de hotfix:**
   - O Pull Request deve ser direcionado para a branch `main`.
   - Título obrigatório: `release: publicar versão X.Y.(Z+1)` (incrementando o dígito `PATCH`).
   - A descrição deve registrar detalhadamente o incidente, o impacto na versão anterior e a comprovação dos testes realizados.
4. **Merge, tag e publicação:**
   - Após aprovação formal e sucesso em todas as verificações do CI, o PR é integrado à `main`.
   - A tag anotada correspondente (`vX.Y.(Z+1)`) e a nova GitHub Release são publicadas imediatamente.
5. **Sincronização obrigatória com a development:**
   - Para evitar divergência entre as branches permanentes e garantir que a correção não seja perdida em futuras releases, o autor do hotfix deve **imediatamente abrir um Pull Request de sincronização** da `main` para a `development` (ou criar uma branch `chore/sync-main-to-development` para validação prévia).
   - Somente após a integração da correção à `development` o ciclo de hotfix é considerado concluído.

---

## 5. Responsabilidades e Exceções

### 5.1. Responsabilidades dos contribuidores

Todos os integrantes da equipe devem:

- Conhecer e respeitar as diretrizes deste documento.
- Manter suas branches de trabalho organizadas.
- Iniciar novas atividades a partir da `development` atualizada.
- Utilizar as convenções oficiais de commits, branches, Issues e Pull Requests.
- Realizar as validações necessárias antes de solicitar revisão.
- Comunicar alterações que possam afetar atividades de outros integrantes.
- Participar das revisões quando necessário.
- Evitar mudanças diretas nas branches protegidas.
- Preservar a integridade e a rastreabilidade do histórico do projeto.
- Comunicar problemas identificados durante o desenvolvimento ou a publicação.

As responsabilidades individuais não substituem as decisões coletivas necessárias para alterações relevantes no processo ou na arquitetura do projeto.

### 5.2. Tratamento de exceções

Situações excepcionais poderão exigir procedimentos diferentes dos estabelecidos neste documento.

Exemplos incluem:

- Correções urgentes de defeitos críticos.
- Problemas que impeçam o funcionamento do CI.
- Necessidade de recuperação de uma publicação.
- Conflitos ou divergências entre branches permanentes.
- Limitações técnicas que impeçam temporariamente o cumprimento de uma regra.

**Diretrizes:**

- A exceção deve ser comunicada à equipe.
- O motivo deve ser justificado.
- A solução deve preservar, sempre que possível, a revisão e a rastreabilidade.
- Não devem ser realizados procedimentos destrutivos sem avaliação dos impactos.
- Alterações emergenciais devem ser posteriormente documentadas e sincronizadas com as branches necessárias.

Exceções não devem ser utilizadas como alternativa habitual ao processo de contribuição.

### 5.3. Atualização das diretrizes

Este documento poderá ser atualizado conforme a evolução do projeto e as necessidades da equipe.

Alterações nas diretrizes devem:

1. Ser propostas e discutidas com os integrantes.
2. Apresentar justificativa quando modificarem regras existentes.
3. Ser realizadas por meio de Pull Request.
4. Passar pelas verificações e aprovações aplicáveis.
5. Ser comunicadas aos integrantes após sua integração.

Novas ferramentas, automações e convenções deverão ser documentadas quando modificarem o processo de colaboração.

O objetivo é manter as diretrizes atualizadas, compreensíveis e compatíveis com a realidade do projeto.

---

## Considerações finais

A colaboração neste projeto deve priorizar organização, comunicação, qualidade e rastreabilidade.

O processo de contribuição foi estruturado para permitir que diferentes desenvolvedores trabalhem simultaneamente, mantendo uma base de integração compartilhada e um processo controlado de publicação.

O cumprimento destas diretrizes contribui para a estabilidade do projeto, facilita a revisão das alterações e reduz conflitos durante o desenvolvimento.

Todos os contribuidores são responsáveis por preservar e melhorar continuamente esse processo.
