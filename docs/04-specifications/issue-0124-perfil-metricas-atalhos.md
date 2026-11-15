# Spec — Issue #124: métricas, atalhos e navegação do perfil

Status: aprovada pelo operador para implementação em 14/11/2026; sincronizada com o código local em 15/11/2026, incluindo os ajustes P2/P3 e o cartão horizontal. A implementação está na branch `feat/perfil-metricas-atalhos`; o aceite manual e a integração final permanecem pendentes.

Referências: [#124](https://github.com/orbita83/Orbity/issues/124), [#120](https://github.com/orbita83/Orbity/issues/120), [UC-0014](use-cases/UC-0014-consultar-perfil.md), [FL-0014](flows/FL-0014.md), [F10](../../design-system/05-padroes.md#8-perfil-f10).

Guia explicativo da composição com a #123: [Implementação da tela Meu Perfil](../implementacao-meu-perfil.md). Esta spec registra o comportamento técnico da #124; o guia detalha o funcionamento da tela completa e suas limitações reais.

## 1. Objetivo e escopo

Completar Meu perfil com métricas normalizadas e atalhos acessíveis para Conquistas, Categorias e Configurações. Os destinos usam PlaceholderScreen; as telas definitivas, persistência e cálculo de métricas a partir de sessões permanecem fora desta entrega. Preservar identificação e edição do nome.

## 2. Requisitos funcionais

- Exibir Dias de sequência, Conquistas adquiridas e Horas de estudos completos, nessa ordem da esquerda para a direita, em três colunas de mesma largura, centralizadas e separadas por dois divisores verticais.
- Exibir skeleton estático das métricas na mesma disposição horizontal e skeleton dos três atalhos durante loading.
- Exibir zeros reais e mensagem acolhedora abaixo da linha inteira das métricas somente quando as três métricas normalizadas forem zero.
- Diferenciar falha de consulta de ausência de atividade. Oferecer Tentar novamente pelo alerta global existente.
- Disponibilizar atalhos após carregamento, mesmo em erro; preservar cinco abas.
- Permitir retorno explícito e pelo Voltar Android ao perfil, inclusive após acesso direto ao destino.

## 3. Regras de negócio

Para cada campo, sem coerção: números finitos positivos são truncados; zero, negativos, NaN, infinitos e tipos inválidos em execução viram zero. Exemplos: 12.9 → 12; 42.8 horas → 42; 0.9 → 0; string "12" → 0.

Normalizar em função privada do módulo de Use Cases, tanto em getProfile quanto em updateName. Retornar cópia, preservar id e name e não escrever a correção no repositório. Erros continuam sendo propagados. Não calcular novas métricas nem definir limite arbitrário. Formatação de apresentação pt-BR, sem abreviação.

Mensagem de vazio: “Sua jornada pode começar no seu ritmo. Cada momento de estudo conta.”

## 4. Contratos compartilhados

A primeira entrega, [#123](https://github.com/orbita83/Orbity/issues/123), foi integrada pelo PR #125. Base confirmada localmente e no GitHub: feat/meu-perfil, commit 7e88f635ad95f7fcd2a080b205243ed0204d4c86.

- StudentProfile mantém id, name, streakDays, achievementsCount e studyHours readonly.
- IProfileRepository e IProfileUseCases mantêm getProfile(): Promise<StudentProfile> e updateName(name: string): Promise<StudentProfile>.
- Reutilizar InMemoryProfileRepository, DomainError e ValidationError.
- Reutilizar repositories.profile, useCases.profile e overrides de createAppContainer.
- Preservar ProfileState e ProfileActions; não criar getMetrics, repositório de métricas ou estado separado.

## 5. Arquitetura por camada

Model e Infra permanecem inalterados. ProfileUseCases normaliza o retorno do mesmo repositório. DI mantém a composição existente. useProfileViewModel continua sendo a única fonte de estado do perfil. View apenas apresenta dados, formata números e dispara ações/navegação.

Fluxo: View → ViewModel → IProfileUseCases → IProfileRepository. Views não tratam exceções de negócio.

## 6. Componentes e propriedades

### 6.1. ProfileMetricsCard

Exportação nomeada com `metrics` contendo `streakDays`, `achievementsCount` e `studyHours` readonly ou `null`; `loading` boolean obrigatório; `theme` opcional, com padrão `themes.cosmic`.

- `metricsRow` usa `flexDirection: "row"`, `alignItems: "stretch"` e `space.sm`. Cada `metric` usa `flex: 1`, `minWidth: 0` e alinhamento central. A ordem é sequência, conquistas e horas.
- Dois divisores verticais usam `divider.width`, `color.border`, `alignSelf: "stretch"` e margem vertical `space.sm`; não possuem altura fixa.
- Valores usam `font.title`, `on-action` sobre fundo `action`, cápsula com `radius.md`, `maxWidth: "100%"` e `flexShrink: 1`. Valores e legendas em `font.label` são centralizados, com `allowFontScaling`, sem `numberOfLines` nem altura fixa de texto.
- O skeleton mantém três colunas e os divisores, com barras percentuais e alturas dos `lineHeight` tipográficos. As barras são ocultadas do leitor; o cartão anuncia `busy`.
- O contorno permanente usa `color.border`, `divider.width` e `radius.lg`, inclusive no skeleton. A separação visual não depende de sombra no iOS/tema dark; `elevation.card` é preservada no Android, sem novos tokens de sombra ou alteração de estilos globais.
- `metrics === null` fora de loading informa indisponibilidade sem números. Com três zeros, a mensagem acolhedora fica abaixo da linha e ocupa a largura disponível do cartão.
- O componente recebe métricas já normalizadas; não consulta repositório, modifica regras de negócio ou controla os demais elementos da tela.

### 6.2. ProfileShortcutItem e componentes de apoio

ProfileShortcutItem (export nomeado): icon MaterialSymbolName, title, description, href restrito a /achievements | /categories | /settings; loading e theme opcionais. Link asChild envolvendo Pressable, com StyleSheet.flatten para o estilo do filho do Link. Skeleton sem interação. Ícone, título, apoio e chevron decorativo. Foco visível e feedback de opacidade somente no ícone, preservando contraste textual e do foco. O controle interativo privado ProfileShortcutLink mantém o foco local e é desmontado quando loading substitui o atalho por skeleton. Ao retornar ao sucesso, inicia sem foco residual; o estudante pode focá-lo novamente. Não forçar foco automaticamente nem alterar a navegação.

| Atalho | Apoio | Ícone |
| --- | --- | --- |
| Conquistas | Acompanhe suas conquistas | emoji_events |
| Categorias | Organize suas categorias de estudo | category |
| Configurações | Acesse as configurações do aplicativo | settings |

O catálogo SVG existente foi ampliado com emoji_events, category, settings, chevron_right e info para o alerta, sem nova dependência.

PlaceholderScreen recebe theme e onReturn opcionais, preservando consumidores existentes. ProfilePlaceholderScreen compartilha retorno e tratamento de foco entre as três telas. ProfileScreen com ViewModel fornecida não monta outra instância do hook: apresentação injetada e composição conectada ficam em componentes distintos.

## 7. Estados e erros

| Situação | Métricas | Atalhos |
| --- | --- | --- |
| loading | Skeleton | Skeleton |
| Sem perfil após falha | Indisponíveis, sem zeros fictícios | Disponíveis |
| Todas zeradas | Zeros e mensagem acolhedora | Disponíveis |
| Alguma positiva | Métricas normalizadas | Disponíveis |
| Erro com perfil anterior | Preservar dados e alerta global | Disponíveis |

saving não ativa skeleton de métricas. Falha ao salvar nome não oculta dados. Manter um único alerta com texto em on-surface, ícone e recuperação acessível; não duplicar a mensagem no cartão.

## 8. Navegação, tokens e acessibilidade

Rotas achievements.tsx, categories.tsx e settings.tsx reexportam as telas default da View. Registrar href: null; manter backBehavior=firstRoute. MainTabBar associa os três destinos a Perfil sem criar abas.

Telas com título correspondente e “Esta seção estará disponível em breve.”. A ação Voltar ao perfil executa replace('/profile'). O listener hardwareBackPress é registrado somente em foco e no Android; retorna true e é removido ao sair. Acesso direto funciona sem histórico.

Tema padrão cosmic, suporte explícito a light e dark por propriedades e histórias. Não há preferência global de tema persistida; a barra principal e as rotas provisórias usam o padrão cósmico. Os componentes utilizam color.surface-variant, color.border, color.action, on-action, on-surface, on-surface-variant, radius.lg/md, elevation.card, space.sm/md/lg, font.title/body/label, target.minSize e focus.ringWidth/ringOffset. Os tokens aprovados divider.width=1 dp e feedback.pressedOpacity=0.8 estão documentados no ODS e exportados pelos temas.

Alvos de 48 × 48 dp; separação mínima space.sm; foco ≥3:1 e texto ≥4,5:1; sem cor como único indicador. Cada métrica anuncia número e unidade com singular/plural, na ordem das colunas. Skeleton anuncia busy e oculta barras decorativas. Permitir fonte 200%, rolagem e quebra de linha, mantendo as colunas e crescimento vertical do cartão. Não adicionar animações. A presença dessas propriedades e os testes de estilo não equivalem à aprovação manual de acessibilidade da tela completa, especialmente do cabeçalho e modal herdados da #123.

## 9. Estratégia de testes

Jest e Testing Library, arquivos junto dos módulos; nenhuma instalação.

- Use Case: valores fracionários, negativos, zeros, não finitos e tipos inválidos em cada campo, imutabilidade, normalização na edição, propagação de erros e container isolado com o mesmo repositório.
- ViewModel: consulta, falha, recuperação, preservação dos dados na edição e erro de salvamento.
- UI: quatro estados, vazio somente com três zeros, rótulos, singular/plural, três temas e skeleton sem interação. Verificar contorno do cartão no sucesso e no carregamento; presença e remoção da cor do foco com geometria constante; feedback real do Pressable durante toque e cancelamento sem diminuir opacidade do texto/foco; transição foco → carregamento → sucesso sem blur artificial e com novo foco funcional.
- Cartão horizontal: verificar ordem e mesma largura das três colunas, dois divisores verticais decorativos, skeleton com a mesma composição, valores/legendas centralizados e escaláveis sem altura fixa/truncamento, valores extensos e mensagem de vazio fora da linha das métricas. A suíte atual do cartão contém 13 casos, contando parametrizações de tema.
- Navegação: três destinos corretos, cinco abas, Perfil selecionado, retorno explícito, acesso direto, Voltar Android e limpeza do listener.
- Regressão: identificação e modal existentes.

Histórias dos dois componentes e da composição: sucesso, carregamento, vazio, indisponibilidade/erro, valores extensos e três temas explícitos. O toolbar atual só oferece claro e escuro; não alterar a configuração global.

Para suportar a importação do Expo Router nos testes, permitir a transformação do pacote ESM standard-navigation na configuração Jest existente.

## 10. Critérios de aceitação

- Métricas seguem regras, ordem e estados definidos, sem dados fictícios em falha; apresentação em três colunas iguais com dois divisores verticais, inclusive no skeleton.
- O cartão mantém contorno nos três temas e textos escaláveis; mensagem de vazio abaixo da linha inteira. A aparência com fonte a 200% ainda exige verificação em dispositivo.
- Atalhos acessíveis abrem os três placeholders e retornam ao perfil.
- Exatamente cinco abas; Perfil selecionado nos destinos.
- Contratos, repositório e estado compartilhados, sem duplicação.
- Identificação e edição continuam funcionais; temas e tokens preservados.
- lint, tsc --noEmit, npm test, build-storybook e tests/ods-theme.test.cjs aprovados nas execuções anteriores registradas. Evidência mais recente: 89 testes em 16 suítes após o ajuste horizontal; isso não representa nova execução na atualização documental.
- Validação manual pendente deve ser registrada honestamente: teclado, leitores de tela, fonte 200%, viewport estreita e Android real.

## 11. Integração, riscos e divergências

Exceção ao CONTRIBUTING autorizada pelo operador: feat/perfil-metricas-atalhos parte de feat/meu-perfil; PR futuro para essa integração. Usar feat/*, preservando hooks, em vez do feature/* antigo das issues. Nenhum push, commit ou PR está implícito nesta implementação.

CI atual só dispara para development; executar verificações locais no PR intermediário e CI na integração final. Não modificar workflow.

F10 usa Ajustes; adotar Configurações da issue/UC/FL. FL-0014 remete Conquistas a FL-0013; #124 limita esta entrega ao placeholder. F10 não detalha erro e FL não descreve exceções: a issue e esta spec completam a lacuna. Truncamento integral e skeleton das opções foram decididos pelo operador. Persistência em memória não é definitiva.

Arquivos de produção alterados/criados: módulos de métricas no Use Case; ProfileScreen; ProfileMetricsCard, ProfileShortcutItem, ProfilePlaceholderScreen, PlaceholderScreen, MainTabBar e material-symbol; três telas e três rotas; _layout; tokens e sua documentação. Model, Infra, DI e contratos da ViewModel permanecem sem mudanças.

Ajuste de contraste: no tema cósmico, action diretamente sobre card não atende 4,5:1. Os valores usam on-action sobre fundo action (ênfase por cápsula), preservando os tokens e o requisito textual nos três temas. Feedback pressionado afeta somente o ícone decorativo para manter texto e foco integralmente contrastados.

No tema claro, on-surface-variant sobre surface-variant também fica abaixo de 4,5:1. Legendas e descrições dos novos cards usam on-surface nos três temas, mantendo hierarquia pela tipografia. O teste ODS valida os pares efetivamente utilizados.

Os testes de composição isolam Link, SafeAreaView e glifos SVG; a navegação integrada exercita Expo Router e componentes reais. Somente a primeira montagem do teste de ProfileScreen admite 30 s: a inicialização a frio dos controles nativos levou aproximadamente 25 s neste ambiente Windows. Demais testes mantêm o timeout padrão.

## Evidências históricas da implementação inicial

- `npm run lint`: aprovado, sem avisos.
- `npx --no-install tsc --noEmit`: aprovado. Cache ignorado de rotas `.expo/types` regenerado pela ferramenta do Expo para os novos destinos.
- `npm test -- --runInBand`: aprovado; 74 testes, 16 suítes.
- `npm run build-storybook`: aprovado; avisos do bundler sobre eval em dependência Expo e tamanho dos chunks, sem falha.
- `node tests/ods-theme.test.cjs`: aprovado, incluindo pares textuais e foco do perfil nos três temas.
- `git diff --check`: aprovado.

Validação visual, fonte a 200%, teclado em navegador real, TalkBack/VoiceOver e dispositivo Android permanecem pendentes. A tentativa de inspeção pelo navegador integrado expirou ao acessar o servidor local; o controle do Edge também não retornou uma janela acessível. Testes de navegação usam Expo Router real em Jest; o teste do Voltar Android usa um listener controlado, sem representar validação em dispositivo.

Model, Infra, DI, contratos de perfil e dependências não foram alterados. A entrega está em alterações locais na branch `feat/perfil-metricas-atalhos`; nenhum commit, push ou PR foi realizado nesta etapa.

## Ajustes após revisão técnica P2/P3 — marco anterior ao layout horizontal

- Separação do cartão: borda com tokens existentes `color.border`, `divider.width` e `radius.lg`, aplicada em todos os temas e estados, independente de `elevation`.
- Foco residual: ciclo de vida do controle privado substitui o foco antigo ao entrar em carregamento. Nenhuma mudança em contratos públicos ou na navegação principal.
- Interação: testes verificam cor, largura, afastamento e raio do anel, retorno ao estilo sem foco e opacidade somente no ícone durante toque/cancelamento, nos três temas.
- Issue #123: `updateName()` já normaliza o resultado do repositório. A regra de produção permanece inalterada; uma nova regressão verifica consulta válida seguida de resposta inválida no salvamento, preservando trim do nome, identidade e imutabilidade dos dados. As validações de nome existentes continuam obrigatórias.
- A validação manual indicada acima continua pendente; testes de estilo não comprovam aparência renderizada, leitor de tela ou comportamento em dispositivo real.

Validações após os ajustes P2/P3:

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Aprovado, sem avisos |
| `npx --no-install tsc --noEmit` | Aprovado |
| `npm test -- --runInBand` | Aprovado: 84 testes em 16 suítes |
| `npm run build-storybook` | Aprovado; permanecem os avisos do bundler sobre eval na dependência Expo e tamanho de chunks |
| `node tests/ods-theme.test.cjs` | Aprovado |
| `git diff --check` | Aprovado |

Também passaram 30 testes direcionados a métricas, interação e validações de nome. A revisão alterou somente os dois componentes, seus testes, a regressão de métricas no Use Case e esta spec. Arquitetura MVVM, contratos compartilhados, implementação da edição de nome e navegação principal foram preservados. Sem instalação de dependências, commit, push ou PR.

## Ajuste final do ProfileMetricsCard: três colunas

A disposição vertical inicialmente especificada foi substituída pela apresentação horizontal solicitada a partir do protótipo. A mudança de produção ficou restrita ao ProfileMetricsCard, com atualização de seus testes: três colunas centralizadas, dois divisores verticais, skeleton equivalente e mensagem de vazio abaixo da linha. Cabeçalho, atalhos, navegação, normalização e edição do nome não foram modificados por essa correção.

### Evidências mais recentes registradas

| Verificação anterior, após o layout horizontal | Resultado registrado |
| --- | --- |
| `npm run lint` | Aprovado |
| `npx --no-install tsc --noEmit` | Aprovado |
| `npm test -- --runInBand` | Aprovado: **89 testes em 16 suítes** |
| Testes direcionados de `ProfileMetricsCard` | **13 casos aprovados**, contando parametrizações |
| `npm run build-storybook` | Aprovado; avisos do bundler sobre eval em dependência Expo e tamanho de chunks, sem falha |
| `node tests/ods-theme.test.cjs` | Aprovado |
| `git diff --check` | Aprovado |

Os marcos de 74 e 84 testes acima são históricos, não a contagem mais recente. A sincronização documental em 15/11/2026 não reexecuta lint, TypeScript, Jest ou Storybook nem converte validações manuais pendentes em aprovação. Nesta sincronização são conferidos a correspondência com o código, os links locais e `git diff --check`.

### Pendências de aceite preservadas

- Inspeção em dispositivo do cartão horizontal nos três temas, em viewport estreita, com valores extensos e fonte a 200%.
- Teclado real, ordem e percepção de foco, TalkBack/VoiceOver e anúncios dinâmicos.
- Retorno Android em aparelho/emulador e ciclo de vida real do listener; o teste atual usa um listener controlado.
- Auditoria dos componentes herdados da #123: nome longo, altura do campo, contraste dos estados, confinamento/restauração de foco e movimento reduzido do modal. A semântica declarada não certifica esses comportamentos.
- Validação integrada e revisão para conclusão das Issues #120/#124. Persistência definitiva, cálculo real das métricas e telas finais dos destinos continuam fora desta entrega.
