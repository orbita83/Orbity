# Identidade e propriedade do aplicativo Orbity

> Origem: T0009 — issue [#75](https://github.com/orbita83/Orbity/issues/75) do [EP-0000](../03-backlog/epics/EP-0000.md).

## 1. Status e escopo

**Status:** Proposta — aguardando aprovação da equipe.

Este documento é a referência central das decisões de identidade de distribuição e de propriedade administrativa do Orbity. Ele **registra decisões**; não altera configurações do aplicativo nem cria, paga, verifica ou transfere contas de serviços externos.

Enquanto um campo estiver marcado como `Pendente` ou `Proposto` na [Seção 10](#10-registro-de-decisões), ele **não** deve ser aplicado em configurações técnicas nem utilizado em cadastros externos.

**Fora do escopo** (tratado em outras tarefas do EP-0000):

| Atividade | Responsável |
| --------- | ----------- |
| Alterar `app.json` ou `package.json` | T0010 — [#76](https://github.com/orbita83/Orbity/issues/76) |
| Configurar o EAS CLI e os perfis de build (`eas.json`) | T0011 — [#77](https://github.com/orbita83/Orbity/issues/77) |
| Gerar builds Android e configurar a assinatura | T0012 — [#78](https://github.com/orbita83/Orbity/issues/78) |
| Auditar requisitos técnicos e políticas da Google Play | T0013 — [#79](https://github.com/orbita83/Orbity/issues/79) |
| Definir a política completa de versões e releases | T0014 — [#80](https://github.com/orbita83/Orbity/issues/80) |

Também estão fora do escopo: registrar ou publicar o aplicativo na Google Play, implementar funcionalidades de produto e definir distribuição iOS ou Web, que não fazem parte do escopo atual do produto.

## 2. Estado atual verificado

Verificação realizada em 05/11/2026 na branch `development`.

| Item | Situação | Evidência |
| ---- | -------- | --------- |
| Nome do aplicativo | `Orbity` | `app.json` → `expo.name` |
| Slug do projeto Expo | `orbity` | `app.json` → `expo.slug` |
| Versão declarada | `1.0.0` | `app.json` → `expo.version`; `package.json` → `version` |
| Esquema de URL | `orbity` | `app.json` → `expo.scheme` |
| Nome do pacote npm | `orbity` | `package.json` → `name` |
| Identificador Android | **Ausente** | `app.json` não declara `expo.android.package` |
| Número de build Android | **Ausente** | `app.json` não declara `expo.android.versionCode` |
| Proprietário Expo | **Ausente** | `app.json` não declara `expo.owner` |
| Vínculo com projeto EAS | **Ausente** | `app.json` não declara `expo.extra.eas.projectId`; não existe `eas.json` |
| EAS CLI no projeto | **Ausente** | `package.json` não declara `eas-cli` |
| Repositório GitHub | Organização `orbita83` | URL do repositório e `.github/CODEOWNERS` |
| Plataforma de distribuição | Android, via Google Play Store | [`design-system/README.md`](../../design-system/README.md) |

Não foram encontrados, no repositório, registros anteriores de decisões sobre propriedade de contas ou publicação. A existência de um projeto Expo/EAS ou de uma conta Google Play Console criados fora do repositório **não foi confirmada** e deve ser informada pela equipe antes da aprovação.

## 3. Identidade do aplicativo

A identidade de distribuição é composta por identificadores com finalidades diferentes, que não devem ser confundidos:

| Identificador | Finalidade | Pode mudar após a publicação? |
| ------------- | ---------- | ----------------------------- |
| Nome exibido (`expo.name`) | Nome apresentado aos usuários no aparelho | Sim |
| Slug Expo (`expo.slug`) | Identifica o projeto no ecossistema Expo | Sim, com impacto no vínculo com o projeto EAS |
| Pacote Android (`expo.android.package`) | Identificador técnico único do aplicativo no Android e na Google Play | **Não** — após o primeiro envio à Google Play, o identificador não pode ser alterado |
| `versionName` (`expo.version`) | Versão apresentada ao usuário | Sim, a cada versão |
| `versionCode` (`expo.android.versionCode`) | Número interno e crescente de cada build Android | Sim, sempre crescente |
| Versão do pacote npm (`package.json` → `version`) | Versão do projeto JavaScript/Node.js | Sim |

A estratégia de relação entre essas versões é responsabilidade da T0010 e da T0014, conforme a [Seção 4.3 do `CONTRIBUTING.md`](../../CONTRIBUTING.md#43-política-de-versionamento).

### 3.1. Requisitos de formato do pacote Android

O identificador escolhido deve:

- Possuir ao menos dois segmentos separados por ponto.
- Iniciar cada segmento com uma letra.
- Utilizar apenas letras, dígitos e sublinhado (`_`) em cada segmento.
- Não utilizar palavras reservadas da linguagem Java como segmento.
- Ser único na Google Play.

Por convenção, utiliza-se o domínio reverso de um espaço de nomes controlado pela equipe, para reduzir o risco de conflito com outros desenvolvedores.

### 3.2. Candidatos ao pacote Android

| Candidato | Justificativa | Observação |
| --------- | ------------- | ---------- |
| `io.github.orbita83.orbity` | Deriva da organização GitHub `orbita83`, um espaço de nomes já controlado pela equipe e verificável publicamente. | **Recomendado** para avaliação. |
| `com.orbita83.orbity` | Formato mais curto e comum. | A equipe não possui o domínio `orbita83.com`; o espaço de nomes não é verificável. |

Em 05/11/2026, nenhum dos candidatos possuía página publicada na Google Play (resposta HTTP 404 em `https://play.google.com/store/apps/details?id=<pacote>`).

Nenhum candidato está aprovado. Antes da aprovação, o responsável deve:

1. Confirmar que o candidato atende aos requisitos da [Seção 3.1](#31-requisitos-de-formato-do-pacote-android).
2. Verificar a inexistência de aplicativo publicado com o mesmo identificador, acessando `https://play.google.com/store/apps/details?id=<pacote>`. A ausência de página publicada não garante disponibilidade, pois aplicativos não publicados ou removidos podem reservar o identificador; a confirmação definitiva ocorre na criação do aplicativo no Google Play Console.
3. Registrar a data da verificação e a aprovação na [Seção 10](#10-registro-de-decisões).

O identificador deve ser aprovado **antes** do cadastro definitivo do aplicativo na Google Play e antes de sua aplicação no `app.json` pela T0010.

## 4. Propriedade do projeto Expo/EAS

### 4.1. Opções

| Opção | Vantagens | Riscos |
| ----- | --------- | ------ |
| Conta individual de um integrante | Configuração imediata. | O projeto fica vinculado a uma pessoa; a saída do integrante exige transferência e pode interromper builds. |
| **Organização Expo** | Projeto pertence à organização; permite vários administradores com papéis definidos; sobrevive à saída de integrantes. | Exige que um integrante crie a organização e convide os demais. |

**Proposta:** utilizar uma organização Expo como proprietária do projeto, evitando dependência exclusiva de uma conta pessoal. A decisão permanece pendente de aprovação.

### 4.2. Regras propostas

- A organização deve possuir **ao menos dois** integrantes com papel administrativo (`Owner` ou `Admin`).
- Os demais integrantes recebem o menor papel necessário para suas atividades (por exemplo, `Developer` para executar builds ou `Viewer` para consulta).
- Convites, alterações de papel e remoções são realizados exclusivamente pelo painel oficial da organização Expo, por um administrador.
- O vínculo do repositório com o projeto EAS (`extra.eas.projectId` e `owner`) somente será configurado pela T0011, após a aprovação desta seção.

As denominações e permissões de cada papel devem ser confirmadas na documentação oficial da Expo na data da configuração.

## 5. Propriedade da publicação na Google Play

### 5.1. Opções

| Opção | Características gerais | Pontos a confirmar |
| ----- | ---------------------- | ------------------ |
| Conta pessoal | Vinculada a uma pessoa física, que se torna titular legal da conta. | Requisitos de verificação de identidade e exigências de teste antes do acesso à produção aplicáveis a contas pessoais novas. |
| Conta de organização | Vinculada a uma pessoa jurídica. | Exigência de registro da organização (como número D-U-N-S) e viabilidade para um projeto acadêmico. |

Os requisitos de cadastro, taxa de registro, verificação, elegibilidade e acesso à produção **devem ser confirmados na [Ajuda oficial do Google Play Console](https://support.google.com/googleplay/android-developer/) na data da decisão**. Nenhum desses requisitos está considerado cumprido por este documento. A auditoria completa é responsabilidade da T0013.

### 5.2. Titular e colaboradores

- **Titular da conta:** pessoa física ou jurídica responsável legal pela conta e pelos aplicativos publicados. Apenas o titular pode transferir aplicativos ou encerrar a conta.
- **Usuários convidados:** integrantes que recebem permissões específicas no Google Play Console (por exemplo, gerenciar versões de teste ou responder a avaliações), sem se tornarem titulares.

O titular deve convidar os demais responsáveis pelo mecanismo oficial de usuários e permissões do Google Play Console, em vez de compartilhar suas credenciais.

### 5.3. Pendências

- [ ] Definir o tipo de conta (pessoal ou organização).
- [ ] Definir o titular da conta.
- [ ] Confirmar requisitos vigentes de cadastro, verificação e acesso à produção.
- [ ] Confirmar a viabilidade administrativa e financeira da conta escolhida.
- [ ] Definir os integrantes convidados e suas permissões.

## 6. Limites entre GitHub, Expo/EAS e Google Play Console

| Serviço | O que controla | Quem administra |
| ------- | -------------- | --------------- |
| GitHub (`orbita83/Orbity`) | Código-fonte, documentação, Issues, Pull Requests e CI. | Administradores da organização `orbita83` |
| Expo/EAS | Projeto Expo, builds na nuvem e credenciais de assinatura gerenciadas pelo EAS. | Proprietário do projeto Expo (Seção 4) — **pendente** |
| Google Play Console | Cadastro do aplicativo, versões publicadas, faixas de teste, ficha da loja e políticas. | Titular da conta Google Play (Seção 5) — **pendente** |

Administrar o repositório GitHub **não** confere, automaticamente, propriedade ou acesso às contas Expo/EAS ou Google Play Console. Cada serviço possui titularidade e controle de acesso independentes, que devem ser definidos e registrados separadamente.

## 7. Responsabilidades e governança

| Papel | Atribuições | Responsável |
| ----- | ----------- | ----------- |
| Titular da conta Google Play | Responsabilidade legal pela conta; convites e permissões no Google Play Console. | Pendente |
| Administradores Expo/EAS | Administração da organização e do projeto Expo; convites e remoções. | Pendente |
| Responsável técnico pelos builds | Configuração e manutenção dos perfis de build Android. | Pendente |
| Responsável pelas credenciais de assinatura | Guarda, backup e recuperação das credenciais de assinatura, sem documentar seus valores. | Pendente |
| Aprovação de releases e submissões | Aprovação das versões enviadas à Google Play. | Pendente |

**Alteração destas definições:** qualquer mudança de proprietário, responsável ou identificador deve ser proposta por Pull Request que atualize este documento, aprovada conforme o fluxo de revisão do [`CONTRIBUTING.md`](../../CONTRIBUTING.md) e registrada na [Seção 10](#10-registro-de-decisões).

**Dados pessoais:** este documento identifica responsáveis apenas por seus usuários GitHub. E-mails, telefones, documentos pessoais e dados de pagamento não devem ser registrados no repositório.

## 8. Segurança e controle de acesso

- É proibido versionar senhas, tokens de acesso, chaves privadas, keystores, arquivos de conta de serviço ou qualquer outra credencial no Git. O `.gitignore` já ignora `*.jks`, `*.p8`, `*.p12`, `*.key`, `*.pem` e arquivos `.env`; outros formatos de credencial devem ser avaliados pela T0012.
- Os acessos são concedidos conforme o princípio do menor privilégio: cada integrante recebe apenas as permissões necessárias às suas responsabilidades.
- Os acessos devem ser concedidos exclusivamente pelos mecanismos oficiais de convite e permissões de cada plataforma. O compartilhamento informal de senhas ou tokens entre integrantes é proibido.
- As contas administrativas devem utilizar verificação em duas etapas.
- As credenciais de assinatura Android deverão ser administradas por mecanismo seguro definido pela T0012, com responsável registrado na [Seção 7](#7-responsabilidades-e-governança).

### 8.1. Solicitação e revogação de acesso

1. O integrante abre uma Issue do tipo `chore` descrevendo o serviço, o papel solicitado e a justificativa, sem incluir dados sensíveis.
2. Um administrador do serviço avalia a solicitação e concede o acesso pelo mecanismo oficial da plataforma.
3. A revogação segue o mesmo fluxo e é obrigatória quando o integrante deixar a equipe ou não precisar mais do acesso.

## 9. Continuidade e recuperação administrativa

Quando um responsável deixar a equipe ou suas atribuições mudarem:

1. Designar e aprovar o substituto por Pull Request que atualize este documento.
2. Conceder ao substituto o papel administrativo necessário em cada serviço antes de remover o responsável anterior.
3. Transferir a titularidade, quando aplicável, pelos procedimentos oficiais da Expo e do Google Play Console.
4. Revogar os acessos do responsável anterior em todos os serviços.
5. Revisar os meios de recuperação das contas administrativas (verificação em duas etapas e contatos de recuperação), sem registrá-los no repositório.

Para reduzir o risco de perda de acesso, cada serviço deve manter ao menos dois integrantes com acesso administrativo, quando a plataforma permitir.

## 10. Registro de decisões

Legenda de status: `Confirmado` (verificado no código), `Proposto` (recomendação aguardando aprovação) e `Pendente` (sem proposta definida).

| Decisão | Valor | Status | Responsável | Data |
| ------- | ----- | ------ | ----------- | ---- |
| Nome oficial | `Orbity` | Confirmado no código; aprovação para distribuição pendente | Pendente | — |
| Slug Expo | `orbity` | Confirmado no código; aprovação para distribuição pendente | Pendente | — |
| Pacote Android | `io.github.orbita83.orbity` (Seção 3.2) | Proposto | Pendente | — |
| Proprietário Expo/EAS | Organização Expo (Seção 4) | Proposto | Pendente | — |
| Proprietário Google Play | Tipo de conta e titular (Seção 5) | Pendente | Pendente | — |
| Administração técnica | Responsáveis pelos builds e configurações (Seção 7) | Pendente | Pendente | — |
| Administração de publicação | Responsáveis pela submissão e manutenção (Seção 7) | Pendente | Pendente | — |
| Controle de acesso | Procedimento da Seção 8.1 | Proposto | Pendente | — |
| Continuidade | Procedimento da Seção 9 | Proposto | Pendente | — |
| Aprovação | Aprovação da equipe | Pendente | Pendente | — |

## 11. Pendências para desbloquear as próximas tarefas

| Tarefa | Depende de |
| ------ | ---------- |
| T0010 — [#76](https://github.com/orbita83/Orbity/issues/76) | Pacote Android aprovado; nome e slug aprovados. |
| T0011 — [#77](https://github.com/orbita83/Orbity/issues/77) | Proprietário Expo/EAS aprovado e criado; administradores definidos; T0010 integrada. |
| T0013 — [#79](https://github.com/orbita83/Orbity/issues/79) | Tipo e titular da conta Google Play definidos; responsáveis pela publicação definidos. |

## 12. Referências

**Documentação do Orbity:**

- [EP-0000 — Fundação do Orbity](../03-backlog/epics/EP-0000.md)
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md)
- [`AGENTS.md`](../../AGENTS.md)
- [`design-system/README.md`](../../design-system/README.md)
- [`app.json`](../../app.json) e [`package.json`](../../package.json)

**Documentação oficial:**

- [Expo — Configuração do aplicativo](https://docs.expo.dev/versions/latest/config/app/)
- [Expo — EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo — Contas e organizações](https://docs.expo.dev/accounts/account-types/)
- [Android — Configurar o ID do aplicativo](https://developer.android.com/build/configure-app-module#set-application-id)
- [Google Play Console — Ajuda oficial](https://support.google.com/googleplay/android-developer/)
