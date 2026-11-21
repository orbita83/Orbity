# Padrões

<!-- Camada 4 do Design System: fluxos e padrões de interação do Orbity. -->

## 1. Entrada e Onboarding (F0)

- **Objetivo:** Apresentar o app e liberar acesso rápido à Tela Inicial.
- **Componentes:** Splash com logo e slogan (`font.title`, `font.body`), Carrossel de 4 passos com indicadores de etapa (`space.sm`, `color.action`), Botão "Próximo" (`button.bg`, `button.label`, `button.radius`, `font.label`), Botão "✕" (Pular) (`color.on-surface`, `font.label`, `space.md`).
- **Passos:**
  1. Splash exibe logo e slogan.
  2. Carrossel apresenta recursos; estudante avança com "Próximo" ou sai via "✕".
  3. Fim do fluxo direciona para **1. Tela Inicial**.
- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Carregando** | Fundo neutro com indicador discreto de carregamento | `color.surface`, `color.on-surface` |
| **Vazio** | Primeiro slide com ilustração de boas-vindas e introdução | `font.title`, `font.body`, `space.lg` |
| **Sucesso** | Transição imediata e fluida para Tela Inicial | `motion.duration.medium`, `motion.easing.standard` |

- **Faça:** Permita pular o onboarding a qualquer momento.
- **Evite:** Bloquear o estudante com cadastros obrigatórios antes da tela inicial.

---

## 2. Navegação e Modo Foco (F1, F2)

- **Objetivo:** Apresentar a sequência de estudos em um planeta centralizado, permitir a navegação entre as cinco abas e reunir foco, progresso diário e conquistas em um painel de atividade deslizante.
- **Origem:** Composição cósmica consolidada em 22/10/2026 a partir da referência visual de três estados do protótipo. As decisões de composição e interação desta tela ficam neste padrão; os componentes reutilizáveis continuam documentados em [04-componentes/](04-componentes/).
- **Componentes:** Cabeçalho com marca e acesso a Configurações; visualizador vetorial `PlanetStreakView`, composto por `PlanetIllustration` e contador de sequência; campo de estrelas `CosmicStarfield`; painel `FocusBottomSheet` com alça; cards de Modo Foco, Seu progresso, Conquistas, Última sessão e Como funciona?; `PrimaryButton` para iniciar ou encerrar foco; navbar `NavBar` com cinco abas; ícones `CosmicIcon` e modais de detalhes. Os componentes compartilhados usam `themes.cosmic`, o mesmo tema global de Tarefas e das demais telas.
- **Passos:**

  1. Estudante acessa a Tela Inicial e visualiza o campo de estrelas, o planeta centralizado com a contagem textual de dias de sequência e o convite **Deslize para explorar**. O painel começa completamente recolhido.
  2. Toque no planeta, toque no convite ou swipe para cima abre o estágio **1.1 — Intermediário**, deslocando o planeta para cima e revelando os cards de Modo Foco, Seu progresso e Conquistas.
  3. Novo swipe para cima ou acionamento da alça abre o estágio **1.2 — Expandido**. O painel se posiciona abaixo do cabeçalho e acrescenta os cards Última sessão e Como funciona?.
  4. Durante o arraste, o painel acompanha o dedo. A alça permite arrastar em qualquer posição de rolagem; puxar o conteúdo para baixo movimenta o painel somente quando o gesto começa no topo da lista. Se o conteúdo estiver rolado, o gesto permanece na lista.
  5. Swipe para baixo reduz um estágio; um arraste longo pode recolher completamente. Movimentos curtos retornam à posição de origem. Toque na alça alterna os estágios, e `Escape` recolhe o painel na prévia por teclado.
  6. A navbar permanece fixa e visível nos estágios recolhido, intermediário e expandido, com as abas **Início**, **Tarefas**, **Rotinas**, **Cosmos** e **Perfil**. Neste fluxo, somente a sessão de foco ativa oculta a navbar; a seleção múltipla de tarefas segue o padrão F6.
  7. **Iniciar foco** apresenta cronômetro regressivo e a ação **Encerrar foco**. Ao encerrar, somente os minutos efetivamente decorridos são registrados na sessão (card Última sessão); não se acrescenta uma duração fixa fictícia. Desde a 1.2, o card **Seu progresso** (antes "Progresso de hoje") não conta minutos: conta as tarefas avulsas concluídas sobre o total geral e cada rotina de hoje como uma unidade, concluída pela ocorrência do dia ([RN-0007](../docs/02-requirements/business-rules/RN-0007.md)). O contador de sequência continua vinculado ao estado da ViewModel.
  8. O estudante pode consultar os detalhes das conquistas, seus critérios, o resumo da última sessão e a explicação de funcionamento pelos respectivos cards. No painel, as conquistas aparecem como [caixas de conquista](04-componentes/cartao-conquista.md) sem rótulo de dias; o detalhe abre como modal (F3).
  9. Configurações oferece a opção local de redução de movimento. As transições automáticas respeitam essa opção e a preferência do sistema. O conteúdo do painel admite rolagem quando a altura disponível ou o texto ampliado exigem.

- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Recolhido** | Campo de estrelas vetorial, planeta centralizado, sequência no centro e convite Deslize para explorar; painel oculto e navbar visível | `cosmicTokens.color.background`, `cosmicTokens.planet`, `cosmicTokens.font.streak`, `cosmicTokens.font.streakLabel` |
| **Intermediário — 1.1** | Planeta sobe e encolhe (190 de 320); painel a 35,4% da cena; painel com alça e cards de Modo Foco, Seu progresso e Conquistas; navbar visível | `cosmicTokens.color.sheet`, `cosmicTokens.color.card`, `cosmicTokens.radius.sheet`, `cosmicTokens.radius.card` |
| **Expandido — 1.2** | Painel abaixo do cabeçalho, planeta oculto, com Última sessão e Como funciona? além dos cards anteriores; navbar visível | Os mesmos tokens do estágio intermediário e `cosmicTokens.font.title`, `cosmicTokens.font.body` |
| **Sessão em andamento** | Contador regressivo, ação Encerrar foco e indicação textual de foco; navbar oculta | `cosmicTokens.color.action`, `cosmicTokens.color.text`, `cosmicTokens.font.button` |
| **Carregando** | Esqueletos dos cards do painel e estado de carregamento anunciado | `cosmicTokens.color.card`, `cosmicTokens.color.track`, `cosmicTokens.radius.card` |
| **Vazio** | Progresso zerado, ação Iniciar foco disponível e apresentação acolhedora da jornada | `cosmicTokens.font.title`, `cosmicTokens.font.body`, `cosmicTokens.color.muted` |
| **Sucesso** | Contador textual de tarefas e rotinas concluídas sobre o total do dia, como "1 / 25", porcentagem fora da barra e preenchimento proporcional exato (1.2; antes "15 / 25 min"); conquistas identificáveis por estado, ícone e nome acessível | `cosmicTokens.color.progress`, `cosmicTokens.color.progressEnd`, `cosmicTokens.color.track`, `cosmicTokens.color.unlocked` |

- **Faça:** Preserve o planeta e o contador central como elementos vetoriais e textuais independentes de uma imagem de fundo; mantenha a sequência escalável e perceptível além da cor.
- **Faça:** Mantenha a navbar visível nos três estágios do painel e ofereça abertura e recolhimento por gesto, toque e teclado, respeitando a redução de movimento.
- **Faça:** Diferencie arrastar o painel de rolar os cards e preserve os limites dos três pontos de ancoragem.
- **Faça:** Exponha nomes de controles, seleção das abas, valor textual do progresso e critérios das conquistas; oculte elementos decorativos do leitor de tela e siga [06-acessibilidade.md](06-acessibilidade.md).
- **Faça (1.2):** Use a [barra de progresso](04-componentes/barra-progresso.md) com o contador "concluídas / total" e a porcentagem em texto ao lado da barra, nunca sobre o preenchimento.
- **Faça (1.2):** Dê a cada caixa de conquista um nome acessível com posição e estado (ex.: "Conquista 2 de 6, desbloqueada"), sem rótulo visual de dias.
- **Evite:** Exigir exclusivamente swipe, deixar o estudante sem saída, adicionar minutos fictícios ou introduzir mensagens e mecânicas punitivas.
- **Evite:** Tratar a documentação do padrão ou a existência de histórias como comprovação de implementação e validação concluídas.

### Tokens da variante

As cores e lacunas estão em [02-tokens.md](02-tokens.md#variante-cósmica). `themes.cosmic` exporta os papéis semânticos implementados; referências a `cosmicTokens` nesta seção descrevem também recursos ainda não implementados.

| Grupo | Decisão |
| --- | --- |
| Cores | Fundo, painel, cards, texto, ação, foco, progresso, conquistas e planeta: [variante cósmica](02-tokens.md#variante-cósmica) |
| Acessibilidade | Texto escalável; nomes de controles e estados de seleção; modal nativo para detalhes |
| Progresso | Altura `size.progress-height` (20 dp); preenchimento proporcional exato |
| Conquistas | Cadeado e descrição acessível |
| Tipografia | Marca `font.title` (24/32); sequência `font.streak` (64/64); título de card `font.card-title` (16/24, 600); descrição e texto de apoio `font.body-sm` (14/20); contador e botão `font.label`; navbar conforme `navbar.*` |
| Forma | Botão `radius.md` (12 dp); card `radius.lg` (16 dp); painel `radius.sheet` (24 dp); medalhas em caixa arredondada `achievement.size` (60 dp, `radius.lg`) |
| Movimento | Painel `motion.duration.medium` (300 ms) com `motion.easing.standard`; atualização instantânea com movimento reduzido |
| Visualizador | Desenho do protótipo em grade de 280 × 280 (aspecto 1); 320/390 da largura quando recolhido, 190/320 no intermediário e oculto sob o painel no expandido; sequência como texto real |
| Swipe | Ativação após 10 dp; movimento intencional de 48 dp ou velocidade de 0,55 dp/ms; projeção de 160 ms; limites nos três pontos de ancoragem |

No mobile, a tela ocupa a largura disponível e respeita as áreas seguras, utilizando a barra de status real do sistema (Android/iOS).

### Arte e implementação de referência

No protótipo de referência, o visualizador usa `react-native-svg`, já presente no projeto. `PlanetIllustration` desenha esfera, iluminação, relevo e anéis em camadas vetoriais. `PlanetStreakView` centraliza o contador e recebe a sequência da ViewModel, sem manter uma cópia independente. `CosmicStarfield` produz o campo de estrelas de forma determinística. O deslocamento do planeta acompanha o painel; não há imagem de fundo ou textura raster. A ilustração PNG da iteração anterior foi preservada como arte de referência e não é mais importada pela tela. Este protótipo não implementa rotação axial ou evolução visual por ponto de sequência.

`HomeScreen` compõe a tela, `FocusBottomSheet` organiza os cards e `CosmicIcon` fornece os ícones. `useActivitySheetMotion` coordena arraste, limites, velocidade de soltura, rolagem e transições. O estado fica na ViewModel; dados e sessões usam o repositório em memória. Encerrar foco registra somente minutos efetivamente decorridos, sem adicionar os dez minutos fixos da versão anterior. Não há persistência entre recarregamentos. As outras abas permitem demonstrar a seleção, sem implementar seus módulos.

Os arquivos específicos da tela e do visualizador descritos acima não estão presentes nesta branch documental. Esta seção especifica o protótipo de referência; não comprova que a integração já está disponível neste checkout.

### Revisão e evidências do protótipo

Na branch que disponibilizar a implementação de referência, execute `npm run storybook` e abra **Telas → Início cósmico → Referência · três estados lado a lado**. Há também histórias individuais para os estágios, foco ativo, estado vazio, carregamento e uma história com interação automatizada.

O visualizador isolado fica em **Design System → Planeta e sequência**, com controle do número de dias e exemplos de 0, 12 e 365 dias.

As verificações de lint, tipos e builds são registradas na entrega. A existência de uma história de interação não comprova sua execução; validação real em Android/iOS deve ser identificada separadamente.

Na primeira iteração, lint, tipos, builds do Expo/Storybook e três verificações da ViewModel passaram. Na revisão do visualizador, lint, tipos e ambos os builds passaram novamente, assim como as três verificações existentes da ViewModel. Cinco verificações isoladas adicionais cobriram resolução de swipe/flick, limites em viewport pequeno, acompanhamento do dedo e recolhimento, interação com rolagem e retorno após cancelamento. Os testes usam um adaptador de animação sem duração real; não substituem a validação por toque em aparelho. O SVG do planeta foi renderizado e inspecionado visualmente de forma isolada.

As verificações relatadas acima pertencem ao histórico do protótipo de referência e não foram reexecutadas nesta alteração documental. A disponibilidade dos componentes, das histórias e da rota inicial deve ser confirmada na branch de implementação.

---

## 3. Criação de Tarefas e Rotinas (F4, F7)

- **Objetivo:** Cadastrar tarefas ou hábitos com data, hora, recorrência e categoria.
- **Componentes:** Formulário em modal (`color.surface`, `radius.lg`, `elevation.card`, `space.md`), Campos de texto (`radius.md`, `font.body`, `color.surface`, `color.focus`), Seletores de opções (`radius.md`, `space.sm`, `font.label`), Botão "Criar" (`button.bg`, `button.label`, `button.radius`), Modal de confirmação/sucesso (`radius.lg`, `elevation.card`, `font.title`, `space.lg`).
- **Passos:**
  1. Toque em "+ Nova tarefa" ou "+ Nova rotina".
  2. Preenche título/nome, datas/dias da semana e adiciona subtarefas se for rotina.
  3. Toque em "Criar"; valida campos obrigatórios com mensagem em `color.on-surface` e ícone em `color.error` (`font.label`, `space.sm`).
  4. Exibe modal de confirmação (2.2) e retorna à lista com o item criado.
- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Erro** | Mensagem textual em `color.on-surface` com ícone de alerta em `color.error` e anel de foco no campo (WCAG 1.4.1 e 1.4.3) | `color.on-surface`, `color.error`, `font.label`, `color.focus`, `space.sm` |
| **Vazio** | Campos limpos com textos de exemplo (*placeholder*) | `color.surface`, `color.on-surface`, `font.body` |
| **Sucesso** | Modal de feedback ("Tarefa criada!") com botão de fechamento | `radius.lg`, `elevation.card`, `color.action`, `font.title` |

- **Faça:** Preserve os dados digitados caso ocorra erro de validação e garanta identificação por texto e ícone (independência de cor e contraste).
- **Evite:** Limpar formulários por falhas de preenchimento ou utilizar apenas texto colorido de baixo contraste para sinalizar erros.

---

## 4. Gestão de Tarefas e Ações em Lote (F5, F6)

- **Objetivo:** Filtrar, marcar conclusão pontual ou executar ações em massa (fixar, excluir).
- **Componentes:** Filtros segmentados (*Todos / Pendentes / Concluídas*) (`radius.md`, `space.sm`, `font.label`), Checkboxes circulares (`color.action`, `color.surface`, `radius.md`), Cards de tarefa (`radius.lg`, `elevation.card`, `space.md`, `font.body`), [Tag de categoria](04-componentes/tag-categoria.md) dentro do card (`color.action-subtle`, `color.on-surface`, `font.label`, `radius.md`), Barra contextual CAB (`color.surface`, `elevation.card`, `space.md`, `font.label`, `color.on-surface`; desde a 1.2, ver [barra-acoes-contextuais.md](04-componentes/barra-acoes-contextuais.md)).
- **Passos:**
  1. Toque no círculo marca/desmarca a tarefa imediatamente.
  2. Abas filtram a visualização da lista por status (*Todos / Pendentes / Concluídas*). **Não há filtro por categoria nesta iteração** (issue #25): a categoria só aparece no card. Um filtro por categoria, se vier, precisa de especificação própria.
  3. *Long-press* entra no modo de seleção múltipla (2.3); navbar é substituída por:
     - Topo: cabeçalho fixo "✕ · N selecionados" (`font.label`), com fio `color.border-subtle` e `shadow.bar-top` (1.2).
     - Barra inferior: **Fixar**, **Marcar todas**, **Excluir (n)** com ícone em `color.error` e rótulo legível em `color.on-surface` (`font.label`), no lugar exato da navbar, com fio `color.border-subtle` e `shadow.bar` (1.2).
  4. "✕" cancela a seleção e restaura a navbar.
- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Carregando** | Cartões pulsantes em superfície neutra (*skeleton*) | `color.surface`, `radius.md`, `motion.duration.short` |
| **Vazio** | Planeta ao fundo (120 dp, decorativo) e mensagem embaixo, centralizados na área de conteúdo, na mesma posição em Tarefas e Rotinas (1.3). Textos por caso: sem tarefas, "Nenhuma tarefa em órbita"; filtro Pendentes, "Nenhuma tarefa pendente"; filtro Concluídas, "Nenhuma tarefa concluída ainda" | `font.card-title`, `font.body-sm`, `color.on-surface-variant`, `color.action-subtle`, `cosmicTokens.color.sheetBorder`, `cosmicTokens.color.inactive`, `space.md` |
| **Sucesso** | Rótulo riscado e feedback sutil ao concluir o item | `color.action`, `font.body`, `motion.duration.short` |

- **Faça (1.2):** Divida a linha de filtros em colunas de largura igual, alinhadas ao botão Criar e aos cards; escreva prazos no formato "19/10 · 08:00–09:00".
- **Faça (#25):** Mostre a categoria da tarefa como [tag](04-componentes/tag-categoria.md), com ícone e rótulo, antes do prazo na linha de metadados do card. Tarefa sem categoria não mostra tag. Com texto ampliado, tag e prazo quebram de linha, e o título nunca é truncado.
- **Evite (#25):** Colar o rótulo da categoria ao prazo como texto solto, ou distinguir categorias só por cor.
- **Faça:** Exija confirmação antes de apagar itens (individual ou em lote) com a variante Confirmação do [modal](04-componentes/modal.md), mantendo o botão "Excluir" no estilo primário existente (`PrimaryButton`) e "Manter tarefas" no estilo secundário existente.
- **Evite:** Mensagens ou alertas punitivos ao desmarcar tarefas concluídas.

---

## 5. Execução e Conclusão de Rotina (F8)

- **Objetivo:** Cumprir hábitos diários com tarefas reordenáveis e controle flexível.
- **Componentes:** Cards de turno (`radius.lg`, `elevation.card`, `space.md`, `font.title`), Alças de arraste (`⋮⋮`) (`color.on-surface`, `space.sm`), Botão "Marcar como concluída" (`button.bg`, `button.label`, `button.radius`), Botão secundário "Desmarcar todos" (`color.action`, `font.label`, `button.radius`).
- **Passos:**
  1. Toque na rotina abre tela de detalhes com lista de hábitos.
  2. Tarefas podem ser reordenadas via alças `⋮⋮`.
  3. Conclusão pode ser individual (item a item) ou total ("Marcar como concluída").
  4. Estado concluído risca itens e exibe "Desmarcar todos" para reversão.
- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Carregando** | Esqueleto (*skeleton*) estrutural dos cards da rotina | `color.surface`, `radius.lg`, `motion.duration.short` |
| **Vazio** | "Nenhuma tarefa nesta rotina" com atalho para adicionar | `font.body`, `button.bg`, `button.label`, `space.md` |
| **Sucesso** | Tarefas riscadas e feedback comemorativo de avanço no Cosmos | `color.action`, `radius.lg`, `font.body`, `motion.duration.short` |

- **Faça:** Permita reverter a conclusão sem perda punitiva de sequência e confirme a exclusão da rotina pelo [modal](04-componentes/modal.md) compartilhado (`ConfirmDialog`), com "Excluir rotina" no estilo primário existente (`PrimaryButton`), "Manter rotina" no estilo secundário existente e aviso com "Desfazer" após excluir.
- **Evite:** Bloquear a reorganização de hábitos na rotina.

---

## 6. Conquistas (F3)

- **Objetivo:** Visualizar marcos alcançados, acompanhar critérios de desbloqueio de novas conquistas e compartilhar vitórias de estudo.
- **Componentes:** Campo de busca ("Buscar conquistas") (`radius.md`, `space.sm`, `font.body`, `color.focus`), Grade/Lista de cards de conquistas (`radius.lg`, `elevation.card`, `space.md`), Modal de detalhes da conquista (**1.4**) (desde a 1.2, [modal.md](04-componentes/modal.md): `radius.sheet`, `shadow.modal`, `color.scrim`, medalha de 120 dp em `radius.xl`, `space.lg`, `font.title`, `font.body`), Botão "Compartilhar" (`button.bg`, `button.label`, `button.radius`), Botão "✕" (Fechar) (`color.on-surface`, `font.label`).
- **Passos:**
  1. Acessa a tela de Conquistas (**1.3**) a partir do painel expandido (**1.2**) ou da aba Perfil.
  2. Filtra ou busca conquistas pelo campo de busca.
  3. Toque em um card de conquista abre o modal de detalhes (**1.4**), exibindo título, descrição do critério, data de desbloqueio (ou progresso restante) e botão "Compartilhar".
  4. Botão "Compartilhar" dispara o compartilhamento nativo; botão "✕" fecha o modal e retorna à lista. O modal também fecha com `Escape` e com o gesto de voltar, e devolve o foco à conquista de origem.
- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Carregando** | Esqueletos pulsantes dos cards de conquistas | `color.surface`, `radius.lg`, `motion.duration.short` |
| **Vazio** | Mensagem de nenhuma conquista encontrada na busca ou silhueta neutra com critério visível | `color.on-surface`, `font.body`, `space.md` |
| **Sucesso** | Medalhas ativas destacadas, indicador de progresso e modal de detalhes completo | `color.action`, `radius.lg`, `elevation.card`, `font.title` |

- **Faça:** Apresente critérios de desbloqueio claros mesmo para itens não conquistados, valorizando o progresso acumulado.
- **Evite:** Ocultar critérios ou usar mensagens de frustração por conquistas não alcançadas.

---

## 7. Cosmos (F9)

- **Objetivo:** mostrar a constelação do estudante, formada pelas estrelas que ele já ganhou, e contar a história de cada uma. Segue o RF-0017 (uma estrela a cada dia somado à sequência e uma a cada conquista), o RF-0018 (constelação em grafo, só com estrelas conquistadas) e o FL-0012.
- **Componentes:** cabeçalho "Cosmos" com o subtítulo "Seu esforço, suas estrelas" e o total de estrelas; seletor Constelação / Lista (padrão de [chips-filtro.md](04-componentes/chips-filtro.md)); [Grafo de constelação](04-componentes/grafo-constelacao.md) com legenda, controles de zoom e detalhe da estrela; visualização em Lista; navbar com a aba Cosmos ativa.
- **Passos:**
  1. O estudante toca na aba **Cosmos** da navbar.
  2. Vê a constelação: um ponto para cada dia somado à sequência e uma estrela de 4 pontas para cada conquista, ligados como num grafo. Uma pausa entre sequências aparece como ponte tracejada.
  3. Toca numa estrela: ela e as vizinhas se destacam, o resto esmaece, e o detalhe mostra nome, origem, data e uma curiosidade astronômica.
  4. Pode arrastar uma estrela (as vizinhas acompanham), arrastar o fundo para mover o mapa e usar o zoom.
  5. Fecha o detalhe pelo "✕" ou tocando no fundo.
  6. Na **Lista**, vê as mesmas estrelas em cards, da mais nova para a mais antiga; tocar num card volta ao grafo com a estrela selecionada.
- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Carregando** | Área do grafo vazia, sem estrelas falsas | `constellation.bg` |
| **Vazio** | Uma única estrela (o primeiro dia de sequência) e a dica "Toque numa estrela · arraste para explorar" | `constellation.node-streak`, `font.caption` |
| **Sucesso** | Constelação completa; com uma estrela selecionada, vizinhas destacadas e detalhe aberto | `constellation.*`, `font.card-title`, `font.body-sm` |

- **Faça:** diferencie sequência e conquista pela forma, pela legenda e pelo texto, além da cor; mantenha a Lista como alternativa acessível.
- **Evite:** estrelas bloqueadas ou "a desbloquear" (RF-0018, CA-05); fazer o estudante perder estrelas ou ver a constelação regredir por pausas.

---

## 8. Perfil (F10)

- **Objetivo:** Consultar histórico consolidado de hábitos, total de horas dedicadas, gerenciar categorias e acessar preferências gerais do aplicativo.
- **Componentes:** Cabeçalho de identificação do estudante com selo circular baseado em `target.min-size` (48 × 48 dp com raio de 24 dp, `font.title` para inicial e nome, `font.body` para subtítulo), Cards de métricas com sequência, horas e conquistas (`radius.lg`, `elevation.card`, `space.sm`, `font.title` para valor numérico, `font.label` para legenda, `color.action`), Atalhos navegáveis de Conquistas, Categorias e Ajustes com altura mínima `target.min-size` (48 dp), `radius.md`, `space.md`, `font.body` para título, `font.label` para descrição de apoio e `color.on-surface`.
- **Passos:**
  1. Estudante seleciona a aba **Perfil** na navbar fixa.
  2. Visualiza o cabeçalho e os cards com métricas acumuladas (sequência de dias, horas e conquistas obtidas).
  3. Toque em "Conquistas >" redireciona para a lista de conquistas (**1.3**).
  4. Toque em "Categorias >" direciona para o gerenciamento de categorias e tags de estudo.
  5. Toque em "Ajustes >" abre as configurações gerais do app (tema, notificações, conta).
- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Carregando** | Esqueleto (*skeleton*) dos cards de métricas e opções | `color.surface`, `radius.md`, `motion.duration.short` |
| **Vazio** | Métricas zeradas apresentadas de forma acolhedora, incentivando o início da jornada | `color.on-surface`, `font.body`, `space.md` |
| **Sucesso** | Métricas consolidadas com destaque visual positivo e atalhos rápidos disponíveis | `color.action`, `radius.lg`, `elevation.card`, `font.title` |

- **Faça:** Enfatize o esforço total acumulado (horas totais e conquistas), mantendo tom encorajador e construtivo.
- **Faça:** Utilize exclusivamente os tokens formais para títulos e subtítulos (`font.title` para títulos principais e `font.body` com peso enfático para subtítulos/cards), sem inventar tamanhos intermediários.
- **Faça:** Dimensione barras de skeleton com larguras percentuais e alturas correspondentes aos `lineHeight` dos tokens tipográficos (32 px para títulos, 24 px para corpo e 20 px para rótulos).
- **Evite:** Destaques alarmantes em vermelho ou penalizações visuais caso a sequência de dias seja interrompida.

---

## Resumo dos Fluxos (Excalidraw)

- **F0 (Entrada):** Splash → Onboarding (4 passos) → 1. Tela Inicial.
- **F1 (Navegação):** 5 abas fixas (*Início*, *Tarefas*, *Rotinas*, *Cosmos*, *Perfil*); visível nos três estágios do painel e oculta durante foco ativo ou seleção múltipla (2.3).
- **F2 (Foco/Progresso):** Planeta → toque ou swipe para cima (1.1 Foco/Progresso) → expansão (1.2 com Última sessão e Como funciona?); swipe para baixo reduz ou recolhe o painel.
- **F3 (Conquistas):** 1.2 / Perfil → 1.3 Lista → 1.4 Ver Conquista (detalhes e compartilhar).
- **F4 (Criar Tarefa):** 2. Lista → 2.1 Nova Tarefa → 2.2 Modal Sucesso → Lista atualizada.
- **F5 (Gestão Tarefa):** Checkbox simples (concluir/desmarcar); abas de filtro por status; tag de categoria no card (sem filtro por categoria); menu "…".
- **F6 (Seleção Múltipla):** Long-press na tarefa → 2.3 Barra contextual (Fixar, Marcar todas, Excluir).
- **F7 (Criar Rotina):** [Rotinas] → [Nova Rotina] (nome, dias, tarefas arrastáveis `⋮⋮`).
- **F8 (Executar Rotina):** [Detalhe Rotina] → marcar itens ou "Marcar como concluída" → reverter via "Desmarcar todos".
- **F9 (Cosmos):** [Cosmos] → toque na estrela → modal [Detalhe da Estrela].
- **F10 (Perfil):** [Meu Perfil] (sequência, conquistas, horas) → atalhos para Conquistas, Categorias e Ajustes.

---

## Lacunas e Inconsistências Mapeadas

1. **Nome do App:** Oficializado como **Orbity** (Cosmos refere-se apenas ao módulo de recompensas).
2. **Modo Foco:** O padrão F1/F2 especifica cronômetro regressivo e encerramento no painel; a integração e a persistência das sessões ainda precisam ser entregues nesta branch.
3. **Tarefas de Rotina vs. Gerais:** Definir se tarefas de rotinas aparecem ou não na aba geral de Tarefas.
4. **Conquistas na ERS:** Fluxo desenhado precisa ser formalizado como requisito funcional.
5. **Ajustes de UI:** Corrigir busca da tela 1.3 ("Buscar conquistas") e prever modal de confirmação na exclusão em lote. Desde a 1.2, no padrão F1/F2, o progresso é expresso como tarefas e rotinas concluídas sobre o total do dia, por exemplo, "1 / 25".
6. **Decisões abertas da 1.2:**
   - Tipos de conquista além de dias de sequência. (Se conquistas dão estrelas foi resolvido na 1.3: dão, conforme o RF-0017.)
   - Carrossel de conquistas no painel: giro automático com pausa visível ou rolagem pelo dedo. Até a decisão, use rolagem pelo dedo, que não exige controle de pausa (WCAG 2.2.2).
   - Desenho da confirmação de exclusão em lote.
   - Desenho da tela de sessão de foco ativa.
   - Glifo de Rotinas: a 1.2 mantém `autorenew`; o alvo do protótipo não foi adotado.
