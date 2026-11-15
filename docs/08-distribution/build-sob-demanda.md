# Build Android sob demanda (GitHub Actions)

> Origem: T0015 — issue [#81](https://github.com/orbita83/Orbity/issues/81) do [EP-0000](../03-backlog/epics/EP-0000.md).

## 1. Escopo

Este guia descreve o workflow [`.github/workflows/eas-build.yml`](../../.github/workflows/eas-build.yml) (**EAS Build Android**), que solicita builds Android ao EAS por acionamento manual no GitHub Actions. A execução não depende da máquina nem da sessão Expo de quem pede o build.

O workflow **apenas gera artefatos**. Ele não submete versões à Google Play, não cria tags, GitHub Releases ou merges e não altera a versão do aplicativo. A submissão está descrita em [`submissao-google-play.md`](./submissao-google-play.md), e a política de releases continua no [`CONTRIBUTING.md` (Seção 4)](../../CONTRIBUTING.md#4-processo-de-publicação-e-governança-de-releases).

Documentos relacionados (fontes únicas, não redefinidas aqui):

- [`identidade-e-propriedade.md`](./identidade-e-propriedade.md): proprietários e responsáveis.
- [`versionamento-do-app.md`](./versionamento-do-app.md): `version` e `versionCode`.
- [`eas-build.md`](./eas-build.md): EAS CLI e perfis.
- [`assinatura-e-builds-android.md`](./assinatura-e-builds-android.md): keystore, comandos locais, APK × AAB.

## 2. Como o workflow funciona

| Etapa | Job | O que faz |
| ----- | --- | --------- |
| 1 | `authorize` | Valida o perfil e a referência Git **sem** acesso a secrets. Escolhe o environment: `eas-build` (`development`, `preview`) ou `eas-production` (`production`). |
| 2 | `build` | Roda no environment escolhido. Confere o `EXPO_TOKEN`, faz checkout, `npm ci`, confere a conta e o projeto EAS, solicita o build com `--no-wait` e acompanha o status até `FINISHED`, `ERRORED` ou `CANCELED`. |
| 3 | Resumo | Registra perfil, referência, commit, versão, `versionCode`, link e status final do build no resumo da execução. |

Decisões técnicas:

- **Acionamento:** apenas `workflow_dispatch`. Não há gatilho por push ou Pull Request, então código de PRs não confiáveis nunca recebe o token.
- **Entrada única:** o perfil, escolhido em uma lista fechada (`development`, `preview`, `production`) que espelha o [`eas.json`](../../eas.json). Não há campos de texto livre, e os valores chegam aos scripts por variáveis de ambiente, sem interpolação direta.
- **Plataforma:** fixa em Android (`--platform android`).
- **Referências permitidas:** `development` e `main`. Outras branches e tags são recusadas pelo job `authorize`.
- **Permissões do GitHub:** somente `contents: read`; o checkout não guarda credenciais (`persist-credentials: false`).
- **EAS CLI:** a versão local fixada no `package.json` (`npx --no-install eas-cli`), instalada por `npm ci` a partir do lockfile, em Node.js 22 (mesmo do CI).
- **Assinatura:** `--freeze-credentials` impede que o build crie ou altere credenciais. O build usa o keystore remoto da T0012 e falha se ele não estiver disponível.
- **Versão:** lida do `app.json` (`appVersionSource: local`, sem `autoIncrement`). O workflow não incrementa nem altera versões.
- **Concorrência:** execuções com a mesma referência e o mesmo perfil entram em fila, em vez de rodar em paralelo.
- **Tempo máximo:** 180 minutos, já que a fila do plano gratuito do EAS pode demorar.

### 2.1. Solicitação aceita × build concluído

O EAS aceitar a solicitação **não** significa que o build compilou. Por isso:

- O passo **Solicitar build** só confirma que o EAS recebeu o pedido e devolveu o ID.
- O passo **Acompanhar compilação no EAS** consulta o status a cada 60 s.
- O passo **Verificar resultado da compilação** falha a execução se o status final não for `FINISHED`.

Uma execução verde no GitHub Actions significa, portanto, que o artefato foi gerado.

## 3. Pré-requisitos

| Requisito | Responsável | Detalhe |
| --------- | ----------- | ------- |
| Workflow na branch padrão (`main`) | Equipe, pelo fluxo de release | O GitHub só mostra o botão **Run workflow** para workflows presentes na branch padrão do repositório. Até lá, veja a [Seção 4.3](#43-antes-do-workflow-chegar-à-main). |
| Environments `eas-build` e `eas-production` | Administrador do repositório | Configuração na [Seção 6.1](#61-environments-do-github). |
| Secret `EXPO_TOKEN` em cada environment | Proprietário Expo/EAS | Procedimento na [Seção 6.2](#62-expo_token). |
| Permissão de escrita no repositório | — | Necessária para acionar `workflow_dispatch`. |
| Keystore remoto configurado no EAS | Responsável pelas credenciais | Feito na T0012. |

## 4. Solicitar um build

### 4.1. Escolher o perfil

| Perfil | Quando usar | Artefato | Environment |
| ------ | ----------- | -------- | ----------- |
| `development` | Depurar com development client e `npx expo start` | APK interno | `eas-build` |
| `preview` | Validar internamente o app sem ferramentas de desenvolvimento (testes exploratórios, revisão de uma entrega) | APK interno | `eas-build` |
| `production` | Gerar o pacote de uma versão candidata para envio à Google Play | AAB | `eas-production` (exige aprovação) |

Na dúvida, use `preview`. O perfil `production` consome a mesma cota e gera um artefato que pode ir para a loja, então só deve ser pedido para uma versão candidata ou com combinação prévia com o responsável pela publicação.

### 4.2. Pela interface do GitHub

1. Abra **Actions** → **EAS Build Android**.
2. Clique em **Run workflow**.
3. Em **Use workflow from**, escolha `development` ou `main`. O build usa o **último commit** dessa branch.
4. Escolha o **Perfil EAS** e confirme.
5. Para `production`, o job `build` fica em **Waiting** até um revisor do environment aprovar em **Review deployments**.

Pelo terminal (GitHub CLI):

```bash
gh workflow run eas-build.yml --ref development -f profile=preview
gh run list --workflow eas-build.yml --limit 5
gh run watch
```

### 4.3. Antes do workflow chegar à `main`

Enquanto o arquivo existir só na `development`, ele não aparece na interface. A API do GitHub (`gh workflow run ... --ref development`) também pode recusar o acionamento de um workflow ausente da branch padrão. Nessa situação, use os comandos locais de [`assinatura-e-builds-android.md` (Seção 6)](./assinatura-e-builds-android.md#6-gerar-builds) até o workflow ser integrado à `main` pelo fluxo de publicação. Não faça commits diretos na `main` para adiantar esse passo.

### 4.4. Identificar o commit e acompanhar o resultado

- O commit e a referência ficam no topo da execução no GitHub e no **resumo** (*Summary*) do job `build`, ao lado do commit registrado pelo EAS.
- A mensagem do build no EAS traz o número da execução do GitHub Actions (`GitHub Actions run <id> (<branch>)`), o que permite ir do painel do EAS até a execução.
- Logs: na execução, expanda o job `build`. A compilação em si (Gradle, dependências nativas) tem logs próprios na página do build no EAS.

### 4.5. Acessar o artefato

O resumo traz o link da página do build no EAS. O download do APK/AAB é feito por essa página, que exige login na conta proprietária do projeto ([T0009 — Seção 4.3](./identidade-e-propriedade.md#43-riscos-aceitos-e-regras)).

O link direto do arquivo **não** é registrado nos logs nem no resumo: o repositório é público, e o link permitiria que qualquer pessoa baixasse o artefato. Quem não tem acesso ao EAS pede o arquivo ao proprietário do projeto. O APK de `development`/`preview` pode ser compartilhado com testadores pela própria página do build (distribuição interna).

## 5. Diagnosticar falhas

| Passo com falha | Mensagem | Causa provável | O que fazer |
| --------------- | -------- | -------------- | ----------- |
| Validar perfil e referência | `Builds só podem ser gerados a partir de development ou main` | Execução a partir de outra branch ou tag | Rodar novamente escolhendo `development` ou `main` |
| Verificar EXPO_TOKEN | `O secret EXPO_TOKEN não está configurado` | Secret ausente no environment, ou criado só como secret do repositório | [Seção 6.2](#62-expo_token) |
| Conferir conta e projeto EAS | `Falha na autenticação com o EAS` | Token inválido, expirado ou revogado | Gerar um novo token e substituir o secret |
| Conferir conta e projeto EAS | `O EXPO_TOKEN pertence à conta ...` | Token de outra conta Expo | Usar um token da conta proprietária (`expo.owner` do `app.json`) |
| Solicitar build | Erro sobre credenciais | Keystore remoto ausente ou alterado | Conferir com `npx eas-cli credentials -p android` ([T0012](./assinatura-e-builds-android.md#32-configuração-adotada)) |
| Solicitar build | Erro de cota ou plano | Cota mensal do EAS esgotada | Aguardar a renovação ou avaliar o plano com o proprietário |
| Verificar resultado da compilação | `O build terminou com status ERRORED` | Falha na compilação remota | Abrir a página do build no EAS e ver a etapa destacada em vermelho |
| Job cancelado por tempo | — | Fila do EAS acima de 180 min | O build pode continuar no EAS; conferir pelo link do resumo |
| Job `build` em *Waiting* | — | `production` aguardando aprovação | Pedir a um revisor do environment `eas-production` |

## 6. Segurança e administração

As regras de acesso desta seção (referências permitidas, environments, revisores e quem pode solicitar builds) foram propostas na T0015 e são aprovadas pela revisão do Pull Request que as introduz.

### 6.1. Environments do GitHub

O workflow usa dois environments (**Settings** → **Environments**):

| Environment | Perfis | Proteções |
| ----------- | ------ | --------- |
| `eas-build` | `development`, `preview` | *Deployment branches*: `development` e `main` |
| `eas-production` | `production` | *Required reviewers*: responsável pela aprovação de releases e submissões ([T0009 — Seção 7](./identidade-e-propriedade.md#7-responsabilidades-e-governança)); *Prevent self-review*; *Deployment branches*: `development` e `main` |

Se um environment não existir, o GitHub o cria **sem proteções** na primeira execução. Sem o secret, essa execução falha no passo **Verificar EXPO_TOKEN**. Mesmo assim, configure os environments antes de cadastrar o token.

### 6.2. `EXPO_TOKEN`

- **Criação:** o proprietário Expo/EAS cria um *access token* em <https://expo.dev/settings/access-tokens>, com um nome identificável (ex.: `github-actions-orbity`).
- **Armazenamento:** cadastrado como **secret de environment** (`EXPO_TOKEN`) em `eas-build` e em `eas-production`, e **não** como secret do repositório. Um secret do repositório ficaria disponível sem a aprovação exigida para `production`.
- **Uso:** só nos passos que falam com o EAS. O GitHub mascara o valor nos logs; o workflow nunca o imprime.
- **Escopo:** enquanto o projeto pertencer a uma conta individual, o token é pessoal e tem o mesmo acesso da conta (a Expo só oferece *robot users* com acesso restrito em organizações). Esse é um risco aceito pela decisão da [T0009 — Seção 4.3](./identidade-e-propriedade.md#43-riscos-aceitos-e-regras); a migração para organização permitiria trocá-lo por um token de robot.
- **Responsável:** o proprietário Expo/EAS ([T0009 — Seção 7](./identidade-e-propriedade.md#7-responsabilidades-e-governança)).
- **Rotação:** criar um token novo, substituir o secret nos dois environments, executar um build `preview` de verificação e só então revogar o token anterior na Expo. Rotacionar sempre que um integrante com acesso administrativo sair e imediatamente se houver suspeita de vazamento.
- **Revogação:** em <https://expo.dev/settings/access-tokens>. Builds pedidos depois disso falham no passo **Conferir conta e projeto EAS**.
- Nunca envie o token por mensagem, Issue ou Pull Request, nem o grave em arquivos do repositório.

### 6.3. Quem pode solicitar builds

- **`development` e `preview`:** qualquer integrante com permissão de escrita no repositório.
- **`production`:** qualquer integrante com permissão de escrita pode pedir; o build só começa após aprovação no environment `eas-production`.
- Pedidos de acesso ao repositório ou à Expo seguem a [T0009 — Seção 8.1](./identidade-e-propriedade.md#81-solicitação-e-revogação-de-acesso).

## 7. Manutenção

| Tarefa | Como fazer |
| ------ | ---------- |
| Atualizar o EAS CLI | Atualizar `eas-cli` no `package.json` e o lockfile em um PR próprio; se necessário, ajustar `cli.version` do `eas.json` ([`eas-build.md`](./eas-build.md#eas-cli)). O workflow usa a versão do lockfile automaticamente. |
| Adicionar ou alterar perfil | Após aprovação da equipe, alterar o `eas.json` e a lista `options` e o `case` do job `authorize` no mesmo PR, atualizando a tabela da [Seção 4.1](#41-escolher-o-perfil). |
| Alterar referências permitidas | Alterar o `case` do job `authorize` e as *deployment branches* dos environments em conjunto. |
| Atualizar Node.js ou actions | Manter alinhado ao [`ci.yml`](../../.github/workflows/ci.yml). |
| Rotacionar o token | [Seção 6.2](#62-expo_token). |

Alterações neste workflow passam por Pull Request revisado, como qualquer mudança de CI ([`CONTRIBUTING.md` — Seção 3.4](../../CONTRIBUTING.md#34-integração-contínua-ci)).

## 8. Registro de validação

| Verificação | Data | Resultado |
| ----------- | ---- | --------- |
| Sintaxe YAML e estrutura do workflow | 11/11/2026 | Válidas (análise do arquivo) |
| Environments e `EXPO_TOKEN` configurados | — | Pendente |
| Execução sem `EXPO_TOKEN` falha de forma identificável | — | Pendente |
| Execução manual `preview` concluída | — | Pendente |
| Execução `production` aguarda aprovação | — | Pendente |

## 9. Referências

- [Issue #81 — Automatizar build EAS sob demanda](https://github.com/orbita83/Orbity/issues/81)
- [Expo — Builds em CI](https://docs.expo.dev/build/building-on-ci/)
- [Expo — Access tokens](https://docs.expo.dev/accounts/programmatic-access/)
- [Expo — Configuração de `eas.json`](https://docs.expo.dev/build/eas-json/)
- [GitHub Actions — `workflow_dispatch`](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch)
- [GitHub Actions — Environments](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment)
- [GitHub Actions — Secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)
