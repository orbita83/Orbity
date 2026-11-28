# Auditoria de prontidão para a Google Play

> Origem: T0013 — [Issue #79](https://github.com/orbita83/Orbity/issues/79), [EP-0000](../03-backlog/epics/EP-0000.md).

## 1. Escopo, referência e conclusão

**Complemento de 28/11/2026 — #176:** o [registro da política de privacidade](./politica-de-privacidade.md) documenta HTML preparado, contato e manutenção aprovados e acesso implementado em Configurações. GP17/GP18 abaixo recebem atualização limitada a essa entrega; os demais resultados e contagens históricos permanecem no recorte original. A URL pública, a navegação externa em Android, a revisão final e o vínculo no Console não foram comprovados, portanto os requisitos não foram aprovados.

Auditoria documental realizada em **20/11/2026**, por Codex, para revisão da equipe Orbity. Revisão humana e aprovação: **pendentes**, conforme [CONTRIBUTING.md](../../CONTRIBUTING.md). Não autoriza envio, teste fechado, acesso à produção ou publicação.

Referência de código: `d6e03f720145de81a14d475b7476f39767e0bf16`, na branch `docs/t0013-auditoria-google-play`. Na consulta inicial de 20/11/2026, a API GitHub confirmou esse mesmo SHA na `development` remota. Na revisão final, a referência `origin/development` avançou para `aa241a18047928795b1a309a45edb63536fc824d` (PR #156); esta branch não foi mesclada nem sua referência de código reavaliada como se já contivesse essas mudanças. `git ls-remote` falhou por resolução de rede; a confirmação foi feita pelo conector, sem mudar a base. A árvore estava limpa antes desta documentação.

**Prontidão técnica e administrativa não comprovada.** Há ausência confirmada de política de privacidade acessível na implementação consultada, falha histórica de instalação do APK sem diagnóstico e verificações essenciais do AAB e do Play Console ainda pendentes. Não foi comprovada incompatibilidade do AAB. A ausência de defeito confirmado no AAB não prova conformidade.

Não foram alterados código, dependências, configurações, credenciais ou decisões administrativas. Nenhum build, APK derivado, upload ou publicação foi gerado nesta entrega. As issues #176 e #177 foram criadas separadamente por autorização do operador; seus estados não são alterados pela auditoria. Artefatos e credenciais não devem ser anexados ao repositório público.

## 2. Evidências e predecessoras

| ID | Evidência consultada | Constatação e limite |
| --- | --- | --- |
| E01 | [Identidade e propriedade](./identidade-e-propriedade.md), [PR #106](https://github.com/orbita83/Orbity/pull/106) | Decisões da T0009 integradas em `ea29b08`. Conta pessoal Play e titular definidos; registro histórico, anterior à confirmação do titular atual em E11; elegibilidade integral não comprovada. |
| E02 | [Versionamento](./versionamento-do-app.md), [PR #107](https://github.com/orbita83/Orbity/pull/107), [app.json](../../app.json), [package.json](../../package.json), [lockfile](../../package-lock.json) | T0010 integrada em `ef44d0d`. Configuração atual: pacote `io.github.orbita83.orbity`, nome Orbity, versão `0.1.0`, código `1`. Valores declarados, não extraídos do AAB. |
| E03 | [EAS](./eas-build.md), [PR #110](https://github.com/orbita83/Orbity/pull/110), [eas.json](../../eas.json) | T0011 integrada em `65f356c`. Perfil production solicita app-bundle; versão local, sem autoIncrement. Validação EAS de 09/11/2026 é histórica. |
| E04 | [Assinatura e builds, seção 10](./assinatura-e-builds-android.md#10-registro-de-validação-t0012), [PR #119](https://github.com/orbita83/Orbity/pull/119) | T0012 integrada em `fbb3eae`, com pendências expressas: APK não instalado; AAB solicitado. A confirmação posterior de geração está em E10, ainda fora da development. Fechamento da #78 não substitui evidência dos critérios. |
| E05 | [Build development](https://expo.dev/accounts/mailsons/projects/orbity/builds/394582b2-5ca0-42fa-942c-8f5ded32cfb9) | Geração concluída segundo E04 em 10/11/2026; instalação e abertura não validadas. |
| E06 | [Build production](https://expo.dev/accounts/mailsons/projects/orbity/builds/1a321ab4-c93e-4bd2-8cbb-f89c5a66fee8) | Página inacessível pela ferramenta web nesta auditoria; confirmação posterior do proprietário em E10: FINISHED, production, .aab, versão 0.1.0 e versionCode 1. Sem arquivo AAB disponível para inspeção nesta sessão. |
| E07 | [Persistência](../../src/di/persistence.ts), [migrações](../../src/infra/database/migrations.ts), [ADR-0001](../05-architecture/decisions/ADR-0001.md) | SQLite local: tarefas (título, descrição, datas, horários, categoria, estado), rotinas, vínculos e registros de conclusão. Não comprova ausência de transmissão por SDK ou backup do Android. |
| E08 | [Container](../../src/di/container.ts), [perfil em memória](../../src/infra/datasources/memoryProfileDataSource.ts), [configurações](../../src/view/settings.tsx), rotas em `src/app/` | Perfil em memória com fixture; configurações usam tela provisória. Sem fluxo de autenticação/criação de conta ou política de privacidade encontrado. Busca por privacidade, login, cadastro, fetch, axios, analytics, sentry e URLs em código de produto não encontrou integrações; não equivale a inspeção do binário. |
| E09 | [Workflow EAS](../../.github/workflows/eas-build.yml), [guia](./build-sob-demanda.md), [submissão](./submissao-google-play.md) | Build manual e separado de submissão; guia registra validações operacionais pendentes. Nenhum workflow foi acionado. |
| E10 | [PR #178](https://github.com/orbita83/Orbity/pull/178), [registro proposto no commit 5f878137](https://github.com/orbita83/Orbity/blob/5f878137e44548e89a23b5ffeedb1d4086b2ae82/docs/08-distribution/assinatura-e-builds-android.md) | Confirmação de @MailsonSousa88 em 20/11/2026 por consulta EAS: build `1a321ab4-c93e-4bd2-8cbb-f89c5a66fee8`, status FINISHED, perfil production, artefato .aab, versão 0.1.0 e versionCode 1. PR aberto, não integrado à development no recorte consultado. O SHA citado é do registro documental, não o commit de origem do build. |
| E11 | Confirmações do titular @Cassiosampaio2016 ao operador desta auditoria em 20/11/2026; contexto registrado na [#177](https://github.com/orbita83/Orbity/issues/177) | Conta pessoal adquirida e utilizada pelo titular; identidade verificada conforme notificação relatada no Play Console; app ainda não cadastrado. Não houve consulta direta do Console pelo auditor nem cópia sanitizada da notificação nesta sessão. Dispositivo, data de criação e acesso à produção seguem sem comprovação. |
| E12 | [#176](https://github.com/orbita83/Orbity/issues/176) e [#177](https://github.com/orbita83/Orbity/issues/177) | Encaminhamentos de política pública/no app e preparação administrativa. A criação das issues comprova rastreabilidade, não resolução. |

**Proveniência das novas evidências:** E10 é uma confirmação documental verificável do proprietário, suficiente para registrar geração/perfil/formato do AAB; não é inspeção independente do arquivo. Sua incorporação ao registro oficial de builds depende da integração do PR #178 à development. O arquivo daquele PR não foi alterado nesta branch. E11 é informação confirmada pelo titular, com limite de comprovação indicado; não é certificado de elegibilidade da conta. A divergência histórica de titularidade em E01 será formalizada pela #177. A aprovação de releases/submissões não é transferida automaticamente ao titular atual.

As quatro issues #75–#78 constavam fechadas na consulta GitHub; os quatro commits de integração acima são ancestrais da referência auditada. Os PRs foram consultados integralmente e constam integrados; não se infere cumprimento integral dos critérios da T0012 a partir do merge. Relatos antigos de dependências no PR #110 não foram tratados como diagnóstico atual.

Foram consultados também AGENTS.md, CONTRIBUTING.md, scripts/conventions.cjs, ARCHITECTURE.md, RULES.md, o índice de distribuição e o Design System para contexto de plataforma/público. O README raiz contém apenas `@README`; nenhuma decisão da auditoria depende dele. As fontes específicas de distribuição e o código sustentam as decisões aqui registradas, sem inventar convenções ausentes.

## 3. Fontes oficiais e vigência

Todas consultadas em **20/11/2026**. Páginas dinâmicas sem versão editorial estável: a data de consulta identifica o recorte, não uma garantia de vigência futura. Quando não identificada, a data de revisão editorial permanece não informada. Reconsultar antes do envio.

| ID | Fonte oficial | Regra ou uso nesta auditoria |
| --- | --- | --- |
| F01 | [Nível de API](https://support.google.com/googleplay/android-developer/answer/11926878) | Novos apps/atualizações mobile: API 36 ou superior desde 31/08/2026; extensão anunciada até 01/11/2026 já passada. Exceções de outras plataformas não presumidas para Orbity. |
| F02 | [Páginas de 16 KB](https://developer.android.com/guide/practices/page-sizes) | Suporte para apps com destino API 35+ em dispositivos 64 bits; texto consultado anuncia bloqueio de atualizações incompatíveis em 01/02/2027. Confirmar tratamento do primeiro envio no Console; não presumir dispensa atual. |
| F03 | [Arquiteturas 64 bits](https://developer.android.com/google/play/requirements/64-bit) | Verificar bibliotecas nativas e ABIs entregues. |
| F04 | [Assinatura Play](https://support.google.com/googleplay/android-developer/answer/9842756) | Diferenciar certificado de upload e assinatura de distribuição gerenciada pelo Google. |
| F05 | [Versionamento Android](https://developer.android.com/studio/publish/versioning) | Conferir versão, código crescente e compatibilidade mínima. |
| F06 | [Permissões sensíveis](https://support.google.com/googleplay/android-developer/answer/16558241) | Menor acesso necessário e justificativa funcional. Avisos futuros de 2027 não foram tratados como obrigação já vigente. |
| F07 | [Dados do usuário](https://support.google.com/googleplay/android-developer/answer/10144311) | Política pública e acesso dentro do app, práticas de dados, retenção/exclusão e divulgação/consentimento quando cabíveis. |
| F08 | [Segurança dos dados](https://support.google.com/googleplay/android-developer/answer/10787469) | Considerar SDKs; formulário também para apps sem coleta. Exceção para atividade exclusivamente em teste interno não cobre teste fechado/produção. Histórico editorial visível inclui 05/12/2023; não é tomado como revisão integral atual. |
| F09 | [Exclusão de conta](https://support.google.com/googleplay/android-developer/answer/13327111) | Se houver criação de conta, disponibilizar solicitação dentro e fora do app; responder questões aplicáveis de exclusão no formulário. |
| F10 | [Cadastro Play Console](https://support.google.com/googleplay/android-developer/answer/6112435) | Maioridade, contrato, taxa única de US$25, identidade e verificação de dispositivo para conta pessoal; comprovações ficam privadas. |
| F11 | [Testes de contas pessoais](https://support.google.com/googleplay/android-developer/answer/14151465) | Contas criadas após 13/11/2023: 12 testadores com adesão contínua por 14 dias, seguidos de solicitação de acesso à produção; aprovação não automática. |
| F12 | [Preparar revisão](https://support.google.com/googleplay/android-developer/answer/9859455) | Declarações de conteúdo, acesso para revisores, anúncios, público e classificação. |
| F13 | [Famílias](https://support.google.com/googleplay/android-developer/answer/9893335) | Avaliar se o público inclui crianças; ser aplicativo de estudo não define sozinho faixa etária. |
| F14 | [Criar/configurar app](https://support.google.com/googleplay/android-developer/answer/9859152), [metadados](https://support.google.com/googleplay/android-developer/answer/9898842), [imagens](https://support.google.com/googleplay/android-developer/answer/9866151) | Ficha fiel às funcionalidades existentes, idioma, categoria, contato e materiais visuais adequados. |
| F15 | [bundletool](https://developer.android.com/tools/bundletool) | Inspeção e validação do bundle existente; APK assinado pelo Google difere do AAB de upload. |
| F16 | [Expo CNG](https://docs.expo.dev/workflow/continuous-native-generation/) | Projetos nativos podem ser gerados por template, configuração e plugins. Fonte informa atualização em 02/11/2026. Logs/manifesto gerado são necessários para determinar valores efetivos. |
| F17 | [Publicação e estados](https://support.google.com/googleplay/android-developer/answer/9859751) | Aprovação do repositório, autorização da equipe e aprovação Google são etapas distintas. |

## 4. Metadados do AAB e dependências

| Campo do artefato de produção | Resultado real nesta sessão | Referência declarada para comparação futura |
| --- | --- | --- |
| Geração, formato e perfil reportados pelo EAS | Confirmados documentalmente em 20/11/2026: FINISHED / .aab / production | E10, PR #178 aberto; sem inspeção do arquivo |
| Hash SHA-256, tamanho e commit de origem do build | Pendente de verificação | Não fornecidos em E10 |
| Pacote e nome | Pendente de verificação | E02 |
| Versão / versionCode registrados no EAS | Confirmados documentalmente: `0.1.0` / `1` | E10; extração do manifesto e histórico Play ainda pendentes |
| targetSdkVersion / minSdkVersion | Pendente de verificação | Sem override nos manifestos de configuração consultados; não inferidos do SDK Expo |
| compileSdk, AGP, NDK e origem dos valores | Pendente de verificação | Exigem projeto nativo/logs do build de referência |
| Permissões, uses-feature, recursos obrigatórios/opcionais | Pendente de verificação | Sem lista explícita em app.json; isso não significa manifesto vazio |
| Assinatura válida e certificado do AAB | Pendente de verificação | E04 relata keystore remoto e backup; não houve comparação criptográfica nesta sessão |
| Certificado de distribuição Play e adesão ao Play App Signing | Pendente de verificação | Somente Console autorizado comprova ativação e vínculo |
| ABIs, bibliotecas .so, alinhamento ELF/ZIP e execução 16 KB | Pendente de verificação | Exigem artefato e testes específicos |

Configuração atual: Expo `~57.0.30`, React Native `0.86.3`, SQLite `57.0.7` (atualizado de 57.0.5 na [#231](https://github.com/orbita83/Orbity/issues/231)), Reanimated `4.5.1`, Worklets `0.10.1`, Screens `~4.26.0`, Gesture Handler `~2.32.0`, SVG `15.15.4`; demais pacotes e resolução estão em E02. São componentes a inventariar no binário, não prova de suporte a 16 KB ou de segurança. `expo-dev-client` está declarado, mas sua presença no projeto não prova inclusão ou ausência no AAB de produção. Plugins declarados: expo-router, expo-splash-screen e expo-sqlite. Não há Gradle ou AndroidManifest versionados encontrados por `git ls-files`; não foi executado prebuild para criá-los.

Inspeção de dependências locais, com versões instaladas correspondentes ao lockfile: o catálogo `node_modules/react-native/gradle/libs.versions.toml` de React Native 0.86.3 declara minSdk 24, targetSdk/compileSdk 36, NDK 27.1.12297006 e AGP 8.12.0. O manifesto `node_modules/expo-image/android/src/main/AndroidManifest.xml` de expo-image 57.0.5 declara INTERNET, ACCESS_NETWORK_STATE e READ_EXTERNAL_STORAGE limitada a maxSdkVersion 32. Isso identifica valores e origens potenciais no ambiente local, sem demonstrar o SDK do aplicativo, o merge final de permissões ou o conteúdo do AAB histórico. Nenhum arquivo de dependência foi alterado.

O AAB histórico foi solicitado em 10/11/2026 e sua geração foi confirmada documentalmente em 20/11/2026; a base atual contém persistência e funcionalidades posteriores. Mesmo se recuperado, ele não poderá representar automaticamente o comportamento do código atual: primeiro comparar o commit e o lockfile usados no build.

## 5. Checklist de conformidade

Resultados: **Atendido** exige evidência do escopo preciso da linha; **Não atendido** indica ausência ou falha confirmada; **Não aplicável** exige justificativa; **Pendente de verificação** indica evidência insuficiente. Atendimento de configuração não estende atendimento ao artefato. A data de todas as linhas é a data da avaliação, mesmo quando a evidência é histórica.

Responsáveis: @Cassiosampaio2016 coordena #78/#79 e informa titularidade Play em E11; @MailsonSousa88 mantém conta EAS e credenciais. E01 conserva o histórico; formalização da titularidade e confirmação dos demais papéis seguem na #177. Atribuições de conteúdo/privacidade à equipe são propostas de encaminhamento, a confirmar na revisão; não alteram a governança.

| ID | Categoria | Requisito | Fonte oficial | Evidência | Resultado | Pendência | Ação necessária | Responsável | Data |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GP01 | Identidade | Configuração local refletir identidade aprovada | F05, F14 | E01–E02 | Atendido | Nenhuma neste escopo | Preservar e conferir no AAB (GP04) | @MailsonSousa88 | 20/11/2026 |
| GP02 | Versão | Versões locais coerentes e perfil AAB definido | F05, F15 | E02–E03; JSON e lockfile | Atendido | Não comprova versão enviada | Conferir histórico Play e GP04 | @MailsonSousa88 | 20/11/2026 |
| GP03 | Artefato | Confirmar geração, perfil e formato do AAB no registro EAS | F15 | E10: FINISHED, production, .aab; confirmação do proprietário em 20/11 | Atendido | Evidência documental no PR #178 aberto; integridade/commit do arquivo não abrangidos | Acompanhar integração do #178; obter arquivo e rastreabilidade pela #78 | @Cassiosampaio2016; fornecimento EAS @MailsonSousa88 | 20/11/2026 |
| GP04 | Artefato | Pacote e versões reais iguais aos aprovados | F05, F14 | E02; E10 informa versão 0.1.0/código 1, sem manifesto | Pendente de verificação | Pacote e versões não extraídos do AAB | Extrair manifesto e comparar; obter artefato pela #78 e avaliar na #79 | @Cassiosampaio2016 com apoio @MailsonSousa88 | 20/11/2026 |
| GP05 | API | targetSdk efetivo >=36 para envio mobile | F01 | E06; sem override explícito em E02 | Pendente de verificação | targetSdk desconhecido | Extrair uses-sdk; se inferior, planejar correção fora desta issue | @MailsonSousa88 | 20/11/2026 |
| GP06 | Android | Identificar minSdk e suporte real às versões Android | F05 | E04, E06 | Pendente de verificação | minSdk e matriz de execução ausentes | Extrair minSdk e testar versões/dispositivos suportados | @MailsonSousa88 | 20/11/2026 |
| GP07 | Build | Rastrear compileSdk, AGP, NDK e geração nativa | F16 | E02–E03; catálogo local descrito na seção 4; sem nativos versionados | Pendente de verificação | Logs/template do build ausentes | Recuperar logs e configuração gerada sem executar novo build | @MailsonSousa88 | 20/11/2026 |
| GP08 | Arquitetura | Incluir suporte 64 bits nas bibliotecas nativas | F03 | Dependências nativas em E02, AAB indisponível | Pendente de verificação | ABIs e .so desconhecidos | Inventariar bibliotecas e contrapartidas 64 bits | @MailsonSousa88 | 20/11/2026 |
| GP09 | 16 KB | Verificar ELF, empacotamento e execução com páginas 16 KB | F02 | E06 | Pendente de verificação | Sem alinhamento nem teste | Inspecionar bundle/config e .so; obter teste em ambiente 16 KB e diagnóstico Play | @MailsonSousa88 | 20/11/2026 |
| GP10 | Assinatura | Validar assinatura AAB e certificado de upload esperado | F04, F15 | E04 histórico, sem binário | Pendente de verificação | Sem validação criptográfica atual | Verificar assinatura e comparar certificado público com registro autorizado | @MailsonSousa88 | 20/11/2026 |
| GP11 | Integridade | Confirmar Play App Signing e certificado de distribuição | F04 | E01, sem Console | Pendente de verificação | Adesão e certificados Play desconhecidos | Conferir App integrity sem exportar chaves | @Cassiosampaio2016 | 20/11/2026 |
| GP12 | Permissões | Listar e justificar cada permissão e sua origem | F06 | E02, E06; manifesto local expo-image na seção 4 | Pendente de verificação | Manifesto final e merge report ausentes | Mapear permissão → biblioteca/plugin → uso → política; propor remoção das excessivas | @MailsonSousa88 | 20/11/2026 |
| GP13 | Recursos | Avaliar uses-feature e filtragem de dispositivos | F06, F15 | E06 | Pendente de verificação | Recursos e obrigatoriedade desconhecidos | Inspecionar manifesto e catálogo de dispositivos do Console | @MailsonSousa88 | 20/11/2026 |
| GP14 | Qualidade | Comprovar instalação e inicialização do APK development da T0012 | F15; critério da #78 | E04–E05: falha histórica; E10 mantém ausência de evidência | Pendente de verificação | Instalação, abertura e conexão não comprovadas; causa da falha desconhecida | Pela #78, obter diagnóstico e evidência Android; não inferir defeito no AAB | @Cassiosampaio2016; apoio EAS @MailsonSousa88 | 20/11/2026 |
| GP15 | Qualidade | Validar comportamento do artefato destinado à loja | F15, F17 | E06; GP14 não testa AAB | Pendente de verificação | Sem execução de produção/pre-launch report | Obter testes autorizados e diagnósticos; não inferir incompatibilidade pelo APK | @MailsonSousa88 | 20/11/2026 |
| GP16 | Dados | Inventariar coleta, processamento, armazenamento e compartilhamento incluindo SDKs | F07–F08 | E07–E08; inventário parcial local | Pendente de verificação | Sem análise de SDKs, backup, rede e binário histórico | Comparar commit AAB, revisar SDKs e comportamento de produção, retenção e exclusão | @MailsonSousa88 e equipe | 20/11/2026 |
| GP17 | Privacidade | Disponibilizar política/link dentro do app | F07 | [Entrega #176](./politica-de-privacidade.md); `settings.tsx`, `useSettingsViewModel.ts`, caso de uso e adapter de link; testes com dublês | Pendente de verificação | Acesso implementado nesta branch; URL pública e execução externa Android ainda não comprovadas | Revisar/integrar entrega, publicar e comprovar navegação real; não usar abertura do sistema como prova HTTP | Equipe; coordenação @Cassiosampaio2016 | 28/11/2026 |
| GP18 | Privacidade | Política pública adequada vinculada no Console | F07 | [HTML e operação #176](./politica-de-privacidade.md); URL e contato aprovados pelo operador | Pendente de verificação | HTML preparado; publicação, revisão final do conteúdo e vínculo no Console não comprovados | Configurar Pages manualmente, revisar/publicar e verificar URL; vínculo no Console pela #177 | @Cassiosampaio2016 e equipe | 28/11/2026 |
| GP19 | Declaração | Segurança dos dados coerente para teste fechado/produção | F08 | E07–E08; sem formulário Play | Pendente de verificação | Coleta por terceiros e respostas desconhecidas | Concluir inventário, preencher/revisar formulário e questões de exclusão | @Cassiosampaio2016 com apoio técnico | 20/11/2026 |
| GP20 | Consentimento | Divulgação destacada, consentimento e proteção se exigidos | F06–F08 | E07–E08; sem análise do AAB | Pendente de verificação | Aplicabilidade depende de dados/permissões reais | Avaliar acesso sensível/inesperado, transmissão e segurança dos dados | Equipe; apoio @MailsonSousa88 | 20/11/2026 |
| GP21 | Conta do app | Fluxo de exclusão de conta dentro/fora do app para a implementação atual | F09 | E08 e ADR-0001: sem criação de conta/backend | Não aplicável | Justificativa limitada ao código auditado; AAB não identificado | Reavaliar se houver conta ou divergência do binário; GP19 continua necessário | Equipe; revisão @Cassiosampaio2016 | 20/11/2026 |
| GP22 | Conta Play | Comprovar cadastro, identidade, dispositivo e elegibilidade da conta | F10 | E11: titular confirma conta pessoal e identidade verificada; sem inspeção direta | Pendente de verificação | Evidência sanitizada, data de criação, dispositivo e produção ausentes | Pela #177, registrar comprovações separadas; identidade relatada não comprova elegibilidade integral | @Cassiosampaio2016 | 20/11/2026 |
| GP23 | Acessos | Responsáveis convidados com permissões necessárias | F10, F17 | E01 seção 5.3 pendente | Pendente de verificação | Convites/papéis não comprovados | Conferir usuários/permissões, sem compartilhar login | @Cassiosampaio2016 | 20/11/2026 |
| GP24 | Testes Play | Identificar exigência de teste fechado e acesso à produção | F11 | Conta pessoal aprovada, data de criação desconhecida | Pendente de verificação | Aplicabilidade e histórico sem comprovação | Confirmar data; se aplicável, 12 adesões contínuas/14 dias e pedido aprovado | @Cassiosampaio2016 | 20/11/2026 |
| GP25 | Conta organização | Verificações exclusivas de organização/D-U-N-S | F10 | E01: conta pessoal aprovada | Não aplicável | Não é o tipo de conta aprovado | Reavaliar somente se mudar o tipo | @Cassiosampaio2016 | 20/11/2026 |
| GP26 | Conteúdo | Classificação indicativa e formulário de conteúdo | F12 | Sem Console/formulário | Pendente de verificação | Classificação não comprovada | Responder questionário com funcionalidades reais e registrar resultado | @Cassiosampaio2016 e equipe | 20/11/2026 |
| GP27 | Público | Faixa etária e Famílias avaliadas | F12–F13 | Design System define estudantes, sem decisão etária suficiente | Pendente de verificação | Não se pode excluir crianças por suposição | Definir público e conferir regras Famílias, SDKs e conteúdo | Equipe; aprovação @Cassiosampaio2016 | 20/11/2026 |
| GP28 | Conteúdo | Declarar anúncios, acesso do revisor e demais formulários aplicáveis | F12 | E08 sem login/SDK publicitário identificado no código; sem Console | Pendente de verificação | Não confirma ausência no binário ou declarações | Conferir painel de conteúdo, publicidade, permissões restritas e eventuais declarações adicionais | @Cassiosampaio2016 com apoio técnico | 20/11/2026 |
| GP29 | Ficha | Nome, descrições, categoria, idioma, contato e imagens corretos | F14 | Nome aprovado; sem ficha Play comprovada | Pendente de verificação | Descrições, ícone de loja, gráfico, screenshots e contato não aprovados | Preparar materiais do app real e validar limites/dimensões na fonte e Console | Equipe; aprovação @Cassiosampaio2016 | 20/11/2026 |
| GP30 | Cadastro do app | Cadastrar Orbity com identidade aprovada antes da submissão | F14 | E11: titular confirma app ainda não cadastrado | Não atendido | Cadastro do aplicativo não concluído | Concluir cadastro pela #177, sem enviar versão; confirmar pacote e histórico antes de uso do código 1 | @Cassiosampaio2016 | 20/11/2026 |
| GP31 | Diagnósticos | Analisar avisos Play, compatibilidade e relatórios disponíveis | F02–F03, F17 | Sem Console autorizado nesta sessão | Pendente de verificação | Nenhum aviso/relatório consultado | Obter resumo sanitizado por versão/faixa e separar alerta de bloqueio | @Cassiosampaio2016 e @MailsonSousa88 | 20/11/2026 |
| GP32 | Governança | Documentação revisada e envio autorizado separadamente | F17; CONTRIBUTING.md | Este relatório sem revisão humana | Pendente de verificação | Aprovação formal ainda necessária | Revisar evidências e critérios antes de concluir #79; obter autorização específica antes de envio | Equipe e @Cassiosampaio2016 | 20/11/2026 |

## 6. Impedimentos confirmados e riscos não verificados

- **Confirmado, validação técnica:** GP14 registra falha histórica do APK de desenvolvimento relatada pela T0012. O resultado atual permanece pendente de verificação, pois faltam diagnóstico e evidências de instalação e abertura. É impedimento à comprovação daquela validação; não demonstra defeito do AAB ou rejeição da loja. Responsável e ação estão na linha GP14.
- **Confirmado, implementação atual:** GP17 registra ausência de acesso à política de privacidade no código consultado; GP30 registra app ainda não cadastrado por confirmação do titular. A correção exige trabalho próprio; esta issue não altera telas. A existência de política externa segue desconhecida (GP18).
- **Lacuna de evidência do artefato:** GP03 comprova somente geração/perfil/formato documentados no PR #178; GP04–GP13 e GP15 permanecem sem evidências suficientes para aprovar o envio. Target inferior à regra, assinatura inválida, ABI ou alinhamento incompatível são riscos a investigar, não defeitos constatados. Se confirmados, @MailsonSousa88 deve propor correção técnica separada, com versão/build posteriormente autorizados.
- **Pendências administrativas:** GP22–GP24 e GP26–GP31 dependem do titular. A conta pessoal e a identidade verificada foram confirmadas por relato em E11; o app ainda não foi cadastrado. Não se afirma que a conta esteja inelegível. Um teste fechado exigido e não cumprido impede produção, mas não equivale a impedir toda modalidade de teste.
- **Risco temporal:** fonte de 16 KB F02 anuncia 01/02/2027 para bloqueio de atualizações. Não se deve reutilizar datas antigas sem confirmar o enquadramento do primeiro envio; a avaliação técnica continua obrigatória nesta auditoria.
- **Risco de representatividade:** AAB de 10/11 e fonte de 20/11 podem divergir. Declarações de dados, permissões e conteúdo precisam corresponder ao binário efetivamente enviado.

As pendências estão vinculadas às issues #78, #176, #177, #81 e à verificação documental da #79, conforme a tabela abaixo. Nenhum estado de issue foi alterado. Não há aprovação tácita nem autorização para corrigir código, gerar builds ou enviar versões neste relatório.

### Acompanhamento das pendências

| Pendência / requisitos | Evidência ausente | Impacto | Issue e responsável |
| --- | --- | --- | --- |
| AAB: integridade, assinatura, pacote, versões extraídas e commit (GP04/GP10) | Arquivo, hash, manifesto, certificado verificado e commit de origem; E10 só confirma geração | Impede comprovar identidade, assinatura e rastreabilidade do artefato | [#78](https://github.com/orbita83/Orbity/issues/78): @Cassiosampaio2016 coordena; @MailsonSousa88 fornece registros/artefato; [#79](https://github.com/orbita83/Orbity/issues/79) avalia |
| Instalação e abertura Android (GP14) | Diagnóstico detalhado, ambiente e evidência de sucesso | Validação da T0012 não comprovada; não demonstra incompatibilidade do AAB | #78: @Cassiosampaio2016; apoio @MailsonSousa88 |
| SDKs, permissões finais, recursos, ABIs, compatibilidade e 16 KB (GP05–GP09/GP12–GP13/GP15) | Manifestos reais, logs/configuração gerada, .so/alinhamento e testes específicos | Não permite concluir atendimento técnico às exigências da loja | #79: análise e registro por @Cassiosampaio2016, dependente dos artefatos da #78; correções somente após diagnóstico e autorização |
| Política pública e acesso dentro do app (GP17–GP18) | Política/URL revisada e implementação acessível comprovadas | Ausência no código atual impede declarar atendimento à política de privacidade | [#176](https://github.com/orbita83/Orbity/issues/176): equipe, coordenação @Cassiosampaio2016 |
| Cadastro do app, identidade documental, dispositivo e acessos (GP22–GP23/GP30) | Cadastro concluído, referência sanitizada da notificação de identidade e status de dispositivo/papéis | App não cadastrado; identidade verificada relatada não comprova elegibilidade integral | [#177](https://github.com/orbita83/Orbity/issues/177): @Cassiosampaio2016 |
| Testes e produção (GP24) | Data da conta, enquadramento, histórico e decisão de acesso | Pode impedir produção; não implica impedimento de todas as faixas de teste | #177 registra preparação e próximos passos; #79 verifica; testes distribuídos/pedido de produção requerem autorização futura |
| Dados, conteúdo, ficha e diagnósticos Play (GP11/GP16/GP18–GP20/GP26–GP31) | Inventário completo incluindo SDKs/backup, respostas, materiais e relatórios aplicáveis | Não permite validar declarações ou ausência de bloqueios administrativos | #79 audita; #176 produz política; #177 prepara Console e declarações; equipe com apoio técnico de @MailsonSousa88 |
| Automação EAS e operação | Execuções e configuração administrativa comprovadas conforme guia; geração da T0012 não comprova workflow | Não permite declarar automação operacional apenas pela existência do YAML | [#81](https://github.com/orbita83/Orbity/issues/81): @MailsonSousa88; não substitui #78 nem autoriza novos builds |
| Integração da evidência E10 | Merge/revisão do PR #178 ainda ausentes no recorte | Registro novo ainda não faz parte da documentação da development | PR #178, @MailsonSousa88 e revisores; #79 explicita dependência, sem mesclar nem editar seu arquivo |
| Revisão final (GP32) | Aprovação humana e decisão sobre critérios restantes | Entrega documental não autoriza encerrar #79 nem publicar | #79: equipe revisora; governança vigente |

## 7. Evidências necessárias para fechar as verificações

1. **Responsável Expo/EAS:** recuperar o AAB existente e os registros por canal privado; complementar E10 com commit de origem, hash SHA-256 e logs de geração. Status, perfil, formato e versões já foram confirmados documentalmente no PR #178. Não publicar URL direta do arquivo, senhas ou keystore.
2. **Responsável técnico:** em inspeção autorizada do artefato existente, registrar versão das ferramentas e resultados de `bundletool validate`, `bundletool dump manifest --module=base` e `bundletool dump config`; listar módulos adicionais, permissões e recursos de todos os manifestos. Conferir assinatura JAR do AAB com ferramenta apropriada, como `jarsigner -verify`, e comparar certificado público de upload com o registro da T0012, sem acesso à chave privada.
3. **16 KB e Android:** obter inventário de .so/ABIs, alinhamento ELF e empacotamento ZIP conforme F02. PAGE_ALIGNMENT_16K isoladamente não comprova execução. Testes com APKs derivados, emuladores, aparelhos ou nova geração dependem de autorização; nenhum foi executado aqui. Registrar ambiente, tamanho de página, casos exercitados, avisos e resultado. Diagnosticar separadamente o APK development com erro detalhado de instalação.
4. **Titular Play:** complementar GP11, GP18–GP19, GP22–GP24 e GP26–GP31 por resumo datado, com versão/faixa e identificador da evidência privada recuperável pelos autorizados. Para cadastro, informar status e data, sem documentos pessoais, dados financeiros, nomes de testadores ou credenciais. Não é necessário compartilhar login com o agente.
5. **Equipe:** consolidar política, inventário de dados e materiais; revisar conteúdo real, público e respostas; designar revisor humano e registrar aprovação. Reabrir a avaliação se mudar código, SDK, AAB, conta ou política oficial.

## 8. Cobertura dos critérios de aceitação da #79

Numeração abaixo segue a ordem dos 20 critérios na issue. Cobertura documental não significa comprovação técnica do artefato.

| Critério | Evidência/itens | Situação nesta entrega |
| --- | --- | --- |
| 1. Checklist documentado | Seção 5 | Atendido |
| 2. Fontes oficiais datadas | Seção 3 | Atendido |
| 3. API efetiva identificada e comparada | GP05 | Pendente: regra identificada; valor real desconhecido |
| 4. Compatibilidade e bibliotecas avaliadas | GP06–GP09 | Parcial: análise documental; artefato/testes pendentes |
| 5. Permissões reais identificadas e justificadas | GP12–GP13 | Pendente |
| 6. Identidade/versão do AAB correspondentes | GP03–GP04 | Pendente; configuração local conferida |
| 7. Assinatura/integridade verificadas | GP10–GP11 | Pendente; relato histórico não substitui inspeção |
| 8. Situação da conta documentada | E11, GP22–GP23, GP30 | Conta/identidade confirmadas por relato do titular; app não cadastrado; comprovação complementar pendente |
| 9. Testes/acesso à produção conforme conta | GP24 | Regra identificada; aplicabilidade/cumprimento pendentes |
| 10. Políticas de privacidade/dados/conteúdo analisadas | GP16–GP21, GP26–GP28 | Análise registrada; atendimento depende das verificações indicadas |
| 11. Declarações/materiais identificados | GP18–GP19, GP26–GP29 | Atendido quanto ao levantamento; preparação pendente |
| 12. Resultado/evidência/fonte em cada requisito | Seção 5 | Atendido; ausência de evidência indicada explicitamente |
| 13. Não aplicáveis justificados | GP21, GP25 | Atendido no escopo declarado |
| 14. Ações e responsáveis | Seções 5–7 | Atendido quanto ao encaminhamento; atribuições à equipe sujeitas à revisão |
| 15. Impedimentos identificados | Seção 6 | Atendido quanto ao registro; não comprova ausência de outros |
| 16. Sem incompatibilidade conhecida não resolvida que bloqueie envio | GP14, GP17 e lacunas do AAB | Não declarar atendido: falha histórica e privacidade exigem tratamento; AAB não inspecionado |
| 17. Verificações incompletas explícitas | Seções 4–5 | Atendido |
| 18. Prontidão distinta de aprovação/publicação | Seções 1 e 6 | Atendido |
| 19. Ausência de credenciais/dados sensíveis | Evidências referenciadas sem reprodução de segredos | Conferido nesta documentação |
| 20. Revisão e aprovação do projeto | GP32 | Pendente de revisão humana |

**A #79 não deve ser declarada integralmente concluída com base apenas neste documento.** A entrega documental registra o resultado possível com os acessos e evidências disponíveis; os critérios técnicos e a aprovação humana acima permanecem abertos.

## 9. Conclusão da entrega documental

O levantamento documental foi realizado e está preparado para revisão, sem aguardar a resolução de todas as pendências técnicas e administrativas. Existem requisitos não atendidos e não comprovados. O Orbity não deve ser considerado automaticamente pronto para submissão à Google Play. A geração do AAB foi confirmada documentalmente pelo PR #178, ainda aberto; sua inspeção não foi realizada. A resolução das pendências será acompanhada nas issues correspondentes.

O PR desta entrega deve usar **Refs #79**, sem encerramento automático. Concluir esta entrega documental não equivale a satisfazer integralmente os critérios técnicos da #79, obter aprovação da equipe ou certificação da Google Play. Parte das evidências depende da integração do PR #178 à development; revalidar essa situação na revisão, sem fazer merge como parte desta entrega.

## 10. Validação desta entrega documental

Na revisão final de 20/11/2026 foram conferidos 32 IDs únicos, dez campos por linha, destinos e âncoras dos links locais nos três documentos, ausência de espaços finais e `git diff --check` sem erros. Distribuição: 3 Atendidos (identidade/versionamento locais e geração do AAB confirmada documentalmente em E10), 2 Não atendidos (política dentro do app e cadastro Play), 2 Não aplicáveis e 25 Pendentes de verificação.

- `npm run lint`: aprovado.
- `npx --no-install tsc --noEmit`: aprovado.
- `npm test`: primeira execução com 54 suítes aprovadas e 1 com timeout no cenário ConfirmDialog de FeedbackComponents (393 testes aprovados e 1 falho); repetição com `npm test -- --runInBand`: 55 suítes e 394 testes aprovados. Houve avisos de rotas extraneous nos testes de navegação, sem falhas nessa repetição; não foram feitas correções fora do escopo documental.
- `node scripts/verify-local-hooks.mjs`: aprovado fora do sandbox após bloqueio de inicialização do Git/MSYS no ambiente restrito; hooks preservados.
- `node tests/ods-theme.test.cjs`: aprovado.

A branch mantém a referência de código auditada e está atrás de origin/development pelo PR #156. O diff de alterações próprias em relação ao ancestral comum restringe-se aos três documentos da #79; a comparação direta de árvores também mostra mudanças da base que não foram revertidas nem incorporadas nesta entrega. Não houve merge, alteração do arquivo do PR #178, builds Android ou mudanças de credenciais. Os testes do repositório não validam o AAB, a instalação Android ou o estado do Play Console.
