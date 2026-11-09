# EAS CLI e perfis de build Android

> Origem: T0011 — issue [#77](https://github.com/orbita83/Orbity/issues/77) do [EP-0000](../03-backlog/epics/EP-0000.md).

## Escopo e estado do vínculo

Este documento descreve a configuração local do EAS CLI e os perfis Android do Orbity. A identidade do aplicativo e o proprietário autorizado estão definidos em [`identidade-e-propriedade.md`](./identidade-e-propriedade.md); a identidade técnica e o versionamento local estão definidos em [`versionamento-do-app.md`](./versionamento-do-app.md).

O EAS CLI e os perfis locais estão configurados, mas o vínculo externo com o projeto EAS ainda está pendente. A documentação disponível não confirma se o projeto já existe na conta autorizada de @MailsonSousa88. Por isso, `app.json` não declara `owner` nem `extra.eas.projectId`. Não execute builds ou comandos que criem/vinculem projeto até que o projeto existente, seu proprietário e seu ID sejam confirmados.

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

Não compartilhe credenciais nem grave `EXPO_TOKEN`, senhas ou sessões nos arquivos do repositório. Para CI, o token deve ser fornecido pelo mecanismo de segredos do ambiente, fora desta configuração local.

## Perfis Android

Os perfis estão definidos na raiz do repositório em [`eas.json`](../../eas.json):

| Perfil | Finalidade | Artefato/distribuição |
| ------ | ---------- | --------------------- |
| `development` | Depuração usando development client | APK para distribuição interna |
| `preview` | Validação interna sem ferramentas de desenvolvimento | APK para distribuição interna |
| `production` | Preparação para distribuição pela Google Play | Android App Bundle (`.aab`) |

O perfil `development` requer `expo-dev-client` (`~57.0.20`, versão compatível indicada pelo Expo SDK 57 instalado). A primeira configuração dos perfis não gera builds. Builds reais e a configuração de assinatura são responsabilidade da T0012 — [#78](https://github.com/orbita83/Orbity/issues/78).

Depois que o projeto autorizado estiver vinculado e a conta Expo estiver autenticada, estes comandos validam a configuração resolvida sem iniciar builds:

```bash
npx eas-cli config --platform android --profile development --json --non-interactive
npx eas-cli config --platform android --profile preview --json --non-interactive
npx eas-cli config --platform android --profile production --json --non-interactive
```

Após confirmar o vínculo EAS autorizado, os comandos previstos para solicitar cada perfil são:

```bash
npx eas-cli build --platform android --profile development
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
```

Esses comandos não foram executados nesta atividade. O perfil production prepara um artefato para distribuição, mas não submete nem publica na loja.

## Versionamento

`cli.appVersionSource` está definido como `local`. `app.json` continua sendo a fonte versionada para `expo.version` e `expo.android.versionCode`, conforme [`versionamento-do-app.md`](./versionamento-do-app.md). Não habilite `autoIncrement` nem gerenciamento remoto de versão sem uma decisão aprovada que atualize essa documentação.

## Pendência para completar a T0011

O responsável pela conta Expo/EAS deve confirmar se já existe um projeto Orbity sob a conta autorizada. Se existir, conferir proprietário e slug `orbity` e registrar o ID real em `extra.eas.projectId` (e `owner`, quando aplicável). Se não existir, não criar um projeto sem autorização explícita da equipe. A Issue #77 só poderá ser considerada concluída após confirmar e validar o vínculo obrigatório.

## Referências

- [Issue #77 — Configurar EAS CLI e perfis de build](https://github.com/orbita83/Orbity/issues/77)
- [Issue #78 — Configurar assinatura Android e validar builds](https://github.com/orbita83/Orbity/issues/78)
- [Expo — EAS CLI](https://docs.expo.dev/eas/cli/)
- [Expo — Configuração de `eas.json`](https://docs.expo.dev/build/eas-json/)
- [Expo — Versionamento de aplicativos](https://docs.expo.dev/build-reference/app-versions/)
