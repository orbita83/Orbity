# EAS CLI e perfis de build Android

> Origem: T0011 — issue [#77](https://github.com/orbita83/Orbity/issues/77) do [EP-0000](../03-backlog/epics/EP-0000.md).

## Escopo e estado do vínculo

Este documento descreve a configuração local do EAS CLI e os perfis Android do Orbity. A identidade do aplicativo e o proprietário autorizado estão definidos em [`identidade-e-propriedade.md`](./identidade-e-propriedade.md); a identidade técnica e o versionamento local estão definidos em [`versionamento-do-app.md`](./versionamento-do-app.md).

O EAS CLI, os perfis Android e o vínculo com o projeto EAS autorizado estão configurados.

## Projeto EAS vinculado

| Item | Valor | Onde está configurado |
| ---- | ----- | --------------------- |
| Proprietário | Conta individual Expo de @MailsonSousa88 ([T0009 — Seção 4](./identidade-e-propriedade.md#4-propriedade-do-projeto-expoeas)) | `app.json` → `expo.owner` (`mailsons`) |
| Projeto | `@mailsons/orbity` | `expo.owner` + `expo.slug` |
| ID do projeto | `df3e816f-9b5e-402f-ac46-f7c254a5132b` | `app.json` → `expo.extra.eas.projectId` |
| Pacote Android | `io.github.orbita83.orbity` | `app.json` → `expo.android.package` |

Em 09/11/2026, o proprietário confirmou que o projeto ainda não existia na conta autorizada e o criou com `eas init`. O `projectId` identifica o projeto, mas não é uma credencial e não concede acesso a ele.

Enquanto o projeto pertencer a uma conta individual, somente o proprietário executa builds na nuvem e acessa o painel da Expo ([T0009 — Seção 4.3](./identidade-e-propriedade.md#43-riscos-aceitos-e-regras)). Os demais integrantes podem revisar a configuração no repositório. Se outro integrante precisar desse acesso, aplicam-se os gatilhos de migração para organização ([T0009 — Seção 4.4](./identidade-e-propriedade.md#44-gatilhos-de-migração-para-organização)).

## EAS CLI

O projeto fixa o EAS CLI como dependência de desenvolvimento. Use a versão local do projeto, em vez de depender de uma instalação global:

```bash
npx eas-cli --version
```

`package.json` fixa a versão local em `27.5.0`. Já `cli.version` em `eas.json` é uma faixa semântica de compatibilidade mínima, não um segundo pin: `>= 27.5.0` aceita essa versão e versões futuras. A faixa não atualiza o CLI instalado pelo projeto; para usar outra versão local, atualize a dependência e o lockfile deliberadamente.

Autentique-se somente com a conta Expo autorizada:

```bash
npx eas-cli login
npx eas-cli whoami
```

Não compartilhe credenciais nem grave `EXPO_TOKEN`, senhas ou sessões nos arquivos do repositório. Para CI, o token é fornecido como secret de environment do GitHub ao workflow **EAS Build Android**, conforme [`build-sob-demanda.md`](./build-sob-demanda.md#62-expo_token).

## Perfis Android

Os perfis estão definidos na raiz do repositório em [`eas.json`](../../eas.json):

| Perfil | Finalidade | Artefato/distribuição |
| ------ | ---------- | --------------------- |
| `development` | Depuração usando development client | APK para distribuição interna |
| `preview` | Validação interna sem ferramentas de desenvolvimento | APK para distribuição interna |
| `production` | Preparação para distribuição pela Google Play | Android App Bundle (`.aab`) |

O perfil `development` requer `expo-dev-client` (`~57.0.20`, versão compatível indicada pelo Expo SDK 57 instalado). A primeira configuração dos perfis não gera builds. Builds reais e a configuração de assinatura são descritos em [`assinatura-e-builds-android.md`](./assinatura-e-builds-android.md) (T0012 — [#78](https://github.com/orbita83/Orbity/issues/78)).

Com a conta Expo autorizada autenticada, estes comandos validam a configuração resolvida sem iniciar builds:

```bash
npx eas-cli config --platform android --profile development --json --non-interactive
npx eas-cli config --platform android --profile preview --json --non-interactive
npx eas-cli config --platform android --profile production --json --non-interactive
```

Os comandos previstos para solicitar cada perfil são:

```bash
npx eas-cli build --platform android --profile development
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
```

Esses comandos não foram executados na T0011; a execução e as evidências da T0012 estão em [`assinatura-e-builds-android.md`](./assinatura-e-builds-android.md). O perfil production prepara um artefato para distribuição, mas não submete nem publica na loja.

## Versionamento

`cli.appVersionSource` está definido como `local`. `app.json` continua sendo a fonte versionada para `expo.version` e `expo.android.versionCode`, conforme [`versionamento-do-app.md`](./versionamento-do-app.md). Não habilite `autoIncrement` nem gerenciamento remoto de versão sem uma decisão aprovada que atualize essa documentação.

## Validação do vínculo

Validação realizada em 09/11/2026 com a conta autorizada autenticada:

- `npx eas-cli project:info` retornou `@mailsons/orbity` com o ID registrado no `app.json`.
- `npx eas-cli config` resolveu os três perfis para Android com o pacote `io.github.orbita83.orbity`, `version` `0.1.0`, `versionCode` `1` e credenciais gerenciadas pelo EAS (`credentialsSource: remote`).
- Nenhum build foi iniciado e nenhuma credencial de assinatura foi criada nessa validação. Esses passos foram executados na T0012 — [#78](https://github.com/orbita83/Orbity/issues/78) e estão registrados em [`assinatura-e-builds-android.md`](./assinatura-e-builds-android.md).

## Referências

- [Issue #77 — Configurar EAS CLI e perfis de build](https://github.com/orbita83/Orbity/issues/77)
- [Issue #78 — Configurar assinatura Android e validar builds](https://github.com/orbita83/Orbity/issues/78)
- [Expo — EAS CLI](https://docs.expo.dev/eas/cli/)
- [Expo — Configuração de `eas.json`](https://docs.expo.dev/build/eas-json/)
- [Expo — Versionamento de aplicativos](https://docs.expo.dev/build-reference/app-versions/)
