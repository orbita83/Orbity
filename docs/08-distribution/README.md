# Build e distribuição

Esta pasta reúne a documentação de build, assinatura e distribuição Android do Orbity, plataforma principal do produto com distribuição prevista pela Google Play Store (ver [`design-system/README.md`](../../design-system/README.md)).

| Documento | Conteúdo | Origem |
| --------- | -------- | ------ |
| [`identidade-e-propriedade.md`](./identidade-e-propriedade.md) | Identidade de distribuição do aplicativo, propriedade das contas Expo/EAS e Google Play Console, responsáveis, controle de acesso e continuidade administrativa. | T0009 — [#75](https://github.com/orbita83/Orbity/issues/75) |
| [`versionamento-do-app.md`](./versionamento-do-app.md) | Identidade técnica configurada no `app.json`, finalidade dos campos de versão, estratégia do `versionCode` e como atualizar as versões. | T0010 — [#76](https://github.com/orbita83/Orbity/issues/76) |
| [`eas-build.md`](./eas-build.md) | Instalação e autenticação do EAS CLI, perfis Android e vínculo com o projeto EAS autorizado. | T0011 — [#77](https://github.com/orbita83/Orbity/issues/77) |
| [`assinatura-e-builds-android.md`](./assinatura-e-builds-android.md) | Keystore gerenciado pelo EAS, responsáveis, backup e recuperação das credenciais, chave de upload × chave da Google Play, comandos de build, instalação do development client, APK × AAB e registro de validação. | T0012 — [#78](https://github.com/orbita83/Orbity/issues/78) |
| [`build-sob-demanda.md`](./build-sob-demanda.md) | Workflow manual **EAS Build Android** no GitHub Actions: perfis, referências permitidas, environments, `EXPO_TOKEN`, rastreabilidade, diagnóstico de falhas e manutenção. | T0015 — [#81](https://github.com/orbita83/Orbity/issues/81) |
| [`submissao-google-play.md`](./submissao-google-play.md) | Preparação e submissão manual do AAB à Google Play: pré-requisitos, conferência de versão, faixas de teste e acompanhamento da revisão. | T0015 — [#81](https://github.com/orbita83/Orbity/issues/81) |
| [`CONTRIBUTING.md#4-processo-de-publicação-e-governança-de-releases`](../../CONTRIBUTING.md#4-processo-de-publicação-e-governança-de-releases) | Política de governança de versões, releases, critérios de corte para `v0.1.0`, tags Git anotadas, aprovação e hotfixes. | T0014 — [#80](https://github.com/orbita83/Orbity/issues/80) |

## Orientações

- As decisões de identidade e propriedade são registradas **somente** em `identidade-e-propriedade.md`. Os demais documentos devem referenciá-lo, sem copiar ou reinterpretar seus valores.
- A política oficial de versões e releases está centralizada no [`CONTRIBUTING.md` (Seção 4)](../../CONTRIBUTING.md#4-processo-de-publicação-e-governança-de-releases).
- As próximas atividades da frente de build e distribuição do [EP-0000](../03-backlog/epics/EP-0000.md) (T0010 a T0015) devem adicionar seus documentos a esta pasta e a esta tabela.
- Nenhum documento desta pasta pode conter senhas, tokens, chaves privadas, keystores ou outras credenciais.
