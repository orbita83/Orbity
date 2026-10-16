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
  - [4. Processo de Publicação](#4-processo-de-publicação)
    - [4.1. Preparação da publicação](#41-preparação-da-publicação)
    - [4.2. Aprovação e integração na main](#42-aprovação-e-integração-na-main)
    - [4.3. Política de Versionamento](#43-política-de-versionamento)
    - [4.4. Registro de publicações](#44-registro-de-publicações)
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
- Após a integração e conclusão da atividade, a branch de trabalho poderá ser removida.

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

### 1.4. Pull Requests de Desenvolvimento

Os Pull Requests de desenvolvimento são responsáveis por integrar alterações das branches de trabalho à `development`.

Todos os Pull Requests de desenvolvimento devem seguir o padrão de título:

`prefixo(escopo): descricao curta`

**Exemplos:**

- `feat(auth): adiciona recuperacao de senha`
- `fix(api): corrige tratamento de timeout`
- `docs(contributing): atualiza regras de pull request`

**Requisitos:**

- A criação do Pull Request deve ser realizada manualmente pelo contribuidor.
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
- Execução dos linters configurados.
- Execução dos testes relacionados à alteração.
- Verificação de compilação ou análise estática.
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

As alterações devem ser acompanhadas de verificações proporcionais ao seu impacto.

**Diretrizes:**

- Novas funcionalidades devem ser testadas quanto ao comportamento esperado.
- Correções de defeitos devem verificar o problema corrigido e, quando viável, prevenir sua recorrência por meio de testes.
- Refatorações devem preservar os comportamentos existentes.
- Alterações em componentes compartilhados devem considerar os possíveis impactos em outras partes do sistema.
- Testes existentes não devem ser removidos ou desabilitados apenas para permitir a aprovação de uma alteração.

Quando a criação de testes automatizados não for viável, o contribuidor deverá descrever as verificações manuais realizadas.

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

---

## 4. Processo de Publicação

### 4.1. Preparação da publicação

A branch `development` reúne as alterações integradas durante o desenvolvimento.

A existência de novas alterações nessa branch não implica a necessidade de publicação imediata.

A equipe deve decidir quando o conjunto de funcionalidades, correções e melhorias está suficientemente validado para compor uma nova versão estável.

Antes de iniciar a publicação, devem ser considerados:

- A conclusão das atividades previstas para a versão.
- O funcionamento das funcionalidades integradas.
- A resolução de defeitos que impeçam a publicação.
- A execução das verificações necessárias.
- A atualização da documentação afetada.
- A identificação das alterações incluídas na versão.

A publicação deve ser iniciada manualmente por meio de um Pull Request específico.

Durante sua revisão, a equipe deve controlar a inclusão de novas alterações na `development`, evitando que mudanças inesperadas sejam incorporadas à publicação sem validação.

### 4.2. Aprovação e integração na main

O Pull Request de publicação deve seguir as regras estabelecidas na Seção 1.5.

Antes do merge, a equipe deverá verificar:

- Se a versão proposta está corretamente identificada.
- Se o conjunto de alterações corresponde ao que se pretende publicar.
- Se as verificações obrigatórias foram concluídas.
- Se os testes e as revisões necessários foram realizados.
- Se não existem impedimentos conhecidos para a publicação.
- Se os requisitos de aprovação foram atendidos.

Somente após essas verificações o Pull Request poderá ser integrado à `main`.

A branch `main` deve representar o estado estável do projeto.

O merge de publicação é uma decisão controlada pela equipe e não deve ser iniciado automaticamente apenas pela existência de novas alterações na `development`.

### 4.3. Política de Versionamento

O projeto utiliza um sistema de versionamento composto por três números, permitindo identificar a evolução do software e distinguir versões estáveis.

As versões seguem o formato:

`X.Y.Z`

**Exemplo:** `1.3.2`

Cada número representa uma categoria de alteração:

| Componente | Identificador | Classificação         | Descrição                                                                |
| ---------- | ------------- | --------------------- | ------------------------------------------------------------------------ |
| `X`        | `MAJOR`       | Versão principal      | Alterações que introduzem incompatibilidades com versões anteriores.     |
| `Y`        | `MINOR`       | Novas funcionalidades | Funcionalidades adicionadas sem comprometer a compatibilidade existente. |
| `Z`        | `PATCH`       | Correções             | Correções de defeitos que preservam a compatibilidade existente.         |

**Exemplos de evolução:**

Considerando a versão atual `1.2.0`:

- Uma correção compatível poderá resultar na versão `1.2.1`.
- Uma nova funcionalidade compatível poderá resultar na versão `1.3.0`.
- Uma alteração incompatível poderá resultar na versão `2.0.0`.

Quando um componente anterior é incrementado, os componentes seguintes são reiniciados em zero.

**Definição da próxima versão:**

A definição da próxima versão estável é realizada durante a preparação do Pull Request de publicação, considerando as alterações integradas à `development` desde a última publicação.

A equipe deve avaliar o impacto do conjunto de alterações: incompatibilidades exigem incremento principal (`major`), novas funcionalidades compatíveis exigem incremento secundário (`minor`) e correções compatíveis exigem incremento de correção (`patch`). Quando houver impactos diferentes, prevalece o de maior nível.

Alterações exclusivamente documentais, ajustes internos e tarefas de manutenção sem impacto no aplicativo não provocam incremento de versão por si mesmas. Se o conjunto a publicar contiver apenas essas alterações, a equipe deverá decidir se há necessidade de uma nova versão estável.

**Regras:**

- O número da versão proposta no Pull Request de publicação deve ser validado antes da integração na `main`.
- Os contribuidores não devem modificar manualmente os identificadores de versão controlados pelo processo de publicação em Pull Requests comuns de desenvolvimento.
- Alterações excepcionais nesses identificadores exigem aprovação da equipe.

**Versionamento do aplicativo Android:**

O aplicativo utiliza identificadores internos de versão, incluindo `versionName` e `versionCode`.

O `versionName` representa a versão apresentada ao usuário, enquanto o `versionCode` identifica internamente a evolução dos pacotes Android.

O gerenciamento desses identificadores deverá respeitar o processo de geração e distribuição de builds definido pela equipe.

O processo automatizado de publicação deverá manter a consistência entre as versões registradas no GitHub e os identificadores internos que estiverem sob sua responsabilidade, sem interferir indevidamente no controle dos builds destinados à distribuição.

### 4.4. Registro de publicações

Após a integração de um Pull Request de publicação à `main`, a versão estável deverá ser registrada no GitHub.

O registro poderá envolver:

- Criação de uma Git tag correspondente à versão.
- Criação de uma GitHub Release.
- Registro das principais alterações incluídas.
- Associação da versão ao commit publicado na `main`.

As Git tags devem seguir o formato:

`vX.Y.Z`

**Exemplos:**

- `v1.0.0`
- `v1.1.0`
- `v1.1.1`

**Regras:**

- As tags estáveis devem identificar commits pertencentes ao histórico da `main`.
- Não devem existir duas publicações distintas utilizando a mesma tag.
- Uma versão publicada não deve ter sua tag alterada arbitrariamente.
- Correções posteriores devem ser registradas em novas versões.
- A criação das tags e das GitHub Releases poderá ser automatizada após a integração do Pull Request de publicação.

O registro de uma GitHub Release não implica, por si só, a geração de builds Android ou a distribuição do aplicativo.

Essas atividades pertencem ao processo de build e distribuição definido separadamente pela equipe.

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
