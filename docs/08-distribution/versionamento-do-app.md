# Identidade técnica e versionamento do aplicativo Orbity

> Origem: T0010 — issue [#76](https://github.com/orbita83/Orbity/issues/76) do [EP-0000](../03-backlog/epics/EP-0000.md).

## 1. Escopo

Este documento descreve como a identidade técnica e os campos de versão do Orbity estão configurados e como devem ser atualizados.

- As decisões de identidade e propriedade (pacote Android, contas e responsáveis) estão registradas **somente** em [`identidade-e-propriedade.md`](./identidade-e-propriedade.md). Este documento aplica essas decisões e não as redefine.
- A política geral de versões, releases e aprovação é responsabilidade da T0014 — [#80](https://github.com/orbita83/Orbity/issues/80). As regras de SemVer vigentes estão na [Seção 4.6 do `CONTRIBUTING.md`](../../CONTRIBUTING.md#46-política-de-versionamento-e-alinhamento-com-android).
- A configuração do EAS (`eas.json`, perfis de build e vínculo com o projeto) é responsabilidade da T0011 — [#77](https://github.com/orbita83/Orbity/issues/77).

## 2. Configuração atual

Valores configurados pela T0010 em 07/11/2026 e atualizados pela [#247](https://github.com/orbita83/Orbity/issues/247) para gerenciamento remoto do `versionCode`:

| Campo | Arquivo / Origem | Valor | Origem da decisão |
| ----- | ---------------- | ----- | ----------------- |
| `expo.name` | `app.json` | `Orbity` | [T0009 — Seção 10](./identidade-e-propriedade.md#10-registro-de-decisões) |
| `expo.slug` | `app.json` | `orbity` | [T0009 — Seção 10](./identidade-e-propriedade.md#10-registro-de-decisões) |
| `expo.scheme` | `app.json` | `orbity` | Configuração existente, consistente com o slug |
| `expo.android.package` | `app.json` | `io.github.orbita83.orbity` | [T0009 — Seção 10](./identidade-e-propriedade.md#10-registro-de-decisões) |
| `expo.version` | `app.json` | `0.1.0` | Equipe, 07/11/2026 (manual) |
| `version` | `package.json` e `package-lock.json` | `0.1.0` | Equipe, 07/11/2026 (manual) |
| `versionCode` (Android) | EAS remoto (`eas.json` → `cli.appVersionSource: "remote"`) | Inicializado em `1` (`autoIncrement: true` em `production`) | Equipe, 07/11/2026 (T0010) e 25/11/2026 ([#247](https://github.com/orbita83/Orbity/issues/247)) |

A versão `0.1.0` representa a primeira versão estável oficial do aplicativo resultante da conclusão do ÉPICO 0, cuja publicação segue o processo formal do [`CONTRIBUTING.md`](../../CONTRIBUTING.md#4-processo-de-publicação-e-governança-de-releases).

## 3. Finalidade de cada campo

| Campo | Finalidade | Formato | Quem vê |
| ----- | ---------- | ------- | ------- |
| `expo.version` | Versão pública do aplicativo; vira o `versionName` do Android. | SemVer `X.Y.Z` | Usuários, na Google Play e nas configurações do aparelho |
| `package.json` → `version` | Versão do projeto JavaScript/Node.js. | SemVer `X.Y.Z` | Equipe |
| `versionCode` (EAS remoto) | Número interno de build Android, usado pela Google Play para ordenar as atualizações. | Inteiro positivo, sempre crescente | Somente a Google Play e o sistema Android |

**Regras de consistência:**

- `expo.version` e `package.json` → `version` devem **sempre coincidir**: os dois representam a mesma versão do produto e continuam sob controle manual da equipe.
- O `versionCode` é **independente** da versão pública: várias builds podem ser geradas para a mesma versão (por exemplo, em testes internos ou novas compilações de produção), cada uma com seu próprio número.
- O pacote Android (`expo.android.package`) **não pode ser alterado** depois do primeiro envio à Google Play ([T0009 — Seção 3](./identidade-e-propriedade.md#3-identidade-do-aplicativo)).

## 4. Estratégia do `versionCode`

**Fonte de verdade:** armazenamento remoto de versões do EAS (`eas.json` → `cli.appVersionSource: "remote"`). O campo `expo.android.versionCode` **não** é declarado no `app.json` para evitar duas fontes de verdade conflitantes.

**Regras:**

1. O valor inicial remoto foi sincronizado em `1` (alinhado aos builds gerados na T0012 e na T0015).
2. Toda build enviada à Google Play, em qualquer faixa (teste interno, fechado, aberto ou produção), deve ter um `versionCode` **maior** do que todas as builds enviadas antes.
3. O perfil `production` possui `"autoIncrement": true` no `eas.json`: cada build `production` incrementa automaticamente o `versionCode` remoto em `+1` antes de compilar, sem alterar o `app.json` nem o `expo.version` (`versionName`).
4. Os perfis `development` e `preview` não habilitam `autoIncrement`, lendo o `versionCode` remoto atual sem incrementá-lo.
5. Um número já enviado à Google Play **nunca** pode ser reutilizado nem reduzido, mesmo que a build tenha sido descartada.

Comandos para consultar ou ressincronizar manualmente o `versionCode` remoto (como proprietário Expo):

```bash
npx --no-install eas-cli build:version:get --platform android --profile production
npx --no-install eas-cli build:version:set --platform android --profile production
```

## 5. Como atualizar as versões

Os identificadores públicos de versão (`versionName`) são controlados manualmente pelo processo de publicação. Pull Requests comuns de desenvolvimento não devem alterá-los ([`CONTRIBUTING.md` — Seção 4.6](../../CONTRIBUTING.md#46-política-de-versionamento-e-alinhamento-com-android)).

**Nova versão pública** (no Pull Request de publicação, depois que a equipe aprovar o número):

1. Atualizar `package.json` e `package-lock.json` sem criar tag:

   ```bash
   npm version X.Y.Z --no-git-tag-version
   ```

2. Atualizar `expo.version` no `app.json` para o mesmo `X.Y.Z`.
3. Validar os valores efetivos no manifesto e conferir o `versionCode` remoto atual:

   ```bash
   npx expo config --type public
   npx --no-install eas-cli build:version:get --platform android --profile production
   ```

**Nova build da mesma versão** (por exemplo, para corrigir uma build de loja ou gerar novo AAB): basta solicitar um novo build `production`; o EAS incrementa o `versionCode` remoto automaticamente em `+1`. Use `eas build:version:set` apenas se houver necessidade de ressincronização manual com o Play Console.

## 6. Dependência com o EAS (T0011 e #247)

Na T0011, o projeto adotou inicialmente `cli.appVersionSource: "local"`. A migração para o gerenciamento remoto do `versionCode` (`cli.appVersionSource: "remote"` com `"autoIncrement": true` no perfil `production`) foi realizada na issue [#247](https://github.com/orbita83/Orbity/issues/247), mantendo o `versionName` (`expo.version`) manual e seguindo os passos da [documentação oficial da Expo](https://docs.expo.dev/build-reference/app-versions/):

1. Atualização desta documentação e das configurações do `eas.json` em Pull Request revisado.
2. Sincronização do `versionCode` remoto inicial (`1`) no EAS via `eas build:version:set`.
3. Remoção de `expo.android.versionCode` do `app.json` para evitar conflito com a fonte remota.

## 7. Referências

- [Identidade e propriedade do aplicativo](./identidade-e-propriedade.md)
- [`CONTRIBUTING.md` — Seção 4.6](../../CONTRIBUTING.md#46-política-de-versionamento-e-alinhamento-com-android)
- [Expo — Configuração do aplicativo](https://docs.expo.dev/versions/latest/config/app/)
- [Expo — Versionamento de aplicativos](https://docs.expo.dev/build-reference/app-versions/)
- [Android — Versionamento de aplicativos](https://developer.android.com/studio/publish/versioning)
