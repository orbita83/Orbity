# Preparação e submissão à Google Play

> Origem: T0015 — issue [#81](https://github.com/orbita83/Orbity/issues/81) do [EP-0000](../03-backlog/epics/EP-0000.md).

## 1. Escopo

Este guia explica o caminho entre o AAB gerado pelo EAS e uma versão disponível na Google Play. Ele **não autoriza nem executa** envios: a submissão é manual e feita pelo responsável definido na T0009. Também não há submissão automática (EAS Submit ou equivalente) configurada no projeto.

As etapas do Google Play Console mudam com frequência. Antes de cada envio, confira o fluxo na [Ajuda oficial do Play Console](https://support.google.com/googleplay/android-developer/). Os requisitos de conta, política e nível de API são auditados pela T0013 — [#79](https://github.com/orbita83/Orbity/issues/79) e não são repetidos aqui.

## 2. Três aprovações diferentes

| Aprovação | Quem decide | O que significa |
| --------- | ----------- | --------------- |
| Pull Request de release (`development` → `main`) | Revisores do repositório ([`CONTRIBUTING.md` — Seção 4.5](../../CONTRIBUTING.md#45-critérios-de-aprovação-de-releases)) | O código da versão está estável e tem tag `vX.Y.Z` |
| Envio da versão no Play Console | Responsável pela aprovação de releases e submissões ([T0009 — Seção 7](./identidade-e-propriedade.md#7-responsabilidades-e-governança)) | A equipe decidiu disponibilizar o AAB em uma faixa da loja |
| Revisão do Google | Google | O aplicativo atende às políticas da loja |

Aprovar o PR de release **não** equivale a aprovar o envio, e enviar **não** equivale a ser aprovado pelo Google.

## 3. Pré-requisitos

- [ ] Conta Google Play Console criada e verificada pelo titular ([T0009 — Seção 5](./identidade-e-propriedade.md#5-propriedade-da-publicação-na-google-play)).
- [ ] Aplicativo criado no Play Console com o pacote `io.github.orbita83.orbity`. O pacote não pode mudar depois do primeiro envio ([T0009 — Seção 3.3](./identidade-e-propriedade.md#33-validação-do-pacote-aprovado)).
- [ ] Requisitos de conta, políticas e nível de API conferidos pela T0013 — [#79](https://github.com/orbita83/Orbity/issues/79).
- [ ] Para envio a faixas abertas ou produção: versão aprovada pelo fluxo de release, com tag `vX.Y.Z` na `main` ([`CONTRIBUTING.md` — Seção 4.7](../../CONTRIBUTING.md#47-convenções-de-git-tags-e-github-releases)).
- [ ] AAB do perfil `production` gerado a partir do commit da versão, com build `FINISHED` no EAS.

## 4. Localizar e conferir o AAB

1. Gere o build `production` pelo workflow **EAS Build Android** ([`build-sob-demanda.md`](./build-sob-demanda.md)) ou localmente ([`assinatura-e-builds-android.md` — Seção 6.2](./assinatura-e-builds-android.md#62-produção-aab)).
2. Pelo resumo da execução, abra a página do build no EAS. O responsável pela conta Expo baixa o `.aab` e o entrega ao titular da conta Google Play por um canal privado. O arquivo nunca é anexado a Issues, PRs ou ao repositório.
3. Antes de enviar, confira na página do build:

| Campo | Deve ser |
| ----- | -------- |
| Pacote (*Application identifier*) | `io.github.orbita83.orbity` |
| Versão (`appVersion`) | A versão `X.Y.Z` aprovada |
| `versionCode` (`appBuildVersion`) | Maior que o de qualquer AAB já enviado ao Play Console ([`versionamento-do-app.md`](./versionamento-do-app.md)) |
| Commit | O commit da tag `vX.Y.Z` (ou o commit combinado, para testes internos) |
| Perfil / distribuição | `production` / `STORE` |

O Play Console recusa um AAB com `versionCode` já usado, mesmo que o envio anterior tenha sido descartado. Como o workflow não incrementa versões, o `versionCode` deve ser atualizado no `app.json` durante a preparação da release ([`CONTRIBUTING.md` — Seção 4.6](../../CONTRIBUTING.md#46-política-de-versionamento-e-alinhamento-com-android)).

## 5. Etapas gerais no Play Console

Executadas pelo titular da conta ou por um integrante convidado com a permissão correspondente:

1. **Conteúdo do app:** preencher os formulários obrigatórios (política de privacidade, segurança dos dados, classificação de conteúdo, público-alvo, anúncios, entre outros). A lista vigente aparece no painel do app.
2. **Ficha da loja:** nome, descrições, ícone, capturas de tela e categoria.
3. **Criar uma versão na faixa escolhida** (Seção 6) e enviar o AAB.
4. **Assinatura de apps:** no primeiro envio, o Play App Signing é ativado. A chave do EAS passa a ser a chave de upload ([`assinatura-e-builds-android.md` — Seção 3.3](./assinatura-e-builds-android.md#33-dois-sha-1-chave-de-upload-e-chave-da-google-play)).
5. **Notas da versão:** basear-se nas notas da GitHub Release correspondente.
6. **Revisar e enviar:** corrigir os erros e avisos indicados pelo Play Console e enviar para revisão.

## 6. Faixas de teste e produção

| Faixa | Uso no Orbity |
| ----- | ------------- |
| Teste interno | Validação rápida com um grupo pequeno da equipe |
| Teste fechado | Testadores convidados. Para contas pessoais novas, é pré-requisito do acesso à produção ([`assinatura-e-builds-android.md` — Seção 7](./assinatura-e-builds-android.md#7-apk--aab)) |
| Teste aberto | Qualquer pessoa pode entrar no teste pela loja |
| Produção | Disponível para todos os usuários; só após o requisito de teste fechado e a release aprovada |

A [`CONTRIBUTING.md` — Seção 4.3](../../CONTRIBUTING.md#43-critérios-para-a-primeira-versão-estável-v010) prevê distribuição gradual da `v0.1.0`, começando pelo teste fechado.

## 7. Acompanhar o resultado

- **Visão geral da publicação** (*Publishing overview*) e o painel do app mostram o status da revisão e as pendências.
- Rejeições e avisos de política chegam pela **Caixa de entrada** do Play Console e pelo e-mail do titular.
- Registre o resultado do envio (faixa, versão, `versionCode`, data e status da revisão) na GitHub Release ou na Issue de acompanhamento da versão, sem dados pessoais nem credenciais.

## 8. Referências

- [Google Play Console — Ajuda oficial](https://support.google.com/googleplay/android-developer/)
- [Google Play — Configurar testes abertos, fechados ou internos](https://support.google.com/googleplay/android-developer/answer/9845334)
- [Google Play — Requisitos de teste para contas pessoais novas](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play — Assinatura de apps do Google Play](https://support.google.com/googleplay/android-developer/answer/9842756)
- [Expo — Enviar para a Google Play](https://docs.expo.dev/submit/android/)
