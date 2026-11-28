# Política de privacidade — implementação e operação

Origem: [#176](https://github.com/orbita83/Orbity/issues/176). Refs [#79](https://github.com/orbita83/Orbity/issues/79), sem encerramento automático. Registro de 28/11/2026. Revisão humana e publicação ainda pendentes.

## Decisões aprovadas pelo operador

- Hospedagem: GitHub Pages, em `https://orbita83.github.io/Orbity/privacidade/`.
- Contato: `suporte.orbity@gmail.com`, informado como criado, configurado e disponível; nenhum e-mail de teste foi enviado nesta tarefa.
- Manutenção: equipe de desenvolvimento do Orbity; aprovação pelos revisores da equipe.
- Revisão a cada seis meses e sempre que mudarem práticas de dados, permissões, SDKs ou serviços externos.
- Processo: Issue → implementação → Pull Request → revisão → publicação.
- Histórico: commits, PRs e data da última atualização no texto. Mudanças relevantes devem ser comunicadas aos usuários; definir o canal na respectiva atualização, pois não existe comunicação automática implementada.

## Referência de dados e limites

Inspeção estática da `development` em `17c0c30ed488e88baef2045755446f84f93f9b31`, anterior às alterações desta tarefa. Essa base é posterior ao inventário do [#245](https://github.com/orbita83/Orbity/pull/245); não foi tratado como inventário atualizado do binário. A versão nominal `0.1.0` não comprova equivalência com o AAB histórico.

| Prática | Evidência na base | Conteúdo correspondente |
| --- | --- | --- |
| Nome e identificador do perfil persistidos | `src/di/persistence.ts`, `src/infra/datasources/sqliteProfileDataSource.ts`, migração v8 | Perfil local editável em SQLite; sem conta remota |
| Tarefas, rotinas, categorias e ocorrências | Migrações v2–v6 e adapters `sqliteTaskDataSource`, `sqliteRoutineDataSource`, `sqliteCategoryDataSource` | Campos, finalidade, exclusão física de tarefa/categoria e lógica de rotina |
| Sessões de foco | Migração v7, `sqliteFocusSessionDataSource.ts`, `focusUseCases.ts` | Alvo e cópia de título, fases, ciclos, duração, pausas e histórico; encerrar não equivale a excluir |
| Atividade e estrelas | Migrações v1/v5, adapters de atividade e estrelas | Sequência e progresso preservados; sem expiração automática |
| Lembretes locais | `expoNotificationService.ts`, `taskUseCases.ts`, `focusUseCases.ts`, `notificationUseCases.ts` | Permissão, título de tarefa/atividade em avisos de tarefa e de fim de ciclo/pausa, conteúdo visível e limites do cancelamento |
| SQLite sem SQLCipher configurado | `expoSqlExecutor.ts`, `app.json` | Sem alegação de criptografia própria |
| Rede, SDKs e backup | Busca por rede, analytics, tokens push, autenticação em código de produto; `package.json`, lockfile, `app.json`, `eas.json` | Ausência de integração explícita não prova ausência de transmissão nativa; artefato, manifesto e restauração continuam pendentes na #79 |
| Consulta da política | Caso de uso de privacidade e serviço de link desta entrega | Somente URL HTTPS fixa, sem dados do estudante ou query string |
| Site e suporte | Decisões do operador; HTML sem scripts/formulários/recursos remotos; políticas dos provedores | GitHub Pages recebe conexão; Gmail recebe mensagens voluntárias. Não foi feita auditoria das contas dos provedores |

Não foram realizados build, instalação Android, inspeção do AAB, captura de tráfego, teste de restauração ou acesso ao Play Console. Não foi presumida coleta zero. A política é conteúdo preparado para revisão, não certificação integral da LGPD ou de Segurança dos dados. Revisores devem confirmar a identificação jurídica aplicável ao responsável pelo tratamento, o enquadramento das bases legais e do público-alvo e os fatos ainda dependentes do artefato antes de usá-la na loja. Não foram inventados razão social, CNPJ, endereço, encarregado ou faixa etária.

## Arquivos e acesso no app

- Texto público: [`site/privacidade/index.html`](../../site/privacidade/index.html), HTML sem autenticação, formulário ou scripts.
- Estilos: [`site/privacy.css`](../../site/privacy.css); valores do ODS gerados a partir de `src/view/theme/tokens.ts`, sem fonte remota.
- Gerador: `node scripts/build-privacy-site.mjs`, saída ignorada `.dev/privacy-site/`. Apenas essa pasta é enviada ao Pages, não `docs/`, `src/` ou arquivos privados.
- Verificação reproduzível: depois do gerador, executar `python scripts/verify-privacy-site.py` (Python 3, biblioteca padrão). Confere estrutura, âncoras, rótulos, assets, contato e correspondência da URL com o app; não acessa a rede nem substitui a validação externa.
- App: Perfil → Configurações → botão **Política de privacidade**, com indicação de navegador externo/internet, carregamento, prevenção de toques duplicados e mensagem de falha com endereço selecionável.
- O retorno continua levando ao Perfil. Não há rota nova nem solicitação extra de permissões.
- Componentes: `ScreenHeader` e `PrimaryButton`. Tokens: `color.surface`, `color.on-surface`, `color.on-surface-variant`, `font.title`, `font.body`, `space.md` e os tokens de botão/foco já existentes.

`Linking.openURL` só confirma a entrega ao sistema; não informa status HTTP, erro 404 ou carregamento da política no navegador. O app não mostra mensagem de sucesso ou de conformidade após essa entrega. A validação automatizada usa dublês; a navegação externa real continua pendente até publicação e teste em Android.

## Configuração manual exata do GitHub Pages

O conector não oferece administração do Pages; o controle do navegador foi interrompido e não foi reutilizado. Nenhuma configuração remota foi alterada nesta tarefa.

1. Um administrador deve abrir **Settings → Pages** no repositório `orbita83/Orbity` e conferir a configuração atual. Se já houver site ou domínio personalizado, não substituir sua origem: reconciliar o conteúdo e a configuração antes de executar este workflow, pois o deploy substitui o site publicado por todo o artefato gerado.
2. Sem site existente a preservar, em **Build and deployment → Source**, selecionar **GitHub Actions**. Não selecionar `/docs`, não publicar a raiz do repositório e não configurar domínio personalizado.
3. Em **Settings → Environments → github-pages**, permitir deployment da branch **development**. Preservar as proteções e os revisores existentes; caso haja aprovador obrigatório, aguardar seu aceite. Não desativar proteção para liberar deploy.
4. Conferir que a política da organização permite as actions oficiais usadas pelo workflow. As permissões mínimas declaradas são `contents: read` no build e `pages: write` + `id-token: write` no deploy; não é necessário token pessoal nem alterar permissões globais de outros workflows.
5. Após aprovação e merge manual deste PR em `development`, a alteração em `site/` dispara **Política de privacidade no Pages**. Nenhum merge é realizado pelo agente. O workflow só publica `development`, sem builds/publicações do app e sem disparo por PR.
6. Se o workflow falhar por Pages ainda não configurado, completar os passos anteriores e usar **Actions → execução correspondente → Re-run failed jobs**. O `workflow_dispatch` também foi preparado, mas o botão **Run workflow** só aparece quando o arquivo existir na branch padrão (`main`); não mudar a branch padrão nem antecipar uma release para contornar isso.
7. Em Pages, confirmar **Enforce HTTPS** habilitado quando disponível. A URL deve permanecer `https://orbita83.github.io/Orbity/privacidade/`.
8. Após deploy bem-sucedido, abrir essa URL em sessão sem autenticação e conferir HTTP 200, certificado HTTPS, texto correto, data, contato, estilos, links e leitura em tela estreita/zoom de 200%. Registrar URL da execução, SHA publicado e data do teste. Não usar apenas a conclusão do workflow como prova de conteúdo correto.
9. Testar Perfil → Configurações → Política em Android com internet e retorno ao app. Registrar versão/commit e evidências sanitizadas. Só depois reavaliar GP17/GP18. O vínculo no Console é responsabilidade da #177 e não é concluído por este deploy.

## Manutenção

A próxima revisão periódica está prevista para **28/05/2027**, antecipada se houver mudanças relevantes. Não foi criada automação de lembrete. Cada atualização deve abrir ou vincular uma Issue, conferir código/SDKs/permissões/artefato, editar o HTML e sua data, executar as validações, obter revisão em PR, integrar conforme governança e verificar a publicação. A aprovação do texto fica registrada no PR e a execução do Pages identifica o SHA publicado.

Ao mudar dados, permissões, SDKs ou serviços, revisar também a auditoria #79 e as declarações pertinentes da #177. Registrar na Issue/PR o meio de comunicação das mudanças relevantes e a evidência de execução; não presumir notificação ao usuário só porque o HTML foi atualizado.

## Evidências e situação dos requisitos

GP17 tem acesso implementado e testes com dublês; publicação e execução externa em Android ainda não comprovadas. GP18 tem HTML e URL definidos, mas publicação, adequação final e vínculo no Console ainda pendentes. Nenhum dos dois é marcado como atendido nesta entrega. A disponibilidade da URL não foi comprovada pela consulta web de 28/11/2026; isso não é diagnóstico de status HTTP específico.

Resultados dos comandos locais e SHA da implementação são consolidados no PR e no comentário de entrega da #176. Aprovação humana, publicação manual e validação externa permanecem necessárias para o fechamento.

### Validações locais de 28/11/2026

Ambiente de execução: Node **24.22.3**, npm **11.19.1**, versões temporárias no cache, sem alteração global nem dos manifestos/lockfile. A instalação inicial incompleta foi sincronizada por `npm ci --offline --no-audit --no-fund` após os downloads, com scripts e Husky habilitados; a consulta adicional de auditoria npm não é evidência desta entrega.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Aprovado |
| `npm run typecheck` | Aprovado, com regeneração das rotas |
| `npm test -- --maxWorkers=2` | **84 suítes e 688 testes aprovados**, na cópia limpa descrita abaixo; inclui navegação Perfil → Configurações e entrega da URL a dublê de `Linking` |
| `npm run build-storybook` | Aprovado, incluindo as três histórias de Configurações; sem inspeção visual pelo navegador |
| `npm run lint:architecture` | 274 arquivos verificados, sem violações |
| `node tests/ods-theme.test.cjs` | Aprovado |
| `node scripts/verify-local-hooks.mjs` | Aprovado fora do sandbox após restrição Git/MSYS; verificou lint, arquitetura, mensagens e branches sem desabilitar hooks |
| Gerador + `python scripts/verify-privacy-site.py` | Aprovados: HTML, nove âncoras, rótulos, assets locais, tokens, contato e URL do app; sem recurso remoto automático |
| YAML do workflow e `git diff --check` | Aprovados |

Avisos não fatais de rotas extraneous nos testes e de shim/chunks do Storybook constam nos logs; não foram apresentados como falhas funcionais ou resolvidos fora do escopo. Não houve teste visual, leitor de tela, aparelho Android ou URL pública funcional. Resultados com dublês não aprovam GP17/GP18.

### Desvio local de validação

A tentativa de Jest na raiz detectou colisão com o worktree preexistente `.dev/worktrees/issue-79`. A configuração `jest.config.js` é a mesma da `development` e não foi alterada. O desvio fora do escopo está registrado na [#291](https://github.com/orbita83/Orbity/issues/291), classe B, relacionado à #227 (que tratou de `.claude/worktrees`). A tentativa foi interrompida e a suíte foi encaminhada para uma cópia limpa integral dos arquivos preparados, com a mesma configuração, todos os testes e as dependências do lockfile, sem flags de exclusão. Não foi alterado o worktree da #79. O resultado dessa execução é registrado no PR.

## Fontes consultadas em 28/11/2026

- [Google Play — Dados do usuário e política de privacidade](https://support.google.com/googleplay/android-developer/answer/10144311).
- [Google Play — Segurança dos dados](https://support.google.com/googleplay/android-developer/answer/10787469).
- [LGPD — texto oficial, especialmente arts. 6º, 7º, 9º, 14, 15–18 e 46](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).
- [GitHub Pages — origem de publicação](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
- [GitHub Pages — workflows, permissões e ambiente](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [GitHub Actions — execução manual e exigência da branch padrão](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow).
- [GitHub — privacidade](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) e [Google — privacidade](https://policies.google.com/privacy).
- [React Native — abertura de links](https://reactnative.dev/docs/0.86/linking).
