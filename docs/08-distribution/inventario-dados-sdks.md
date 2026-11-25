# Inventário de dados e SDKs

> Origem: T0013 — [#79](https://github.com/orbita83/Orbity/issues/79). Inspeção estática em 25/11/2026 para revisão da equipe.

## 1. Referência e limites

Código e lockfile de referência: `61daeb136d64c970236cc85354a7c092c1757582`, da `development`. Aplicativo declarado como versão `0.1.0`, Android versionCode `1`. O número de versão não demonstra equivalência com o AAB histórico: seu commit de origem ainda precisa ser identificado. Este inventário complementa a [auditoria](./auditoria-google-play.md), principalmente GP16, GP19 e GP20; não reclassifica a conformidade integral do artefato.

Foram inspecionados modelos, migrações, composição de dependências, adapters SQLite, perfil em memória, notificações locais, casos de uso, configuração Expo/EAS e lockfile. Buscas em `src/` por chamadas de rede, URLs, tokens push, analytics, autenticação, armazenamento, exclusão e criptografia foram confrontadas com os arquivos relevantes. Testes, histórias e fixtures não são tratados como comportamento de produção; a fixture de perfil é explicitamente incluída porque o container de produção a instancia.

Não foram gerados builds nem executados prebuild, captura de tráfego, instalação ou inspeção do AAB. A instalação local de dependências não contém o manifesto de expo-notifications no caminho consultado, portanto sua análise nativa não foi apresentada como concluída. Versões abaixo são resoluções do lockfile, não versões comprovadas do binário.

## 2. Campos de dados e ciclo de vida

O banco local chama-se `orbity.db`, aberto por `createPersistence` via `ExpoSqlExecutor`. Não há prazo automático de expiração identificado nos adapters consultados. Exclusão lógica e remoção SQL não devem ser descritas como apagamento seguro de todos os vestígios ou cópias de backup.

| Grupo | Campos efetivamente definidos | Origem e finalidade | Local e destinatário identificado no código | Retenção e exclusão observadas | Evidência |
| --- | --- | --- | --- | --- | --- |
| Perfil | `id`, `name`, `streakDays`, `achievementsCount`, `studyHours` | Perfil inicial de fixture; usuário pode editar nome | Memória do processo, sem envio externo identificado | Nome alterado não é persistido pelo adapter; não confundir indicadores da fixture com métricas pessoais calculadas | [Perfil](../../src/model/entities/studentProfile.ts), [adapter](../../src/infra/datasources/memoryProfileDataSource.ts), [ViewModel](../../src/viewmodel/useProfileViewModel.ts) |
| Tarefas | `id`, `title`, `description`, `start_date`, `start_time`, `end_date`, `end_time`, `category`, `completed`, `pinned`, `created_at`, `updated_at`, `routine_id`, `position` | Conteúdo fornecido pelo estudante e metadados gerados; organizar tarefas e vínculos | SQLite no aparelho | `deleteMany` remove linhas selecionadas; sem prazo automático. Exclusão não implica apagar histórico de atividade e estrelas | [Migrações](../../src/infra/database/migrations.ts), [tarefas](../../src/infra/datasources/sqliteTaskDataSource.ts) |
| Rotinas | `id`, `title`, `description`, `icon`, `days`, `created_at`, `updated_at`, `deleted_at` | Conteúdo e dias escolhidos; organizar repetição de estudo | SQLite no aparelho | `markDeleted` preenche `deleted_at`; a linha permanece e pode ser restaurada. Não há purga automática identificada | [Rotinas](../../src/infra/datasources/sqliteRoutineDataSource.ts) |
| Ocorrências e marcações | `routine_occurrences`: `routine_id`, `local_date`, `completed_at`; `routine_task_checks`: `routine_id`, `task_id`, `local_date` | Registrar conclusão de rotina e tarefas em cada dia | SQLite no aparelho | Reabrir ocorrência remove marcações do dia; edição pode remover checks de tarefas excluídas. Não há prazo global identificado | [Migrações](../../src/infra/database/migrations.ts), [adapter](../../src/infra/datasources/sqliteRoutineDataSource.ts) |
| Atividade diária | `local_date`, `recorded_at` | Datas de atividade para sequência de estudos | SQLite no aparelho | Sem expiração ou operação de exclusão identificada no adapter | [Atividade](../../src/infra/datasources/sqliteDailyActivityDataSource.ts) |
| Estrelas | `id`, `source_type`, `event_key`, `earned_date`, `created_at` | Recompensas e idempotência; chaves podem incorporar datas de atividade | SQLite no aparelho | Sem expiração ou operação de exclusão identificada no adapter | [Estrelas](../../src/infra/datasources/sqliteStarDataSource.ts) |
| Categorias | `id`, `name`, `name_key`, `icon`, `is_default`, `created_at`, `updated_at` | Padrões e personalização do estudante; `name_key` normaliza o nome | SQLite no aparelho | Exclusão remove categoria, desvincula tarefas e altera ícones das rotinas para o geral; não remove as tarefas | [Categorias](../../src/infra/datasources/sqliteCategoryDataSource.ts) |
| Lembretes | Identificador derivado do id da tarefa, título, corpo com título da tarefa, horário de disparo, `route`, `taskId`, `__orbityTriggerAt`; status de permissão e canal | Avisar início de tarefa e abrir a tela pertinente | Serviço nativo de notificações do aparelho; conteúdo pode ser exibido na notificação | Agendar, listar e cancelar; reconciliação cancela lembretes órfãos; cancelamento não é comprovação de remoção de notificações já entregues | [Caso de uso](../../src/usecase/taskUseCases.ts), [serviço](../../src/infra/services/expoNotificationService.ts) |

Datas locais e instantes vêm do relógio do aparelho. Identificadores de tarefa, categoria, rotina e evento são identificadores internos de registros; não foram identificados como identificadores de publicidade ou de conta remota. Campos livres, como título, descrição, categoria e nome, podem conter informação pessoal escrita pelo estudante; não presumir conteúdo anônimo.

## 3. Rede, terceiros e permissões

No código de produto consultado, não foram encontradas chamadas explícitas a `fetch`, Axios, WebSocket ou XMLHttpRequest, URLs HTTP, obtenção de tokens Expo/FCM nem inicialização de SDK de analytics/Sentry/Firebase. Isso não equivale a ausência de transmissão por bibliotecas, módulos nativos, ferramentas de desenvolvimento ou backup do sistema.

O adapter de notificações chama APIs de permissão, canal, agendamento local, cancelamento, listagem e resposta. O payload do lembrete inclui o título da tarefa, portanto o sistema pode exibi-lo conforme as configurações do aparelho. Nenhum backend push foi identificado no código consultado. A capacidade do pacote de obter tokens remotos não significa que o aplicativo a utiliza.

O manifesto local de `expo-image` declara `INTERNET`, `ACCESS_NETWORK_STATE` e `READ_EXTERNAL_STORAGE` até API 32. Essas são declarações da biblioteca consultada, não a lista final de permissões do aplicativo. `app.json` contém plugins de Router, Splash Screen, SQLite e Notifications. Permissão de notificação e demais permissões finais devem ser conferidas no manifesto mesclado do artefato de referência.

O lockfile contém `@sentry/node` como dependência de desenvolvimento de `eas-cli`; sua presença no lockfile não comprova telemetria Sentry no aplicativo instalado. `expo-updates-interface` também aparece transitivamente; não comprova uma configuração ativa de atualizações remotas. Serviços de build e o aplicativo distribuído são escopos distintos.

## 4. Bibliotecas diretas

Todas as dependências diretas de execução de `package.json` estão na tabela abaixo, com resolução de `package-lock.json`. O agrupamento indica a área a verificar, não certifica ausência de coleta. Dependências transitivas Java/Gradle, código nativo e versões efetivamente incluídas exigem o artefato e seus logs.

| Biblioteca | Versão resolvida | Área de verificação |
| --- | --- | --- |
| `@expo/ui` | `57.0.25` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `expo` | `57.0.30` | Runtime e módulos nativos; avaliar composição e serviços efetivos do build. |
| `expo-constants` | `57.0.24` | Metadados/configuração; também dependência de notifications; conferir uso transitivo. |
| `expo-dev-client` | `57.0.21` | Ferramentas de desenvolvimento; perfil development habilita developmentClient. Conferir conteúdo do production. |
| `expo-device` | `57.0.2` | Declarada, sem importação identificada em src; conferir inclusão e uso transitivo no binário. |
| `expo-font` | `57.0.4` | Fontes; verificar se os recursos efetivos são locais ou remotos no artefato. |
| `expo-glass-effect` | `57.0.4` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `expo-image` | `57.0.5` | Manifesto local declara rede e leitura legada de armazenamento; não prova solicitação no app. |
| `expo-linking` | `57.0.13` | Integração de links/rotas; sem URL HTTP de produto encontrada na busca. |
| `expo-notifications` | `57.0.25` | Adapter local ativo; conferir manifesto, módulos e comportamento nativo. |
| `expo-router` | `57.0.28` | Entrada e navegação ativas; conferir integrações transitivas. |
| `expo-splash-screen` | `57.0.10` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `expo-sqlite` | `57.0.5` | Persistência local utilizada pelo executor; conferir backup e proteção do banco. |
| `expo-status-bar` | `57.0.1` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `expo-symbols` | `57.0.3` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `expo-system-ui` | `57.0.4` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `react` | `19.2.3` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `react-dom` | `19.2.3` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `react-native` | `0.86.3` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `react-native-gesture-handler` | `2.32.0` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `react-native-reanimated` | `4.5.1` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `react-native-safe-area-context` | `5.7.0` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `react-native-screens` | `4.26.2` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `react-native-svg` | `15.15.4` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `react-native-web` | `0.21.4` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |
| `react-native-worklets` | `0.10.1` | Interface, renderização, gestos ou suporte de plataforma; sem integração de envio de dados de produto identificada na busca. Inclusão e comportamento nativo não certificados. |

## 5. Proteção, backup e exclusão

O executor abre o SQLite sem chave ou pragma de criptografia identificado; o plugin não configura `useSQLCipher` em `app.json`. Não afirmar criptografia própria do banco nem criptografia de tráfego sem evidência. A documentação Expo descreve SQLCipher como configuração específica, separada do uso básico do SQLite.

A configuração consultada não define `allowBackup`, `dataExtractionRules` ou exclusões de backup. A documentação Android descreve backup automático e regras de inclusão de bancos em condições aplicáveis. É necessário inspecionar o manifesto e as regras efetivas do build, versão do Android e transferência entre aparelhos antes de afirmar que os dados permanecem exclusivamente no dispositivo ou são eliminados definitivamente com a desinstalação.

Não foi identificado fluxo de criação de conta remota no recorte consultado. O perfil local não deve ser descrito como conta de autenticação. Também não foi identificada ação geral de apagar todos os dados no código de produto. Não prometer exclusão completa, prazo de retenção, contato de privacidade ou procedimento de solicitação até a equipe definir e validar esses pontos na #176.

## 6. Pendências para fechar o inventário de produção

| Pendência | Próxima ação verificável | Responsável pelo encaminhamento |
| --- | --- | --- |
| Correspondência com o AAB | Identificar commit e lockfile do build; comparar com este recorte e inspecionar manifesto, módulos e dependências nativas | Responsável Expo/EAS, com coordenação da #79 |
| Bibliotecas e rede em produção | Revisar comportamento e documentos dos SDKs incluídos; observar tráfego e inicialização no artefato autorizado | Equipe técnica da #79 |
| Backup e proteção | Conferir regras efetivas e comportamento de restauração; registrar proteção comprovada sem presumir SQLCipher | Equipe técnica da #79 |
| Retenção e exclusão | Aprovar o texto que distingue remoção de tarefa, exclusão lógica de rotina, histórico remanescente e cópias do sistema | Equipe de produto e #176 |
| Conteúdo e contato público | Definir responsável pela política, hospedagem, contato e revisão do texto com base neste inventário | Equipe da #176 |
| Declarações Play | Classificar tipos de dados e exceções conforme comportamento comprovado, incluindo SDKs; revisar antes de preencher | Titular e equipe na #177, usando conclusões da #79 |

Para Segurança dos dados, a fonte oficial distingue processamento somente no aparelho de transmissão para fora dele e exige considerar bibliotecas/SDKs. A tabela de campos é insumo para essa avaliação, não uma resposta pronta de “nenhuma coleta”. GP16 e GP19 permanecem pendentes quanto à produção até as lacunas pertinentes serem verificadas. A #176 pode usar os fatos locais para preparar o texto, explicitando o que ainda precisa de confirmação; este documento não conclui a #79 inteira.

## 7. Fontes e verificação documental

Fontes oficiais consultadas em 25/11/2026. Foram usadas páginas da Expo SDK 57; a referência `latest` já apontava para SDK 58 e não foi utilizada para atribuir comportamento específico à versão instalada.

- [Google Play — Segurança dos dados](https://support.google.com/googleplay/android-developer/answer/10787469).
- [Expo SDK 57 — Notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/).
- [Expo SDK 57 — SQLite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/).
- [Android — Auto Backup](https://developer.android.com/identity/data/autobackup).

Evidências locais adicionais: [composição](../../src/di/container.ts), [persistência](../../src/di/persistence.ts), [executor](../../src/infra/database/expoSqlExecutor.ts), [configuração](../../app.json), [perfis EAS](../../eas.json), [dependências declaradas](../../package.json) e [resoluções](../../package-lock.json).

Revisão humana e aprovação pendentes. Nenhuma prática de dados, biblioteca, permissão ou configuração foi alterada nesta entrega.

## 8. Verificação complementar de artefato, backup e SDKs

Verificação de 25/11/2026, sem executar build, instalação ou geração nativa. Os achados abaixo não alteram o recorte versionado da Seção 1: arquivos locais ignorados podem ser anteriores e não representam automaticamente esse commit.

| ID | Verificação | Resultado e limite |
| --- | --- | --- |
| V01 | AAB/APK existente no workspace | Busca incluindo arquivos ignorados, excluindo dependências, metadados Git e worktrees de outras atividades, não encontrou AAB ou APK. Nenhum binário foi inspecionado. |
| V02 | Consulta do build histórico no EAS | A página do build de produção registrada na documentação não foi acessível pela ferramenta web. O CLI local, em consulta `whoami --non-interactive`, retornou `Not logged in`. Não foi realizado login nem solicitado token; commit de origem, hash e dependências do AAB permanecem desconhecidos. |
| V03 | Evidência de execução GitHub Actions | Consulta à coleção de runs com evento `workflow_dispatch` retornou zero execuções. Isso não nega builds solicitados diretamente no EAS e não fornece o commit de origem do AAB histórico. |
| V04 | Backup no projeto nativo local preexistente | `android/app/src/main/AndroidManifest.xml` contém `android:allowBackup="true"`; manifesto mesclado `debug/processDebugManifest` também. Datas locais de modificação: 16/11 e 18/11/2026 respectivamente. Nenhum é versionado; não há proveniência suficiente para atribuí-los ao AAB ou ao código atual. Nenhuma regra `dataExtractionRules` ou `fullBackupContent` foi encontrada nos XML de fonte e manifestos mesclados consultados. |
| V05 | Origem potencial de backup | O plugin instalado `@expo/config-plugins` 57.0.10, arquivo `build/android/AllowBackup.js`, usa `config.android?.allowBackup ?? true`. A ausência do campo no app.json não significa backup desabilitado. O resultado do plugin não substitui a inspeção do manifesto final de produção. |
| V06 | Criptografia SQLite no ambiente local | `expo-sqlite/android/build.gradle` seleciona SQLCipher somente quando `expo.sqlite.useSQLCipher` é `true`; a propriedade não foi encontrada em `android/gradle.properties`, e não há chave/pragma no executor da aplicação. Não foi comprovada criptografia SQLCipher no AAB. |
| V07 | Componentes remotos de Notifications | O manifesto oficial da branch SDK 57 declara `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED` e serviço de mensagens Firebase. É uma fonte de biblioteca, não o pacote exato resolvido nem manifesto do build. A busca no código do app não identificou obtenção de tokens push; não se conclui ausência de componentes ou comunicação nativa só por isso. |
| V08 | Debug e produção | O manifesto mesclado local inclui Dev Launcher e componentes ML Kit/Firebase e marca Expo Updates como desabilitado. Esses componentes de debug não foram atribuídos ao AAB production nem classificados automaticamente como coleta do produto. |

Fontes adicionais consultadas nesta data: [manifesto oficial de Notifications na SDK 57](https://github.com/expo/expo/blob/sdk-57/packages/expo-notifications/android/src/main/AndroidManifest.xml) e [coleção de execuções manuais do repositório](https://api.github.com/repos/orbita83/Orbity/actions/runs?per_page=10&event=workflow_dispatch). As constatações dos arquivos instalados e do projeto Android local são evidências específicas deste ambiente; reproduzir na referência de build antes de usá-las para declarações de produção.

**Próxima entrada necessária:** o proprietário Expo/EAS deve disponibilizar, por canal privado autorizado, o AAB existente e seus metadados sanitizados (commit de origem, perfil e identificação do build), sem tokens ou credenciais. Com o arquivo será possível calcular hash, listar manifesto/permissões e módulos e comparar o código de origem. A análise de tráfego e restauração continua dependente de um ambiente de execução representativo e não foi realizada. O inventário está concluído quanto aos campos do código consultado, mas a verificação do artefato permanece pendente; nenhuma resposta de Segurança dos dados foi aprovada.
