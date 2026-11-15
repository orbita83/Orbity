# Identidade técnica e versionamento do aplicativo Orbity

> Origem: T0010 — issue [#76](https://github.com/orbita83/Orbity/issues/76) do [EP-0000](../03-backlog/epics/EP-0000.md).

## 1. Escopo

Este documento descreve como a identidade técnica e os campos de versão do Orbity estão configurados e como devem ser atualizados.

- As decisões de identidade e propriedade (pacote Android, contas e responsáveis) estão registradas **somente** em [`identidade-e-propriedade.md`](./identidade-e-propriedade.md). Este documento aplica essas decisões e não as redefine.
- A política geral de versões, releases e aprovação é responsabilidade da T0014 — [#80](https://github.com/orbita83/Orbity/issues/80). As regras de SemVer vigentes estão na [Seção 4.6 do `CONTRIBUTING.md`](../../CONTRIBUTING.md#46-política-de-versionamento-e-alinhamento-com-android).
- A configuração do EAS (`eas.json`, perfis de build e vínculo com o projeto) é responsabilidade da T0011 — [#77](https://github.com/orbita83/Orbity/issues/77).

## 2. Configuração atual

Valores configurados pela T0010 em 07/11/2026.

| Campo | Arquivo | Valor | Origem da decisão |
| ----- | ------- | ----- | ----------------- |
| `expo.name` | `app.json` | `Orbity` | [T0009 — Seção 10](./identidade-e-propriedade.md#10-registro-de-decisões) |
| `expo.slug` | `app.json` | `orbity` | [T0009 — Seção 10](./identidade-e-propriedade.md#10-registro-de-decisões) |
| `expo.scheme` | `app.json` | `orbity` | Configuração existente, consistente com o slug |
| `expo.android.package` | `app.json` | `io.github.orbita83.orbity` | [T0009 — Seção 10](./identidade-e-propriedade.md#10-registro-de-decisões) |
| `expo.version` | `app.json` | `0.1.0` | Equipe, 07/11/2026 |
| `version` | `package.json` e `package-lock.json` | `0.1.0` | Equipe, 07/11/2026 |
| `expo.android.versionCode` | `app.json` | `1` | Equipe, 07/11/2026 |

A versão `0.1.0` representa a primeira versão estável oficial do aplicativo resultante da conclusão do ÉPICO 0, cuja publicação segue o processo formal do [`CONTRIBUTING.md`](../../CONTRIBUTING.md#4-processo-de-publicação-e-governança-de-releases).

## 3. Finalidade de cada campo

| Campo | Finalidade | Formato | Quem vê |
| ----- | ---------- | ------- | ------- |
| `expo.version` | Versão pública do aplicativo; vira o `versionName` do Android. | SemVer `X.Y.Z` | Usuários, na Google Play e nas configurações do aparelho |
| `package.json` → `version` | Versão do projeto JavaScript/Node.js. | SemVer `X.Y.Z` | Equipe |
| `expo.android.versionCode` | Número interno de build Android, usado pela Google Play para ordenar as atualizações. | Inteiro positivo, sempre crescente | Somente a Google Play e o sistema Android |

**Regras de consistência:**

- `expo.version` e `package.json` → `version` devem **sempre coincidir**: os dois representam a mesma versão do produto.
- `expo.android.versionCode` é **independente** da versão pública: várias builds podem ser geradas para a mesma versão (por exemplo, em testes internos), cada uma com seu próprio número.
- O pacote Android (`expo.android.package`) **não pode ser alterado** depois do primeiro envio à Google Play ([T0009 — Seção 3](./identidade-e-propriedade.md#3-identidade-do-aplicativo)).

## 4. Estratégia do `versionCode`

**Fonte de verdade:** o campo `expo.android.versionCode` do `app.json`, versionado no Git. O gerenciamento remoto ou automático de versões pelo EAS **não** está habilitado.

**Regras:**

1. O valor inicial é `1`.
2. Toda build enviada à Google Play, em qualquer faixa (teste interno, fechado, aberto ou produção), deve ter um `versionCode` **maior** do que todas as builds enviadas antes.
3. O incremento é de `+1` e deve ser feito por commit, **antes** de gerar a build que será enviada.
4. Um número já enviado à Google Play **nunca** pode ser reutilizado nem reduzido, mesmo que a build tenha sido descartada.
5. Builds de desenvolvimento que não serão enviadas à Google Play não exigem incremento.

## 5. Como atualizar as versões

Os identificadores de versão são controlados pelo processo de publicação. Pull Requests comuns de desenvolvimento não devem alterá-los ([`CONTRIBUTING.md` — Seção 4.6](../../CONTRIBUTING.md#46-política-de-versionamento-e-alinhamento-com-android)).

**Nova versão pública** (no Pull Request de publicação, depois que a equipe aprovar o número):

1. Atualizar `package.json` e `package-lock.json` sem criar tag:

   ```bash
   npm version X.Y.Z --no-git-tag-version
   ```

2. Atualizar `expo.version` no `app.json` para o mesmo `X.Y.Z`.
3. Incrementar `expo.android.versionCode` em `+1`, se a versão for gerar uma build para a Google Play.
4. Validar os valores efetivos:

   ```bash
   npx expo config --type public
   ```

**Nova build da mesma versão** (por exemplo, para corrigir uma build de teste): incrementar somente `expo.android.versionCode`.

## 6. Dependência com o EAS (T0011)

A estratégia local é compatível com o EAS Build: com `cli.appVersionSource` igual a `local` no `eas.json`, o EAS lê os valores do `app.json` sem alterá-los.

Se a T0011 propuser o gerenciamento remoto (`appVersionSource: remote`, com `autoIncrement`), a mudança deve ser aprovada pela equipe e seguir esta ordem, conforme a [documentação oficial da Expo](https://docs.expo.dev/build-reference/app-versions/):

1. Registrar a decisão por Pull Request que atualize este documento.
2. Sincronizar o último `versionCode` enviado com o comando `eas build:version:set`.
3. Remover `expo.android.versionCode` do `app.json`, porque o valor local passa a ser ignorado. Isso evita duas fontes de verdade conflitantes.

## 7. Referências

- [Identidade e propriedade do aplicativo](./identidade-e-propriedade.md)
- [`CONTRIBUTING.md` — Seção 4.6](../../CONTRIBUTING.md#46-política-de-versionamento-e-alinhamento-com-android)
- [Expo — Configuração do aplicativo](https://docs.expo.dev/versions/latest/config/app/)
- [Expo — Versionamento de aplicativos](https://docs.expo.dev/build-reference/app-versions/)
- [Android — Versionamento de aplicativos](https://developer.android.com/studio/publish/versioning)
