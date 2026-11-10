# Assinatura Android e validação de builds

> Origem: T0012 — issue [#78](https://github.com/orbita83/Orbity/issues/78) do [EP-0000](../03-backlog/epics/EP-0000.md).

## 1. Escopo

Este documento descreve como o Orbity assina e gera builds Android pelo EAS Build, quem administra as credenciais de assinatura e como protegê-las e recuperá-las. Ele complementa:

- [`identidade-e-propriedade.md`](./identidade-e-propriedade.md): propriedade das contas e responsáveis (fonte única dessas decisões).
- [`versionamento-do-app.md`](./versionamento-do-app.md): pacote Android, `version` e `versionCode`.
- [`eas-build.md`](./eas-build.md): EAS CLI, vínculo com o projeto e perfis `development`, `preview` e `production`.

Fora do escopo: submissão à Google Play (T0015 — [#81](https://github.com/orbita83/Orbity/issues/81)) e auditoria de requisitos e políticas da loja (T0013 — [#79](https://github.com/orbita83/Orbity/issues/79)).

## 2. Pré-requisitos

| Requisito | Detalhe |
| --------- | ------- |
| Conta Expo autorizada | Somente o proprietário do projeto `@mailsons/orbity` executa builds na nuvem enquanto o projeto pertencer a uma conta individual ([T0009 — Seção 4.3](./identidade-e-propriedade.md#43-riscos-aceitos-e-regras)). |
| Dependências sincronizadas | `npm ci` na raiz do repositório. Sem isso, `npx eas-cli` pode executar uma versão antiga instalada na máquina, recusada pela faixa `cli.version` (`>= 27.5.0`) do `eas.json`. |
| Autenticação | `npx eas-cli login` e `npx eas-cli whoami` (deve retornar `mailsons`). |
| Dispositivo Android | Aparelho físico ou emulador, para instalar o build de desenvolvimento. |
| Cota do EAS | Builds consomem a cota mensal do plano. No plano gratuito, os builds entram em fila de baixa prioridade e podem demorar. |

O aviso `eas-cli@X is now available` pode ser ignorado: o projeto usa a versão local fixada no `package.json`. O aviso `Found eas-cli in your project dependencies` também é esperado, pois o `eas.json` já define `cli.version`.

## 3. Assinatura Android

### 3.1. O que é o keystore e por que ele é único

O Android só instala aplicativos assinados, e **toda atualização precisa ser assinada pela mesma chave** do aplicativo já instalado ou publicado. Por isso o Orbity usa **um único keystore para o aplicativo**, associado ao pacote `io.github.orbita83.orbity`, e não um keystore por integrante.

| Chave | Quantas | Onde fica | Uso |
| ----- | ------- | --------- | --- |
| Keystore de release (gerenciado pelo EAS) | Uma, do aplicativo | Servidores do EAS, no projeto `@mailsons/orbity` | Assina os builds `development`, `preview` e `production` feitos na nuvem; após o primeiro envio à Google Play, passa a ser a **chave de upload** |
| Backup do keystore | Uma cópia | Cofre do responsável pelas credenciais, fora do repositório | Recuperação, caso o acesso ao EAS seja perdido |
| `debug.keystore` | Uma por máquina | `~/.android/` de cada integrante, gerado automaticamente | Compilações locais (`npx expo run:android`); nunca usado para distribuição |

Um aplicativo assinado por uma chave não pode ser atualizado por um APK assinado por outra. Ao alternar entre um build local (debug) e um build do EAS no mesmo aparelho, desinstale a versão anterior.

### 3.2. Configuração adotada

- **Método:** credenciais remotas gerenciadas pelo EAS (`credentialsSource: remote`, padrão do projeto desde a T0011). Nenhum keystore é necessário na máquina de quem executa o build.
- **Verificação prévia:** em 10/11/2026, `npx eas-cli credentials -p android` confirmou que não existiam credenciais Android para o projeto. Não havia assinatura anterior a preservar.
- **Criação:** em 10/11/2026, o responsável pelas credenciais gerou o keystore pelo EAS (`credentials` → `production` → *Set up a new keystore*).

| Item | Valor |
| ---- | ----- |
| Configuração | `Build Credentials 2XZlO4RCyx` (padrão) |
| Tipo | JKS |
| Pacote | `io.github.orbita83.orbity` |
| SHA-1 (chave de upload) | `BC:0A:89:F9:17:6B:FD:09:A7:B2:39:08:7B:81:0A:C6:08:FF:A9:99` |
| SHA-256 (chave de upload) | `73:BC:94:7B:10:93:81:42:87:8D:9A:D2:AE:5B:91:60:DC:D9:74:FD:51:40:E6:D6:0B:07:07:9D:51:73:EB:E9` |

Impressões digitais (SHA-1, SHA-256) e o alias são dados públicos e podem ser registrados. **Senhas e o arquivo do keystore nunca são registrados** no repositório, em Issues, em Pull Requests ou em logs.

Para consultar novamente:

```bash
npx eas-cli credentials -p android
```

### 3.3. Dois SHA-1: chave de upload e chave da Google Play

Com o [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756), padrão para novos aplicativos na Google Play, existem duas chaves:

| Chave | Quem guarda | Onde consultar o SHA-1 |
| ----- | ----------- | ---------------------- |
| Chave de upload (o keystore do EAS) | EAS e backup do responsável | `npx eas-cli credentials -p android` (Seção 3.2) |
| Chave de assinatura do app | Google | Play Console → *Integridade do app* → *Assinatura de apps*, disponível após o primeiro envio |

O aplicativo instalado pela loja é assinado pela chave do Google, e não pela chave de upload. Se o Orbity vier a usar login com Google, Firebase ou chaves de API restritas por SHA-1, **os dois SHA-1 devem ser registrados** nesses serviços. Caso contrário, a integração funciona nos builds internos e falha na versão da loja.

## 4. Responsáveis e proteção das credenciais

Os responsáveis estão definidos em [`identidade-e-propriedade.md` — Seção 7](./identidade-e-propriedade.md#7-responsabilidades-e-governança) e não são redefinidos aqui:

- **Credenciais de assinatura (guarda, backup e recuperação):** @MailsonSousa88.
- **Execução de builds na nuvem:** somente o proprietário da conta Expo, @MailsonSousa88.
- **Envio do AAB à Google Play:** titular da conta Google Play, @MateusARJ, que **não** precisa do keystore: ele recebe o `.aab` já assinado.

Regras:

- O backup do keystore (arquivo `.jks`, alias, senha do keystore e senha da chave) foi obtido em *Download existing keystore* e guardado pelo responsável em cofre próprio, **fora da pasta do repositório**.
- O `.gitignore` ignora `*.jks`, `*.keystore`, `credentials.json`, `credentials/`, `*.p8`, `*.p12`, `*.key`, `*.pem`, `*.apk` e `*.aab`. O arquivo `credentials.json` é usado pelo modo de credenciais locais do EAS e contém senhas.
- Ao exibir as informações sensíveis do keystore no terminal, confira que a tela não está compartilhada e limpe o terminal em seguida.
- Ninguém recebe o keystore por mensagem, e-mail ou drive compartilhado.

## 5. Continuidade e recuperação

A recuperação depende do momento e do mecanismo realmente disponível:

| Situação | Antes do primeiro envio à Google Play | Depois do primeiro envio |
| -------- | ------------------------------------- | ------------------------ |
| Acesso ao EAS perdido, backup disponível | Enviar o `.jks` do backup ao EAS pelo `eas credentials` (configurar keystore, recusar a geração de um novo e informar o arquivo, o alias e as senhas) em um projeto acessível. | Mesmo procedimento; a chave de upload continua válida. |
| Keystore e backup perdidos | Gerar um novo keystore. Não há impacto, pois nenhuma versão foi distribuída. | O titular da conta Google Play solicita a **redefinição da chave de upload** no Play Console. A chave de assinatura do app permanece com o Google, e as atualizações continuam possíveis após a aprovação. |
| Responsável deixa a equipe | Aplicar o procedimento da [T0009 — Seção 9](./identidade-e-propriedade.md#9-continuidade-e-recuperação-administrativa) e os gatilhos de migração para organização da [Seção 4.4](./identidade-e-propriedade.md#44-gatilhos-de-migração-para-organização); a transferência do projeto e das credenciais precisa ser confirmada com `eas credentials` após a migração. | Idem. |

A redefinição da chave de upload só existe com o Play App Signing ativo e depende de aprovação do Google; não deve ser tratada como garantida. O backup da Seção 4 continua obrigatório.

Riscos aceitos: o keystore, o backup e a execução de builds dependem de um único integrante ([T0009 — Seção 9.1](./identidade-e-propriedade.md#91-concentração-de-responsabilidades)). A equipe optou por manter a conta individual nesta etapa.

## 6. Gerar builds

### 6.1. Desenvolvimento (APK com development client)

```bash
npx eas-cli build --platform android --profile development
```

O comando mostra o link do build e, ao final, um QR code para instalação. Para não aguardar a fila com o terminal aberto, use `--no-wait` e acompanhe pelo link.

### 6.2. Produção (AAB)

```bash
npx eas-cli build --platform android --profile production
```

O artefato é um Android App Bundle (`.aab`) assinado com o keystore da Seção 3.2. **Não** responda afirmativamente a ofertas de envio à loja: a submissão pertence à T0015.

### 6.3. Instalar e validar o build de desenvolvimento

1. Abra o link do build no Android (ou leia o QR code) e instale o APK. Permita a instalação de apps desconhecidos, se solicitado.
2. No computador, na raiz do repositório:

   ```bash
   npx expo start
   ```

   O terminal deve indicar *development build*; se indicar *Expo Go*, pressione `s`.
3. Com o aparelho na mesma rede, abra o Orbity e selecione o servidor em *Development servers* (ou leia o QR code). Se a rede bloquear a conexão, use `npx expo start --tunnel`.
4. A validação passa quando a tela inicial do Orbity carrega a partir do servidor.

Em emulador, instale com `adb install caminho/do/arquivo.apk` ou aceite a instalação oferecida pelo `eas build`.

### 6.4. Diagnóstico de "App não instalado"

O Android exibe essa mensagem genérica por vários motivos. Para obter o código exato, conecte o aparelho por USB com depuração ativada e execute `adb install -r caminho/do/arquivo.apk`:

| Código | Causa | Ação |
| ------ | ----- | ---- |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Já existe um Orbity assinado por outra chave (ex.: build local de debug) | Desinstalar a versão existente |
| `INSTALL_FAILED_INSUFFICIENT_STORAGE` | Espaço insuficiente (o APK de desenvolvimento tem ~270 MB) | Liberar espaço e baixar novamente |
| `INSTALL_FAILED_OLDER_SDK` | Android abaixo da versão mínima do Expo SDK 57 | Usar outro aparelho ou emulador recente |
| `INSTALL_FAILED_NO_MATCHING_ABIS` | Arquitetura de processador não incluída | Usar emulador x86_64 ou aparelho ARM64 |

Downloads interrompidos e bloqueios do Play Protect ou de camadas do fabricante (ex.: MIUI/HyperOS) também geram a mensagem.

## 7. APK × AAB

| | APK | AAB |
| --- | --- | --- |
| Perfis | `development`, `preview` | `production` |
| Instalação direta no aparelho | Sim | Não |
| Finalidade | Testes internos e desenvolvimento | Envio à Google Play, que gera APKs otimizados por aparelho |
| Tamanho | Maior (inclui todas as arquiteturas; o de desenvolvimento inclui ferramentas de depuração) | O usuário baixa apenas a parte necessária ao seu aparelho |

Gerar um AAB **não** equivale a aprová-lo ou publicá-lo na Google Play. Como a conta Google Play é pessoal ([T0009 — Seção 5](./identidade-e-propriedade.md#5-propriedade-da-publicação-na-google-play)), contas pessoais novas precisam de um [teste fechado com ao menos 12 testadores por 14 dias contínuos](https://support.google.com/googleplay/android-developer/answer/14151465) antes do acesso à produção; a verificação desse requisito pertence à T0013 — [#79](https://github.com/orbita83/Orbity/issues/79).

## 8. Histórico e logs no EAS

- Lista de builds: <https://expo.dev/accounts/mailsons/projects/orbity/builds> (acesso restrito ao proprietário da conta).
- Cada build tem uma página com status, perfil, versão, `versionCode`, fingerprint, artefato para download e logs por etapa (ex.: *Install dependencies*, *Run gradlew*). Em caso de falha, a etapa com erro aparece destacada.
- Pelo terminal: `npx eas-cli build:list --platform android` e `npx eas-cli build:view <id>`.

## 9. Identidade e versionamento

Os builds usam os valores da [T0010](./versionamento-do-app.md), lidos do `app.json` (`cli.appVersionSource: local`):

| Campo | Valor |
| ----- | ----- |
| Pacote | `io.github.orbita83.orbity` |
| `version` | `0.1.0` |
| `versionCode` | `1` |

`autoIncrement` não está habilitado. Novos envios à Google Play exigirão incrementar o `versionCode` conforme a estratégia da T0010; builds internos repetidos com o mesmo `versionCode` não causam conflito.

## 10. Registro de validação (T0012)

| Verificação | Data | Resultado |
| ----------- | ---- | --------- |
| Credenciais Android preexistentes no EAS | 10/11/2026 | Nenhuma encontrada |
| Keystore criado no EAS e backup guardado pelo responsável | 10/11/2026 | Concluído (Seção 3.2) |
| Build `development` | 10/11/2026 | Concluído — [394582b2-5ca0-42fa-942c-8f5ded32cfb9](https://expo.dev/accounts/mailsons/projects/orbity/builds/394582b2-5ca0-42fa-942c-8f5ded32cfb9), com credenciais remotas e a configuração `Build Credentials 2XZlO4RCyx` |
| Instalação do build `development` em Android | 10/11/2026 | **Impedimento:** o aparelho exibiu "App não instalado". Causa não diagnosticada (Seção 6.4); a validação de abertura e conexão ao servidor de desenvolvimento permanece pendente |
| Build `production` (`.aab`) | 10/11/2026 | Solicitado — [1a321ab4-c93e-4bd2-8cbb-f89c5a66fee8](https://expo.dev/accounts/mailsons/projects/orbity/builds/1a321ab4-c93e-4bd2-8cbb-f89c5a66fee8), com credenciais remotas e a configuração `Build Credentials 2XZlO4RCyx`; conclusão e formato `.aab` a confirmar na página do build |

## 11. Referências

- [Issue #78 — Configurar assinatura Android e validar builds](https://github.com/orbita83/Orbity/issues/78)
- [Expo — Credenciais de aplicativos](https://docs.expo.dev/app-signing/app-credentials/)
- [Expo — Credenciais gerenciadas](https://docs.expo.dev/app-signing/managed-credentials/)
- [Expo — Builds de desenvolvimento](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo — Configuração de `eas.json`](https://docs.expo.dev/build/eas-json/)
- [Android — Assinar o app](https://developer.android.com/studio/publish/app-signing)
- [Google Play — Usar a assinatura de apps do Google Play](https://support.google.com/googleplay/android-developer/answer/9842756)
