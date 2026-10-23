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
- **Componentes:** Cabeçalho com marca e acesso a Configurações; visualizador vetorial `PlanetStreakView`, composto por `PlanetIllustration` e contador de sequência; campo de estrelas `CosmicStarfield`; painel `FocusBottomSheet` com alça; cards de Modo Foco, Progresso de hoje, Conquistas, Última sessão e Como funciona?; `PrimaryButton` para iniciar ou encerrar foco; navbar `NavBar` com cinco abas; ícones `CosmicIcon` e modais de detalhes. A variante usa o contrato `cosmicTokens`, com `appearance="cosmic"` no botão e na navbar, preservando os temas claro e escuro dos componentes base.
- **Passos:**

  1. Estudante acessa a Tela Inicial e visualiza o campo de estrelas, o planeta centralizado com a contagem textual de dias de sequência e o convite **Deslize para explorar**. O painel começa completamente recolhido.
  2. Toque no planeta, toque no convite ou swipe para cima abre o estágio **1.1 — Intermediário**, deslocando o planeta para cima e revelando os cards de Modo Foco, Progresso de hoje e Conquistas.
  3. Novo swipe para cima ou acionamento da alça abre o estágio **1.2 — Expandido**. O painel se posiciona abaixo do cabeçalho e acrescenta os cards Última sessão e Como funciona?.
  4. Durante o arraste, o painel acompanha o dedo. A alça permite arrastar em qualquer posição de rolagem; puxar o conteúdo para baixo movimenta o painel somente quando o gesto começa no topo da lista. Se o conteúdo estiver rolado, o gesto permanece na lista.
  5. Swipe para baixo reduz um estágio; um arraste longo pode recolher completamente. Movimentos curtos retornam à posição de origem. Toque na alça alterna os estágios, e `Escape` recolhe o painel na prévia por teclado.
  6. A navbar permanece fixa e visível nos estágios recolhido, intermediário e expandido, com as abas **Início**, **Tarefas**, **Rotinas**, **Cosmos** e **Perfil**. Neste fluxo, somente a sessão de foco ativa oculta a navbar; a seleção múltipla de tarefas segue o padrão F6.
  7. **Iniciar foco** apresenta cronômetro regressivo e a ação **Encerrar foco**. Ao encerrar, somente os minutos efetivamente decorridos são registrados no progresso diário; não se acrescenta uma duração fixa fictícia. O contador de sequência continua vinculado ao estado da ViewModel.
  8. O estudante pode consultar os detalhes das conquistas, seus critérios, o resumo da última sessão e a explicação de funcionamento pelos respectivos cards.
  9. Configurações oferece a opção local de redução de movimento. As transições automáticas respeitam essa opção e a preferência do sistema. O conteúdo do painel admite rolagem quando a altura disponível ou o texto ampliado exigem.

- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Recolhido** | Campo de estrelas vetorial, planeta centralizado, sequência no centro e convite Deslize para explorar; painel oculto e navbar visível | `cosmicTokens.color.background`, `cosmicTokens.planet`, `cosmicTokens.font.streak`, `cosmicTokens.font.streakLabel` |
| **Intermediário — 1.1** | Planeta deslocado para cima; painel com alça e cards de Modo Foco, Progresso de hoje e Conquistas; navbar visível | `cosmicTokens.color.sheet`, `cosmicTokens.color.card`, `cosmicTokens.radius.sheet`, `cosmicTokens.radius.card` |
| **Expandido — 1.2** | Painel abaixo do cabeçalho, com Última sessão e Como funciona? além dos cards anteriores; navbar visível | Os mesmos tokens do estágio intermediário e `cosmicTokens.font.title`, `cosmicTokens.font.body` |
| **Sessão em andamento** | Contador regressivo, ação Encerrar foco e indicação textual de foco; navbar oculta | `cosmicTokens.color.action`, `cosmicTokens.color.text`, `cosmicTokens.font.button` |
| **Carregando** | Esqueletos dos cards do painel e estado de carregamento anunciado | `cosmicTokens.color.card`, `cosmicTokens.color.track`, `cosmicTokens.radius.card` |
| **Vazio** | Progresso zerado, ação Iniciar foco disponível e apresentação acolhedora da jornada | `cosmicTokens.font.title`, `cosmicTokens.font.body`, `cosmicTokens.color.muted` |
| **Sucesso** | Contador textual de minutos, como 15 / 25 min, e preenchimento proporcional exato da barra; conquistas identificáveis por texto e ícone | `cosmicTokens.color.progress`, `cosmicTokens.color.progressEnd`, `cosmicTokens.color.track`, `cosmicTokens.color.unlocked` |

- **Faça:** Preserve o planeta e o contador central como elementos vetoriais e textuais independentes de uma imagem de fundo; mantenha a sequência escalável e perceptível além da cor.
- **Faça:** Mantenha a navbar visível nos três estágios do painel e ofereça abertura e recolhimento por gesto, toque e teclado, respeitando a redução de movimento.
- **Faça:** Diferencie arrastar o painel de rolar os cards e preserve os limites dos três pontos de ancoragem.
- **Faça:** Exponha nomes de controles, seleção das abas, valor textual do progresso e critérios das conquistas; oculte elementos decorativos do leitor de tela e siga [06-acessibilidade.md](06-acessibilidade.md).
- **Evite:** Exigir exclusivamente swipe, deixar o estudante sem saída, adicionar minutos fictícios ou introduzir mensagens e mecânicas punitivas.
- **Evite:** Tratar a documentação do padrão ou a existência de histórias como comprovação de implementação e validação concluídas.

### Tokens da variante

O contrato da variante é identificado por `cosmicTokens`. Os valores abaixo preservam as decisões do protótipo de referência, não aliases implícitos dos temas anteriores. Sua exportação em `src/view/theme/tokens.ts` deve ser conferida na branch de implementação; ela não está presente nesta branch documental.

| Grupo | Decisão |
| --- | --- |
| Fundo | `background #030417`; área externa de preview `desktop #07081F` |
| Painel | Gradiente `sheet #0D0D29` → `sheetEnd #08091D`; contorno `sheetBorder #373064` |
| Cards | Gradiente `card #141332` → `cardEnd #0D0E26`; contorno `cardBorder #232044` |
| Texto | `text #FAF9FF`; secundário `muted #BBB6E3`; navegação/chevrons `inactive #9990CB` |
| Ação | Gradiente `action #7137F5` → `actionEnd #703BF6`; texto claro; hover `#8252FC` e feedback pressionado |
| Acessibilidade | Foco `#D4A3FF`; texto escalável; nomes de controles e estados de seleção; modal nativo para detalhes |
| Progresso | Trilha `#232052`; gradiente `#8A42FA` → `#713BF5`; altura 17 dp; preenchimento proporcional exato |
| Conquistas | Aro ativo `#C47EFF`, ícones pendentes `#8C7BCB`, contorno pendente `#2B2654`; cadeado e descrição acessível |
| Tipografia | Marca 28/36; sequência 56/64; título 15/20; corpo 13/18; botão 16/24; legenda 12/16; navbar 11/16 |
| Forma | Botão 15 dp; card 18 dp; painel 32 dp; preview 38 dp; medalhas circulares de 56 dp |
| Movimento | Painel 380 ms; curva suave; atualização instantânea com movimento reduzido |
| Visualizador | `planet.aspectRatio 0.85`; esfera e anéis em SVG; estrelas determinísticas; sequência como texto real |
| Paleta do planeta | Realce `#EBACFF`, luz `#BD6AFF`, superfície `#8840E9`, relevo `#5320B2`, sombra `#39149A`, noite `#17075B`, borda `#D08BFF`, anel `#A95BFA`, realce do anel `#E8B5FF` e brilho `#8236D9` |
| Swipe | Ativação após 10 dp; movimento intencional de 48 dp ou velocidade de 0,55 dp/ms; projeção de 160 ms; limites nos três pontos de ancoragem |

No navegador, a tela é centralizada com largura máxima de 430 dp. No mobile, ocupa a largura disponível e respeita as áreas seguras. A barra de status ilustrativa “9:41” aparece apenas no preview web; Android/iOS usam a barra real do sistema.

### Arte e implementação de referência

No protótipo de referência, o visualizador usa `react-native-svg`, já presente no projeto. `PlanetIllustration` desenha esfera, iluminação, relevo e anéis em camadas vetoriais. `PlanetStreakView` centraliza o contador e recebe a sequência da ViewModel, sem manter uma cópia independente. `CosmicStarfield` produz o campo de estrelas de forma determinística. O deslocamento do planeta acompanha o painel; não há imagem de fundo, textura raster ou contexto WebGL. A ilustração PNG da iteração anterior foi preservada como arte de referência e não é mais importada pela tela. Este protótipo não implementa rotação axial ou evolução visual por ponto de sequência.

`HomeScreen` compõe a tela, `FocusBottomSheet` organiza os cards e `CosmicIcon` fornece os ícones. `useActivitySheetMotion` coordena arraste, limites, velocidade de soltura, rolagem e transições. O estado fica na ViewModel; dados e sessões usam o repositório em memória. Encerrar foco registra somente minutos efetivamente decorridos, sem adicionar os dez minutos fixos da versão anterior. Não há persistência entre recarregamentos. As outras abas permitem demonstrar a seleção, sem implementar seus módulos.

Os arquivos específicos da tela e do visualizador descritos acima não estão presentes nesta branch documental. Esta seção especifica o protótipo de referência; não comprova que a integração já está disponível neste checkout. A prévia web para revisão não altera a definição das plataformas de produto no [README](README.md).

### Revisão e evidências do protótipo

Na branch que disponibilizar a implementação de referência, execute `npm run storybook` e abra **Telas → Início cósmico → Referência · três estados lado a lado**. Há também histórias individuais para os estágios, foco ativo, estado vazio, carregamento e uma história com interação automatizada. `npm run web` abre o protótipo na rota inicial do Expo quando a tela estiver integrada.

O visualizador isolado fica em **Design System → Planeta e sequência**, com controle do número de dias e exemplos de 0, 12 e 365 dias.

As verificações de lint, tipos e builds são registradas na entrega. A existência de uma história de interação não comprova sua execução; validação real em navegador e em Android/iOS deve ser identificada separadamente.

Na primeira iteração, lint, tipos, builds do Expo/Storybook e três verificações da ViewModel passaram. Na revisão do visualizador, lint, tipos e ambos os builds passaram novamente, assim como as três verificações existentes da ViewModel. Cinco verificações isoladas adicionais cobriram resolução de swipe/flick, limites em viewport pequeno, acompanhamento do dedo e recolhimento, interação com rolagem e retorno após cancelamento. Os testes usam um adaptador de animação sem duração real; não substituem a validação por toque em aparelho. O SVG do planeta foi renderizado e inspecionado visualmente de forma isolada. Não houve captura da tela completa no navegador ou em aparelho nesta sessão.

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
- **Componentes:** Filtros segmentados (*Todos / Pendentes / Concluídas*) (`radius.md`, `space.sm`, `font.label`), Checkboxes circulares (`color.action`, `color.surface`, `radius.md`), Cards de tarefa (`radius.lg`, `elevation.card`, `space.md`, `font.body`), Barra contextual CAB (`color.surface`, `elevation.card`, `space.md`, `font.label`, `color.on-surface`).
- **Passos:**
  1. Toque no círculo marca/desmarca a tarefa imediatamente.
  2. Abas filtram a visualização da lista.
  3. *Long-press* entra no modo de seleção múltipla (2.3); navbar é substituída por:
     - Topo: "✕ · N selecionados" (`font.label`).
     - Barra inferior: **Fixar**, **Marcar todas**, **Excluir (n)** com ícone em `color.error` e rótulo legível em `color.on-surface` (`font.label`).
  4. "✕" cancela a seleção e restaura a navbar.
- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Carregando** | Cartões pulsantes em superfície neutra (*skeleton*) | `color.surface`, `radius.md`, `motion.duration.short` |
| **Vazio** | Ilustração amigável e texto ("Nenhuma tarefa pendente") | `font.title`, `font.body`, `space.lg` |
| **Sucesso** | Rótulo riscado e feedback sutil ao concluir o item | `color.action`, `font.body`, `motion.duration.short` |

- **Faça:** Exija confirmação antes de apagar itens em lote e garanta que ações destrutivas combinem ícone e texto com contraste acessível.
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

- **Faça:** Permita reverter a conclusão sem perda punitiva de sequência.
- **Evite:** Bloquear a reorganização de hábitos na rotina.

---

## 6. Conquistas (F3)

- **Objetivo:** Visualizar marcos alcançados, acompanhar critérios de desbloqueio de novas conquistas e compartilhar vitórias de estudo.
- **Componentes:** Campo de busca ("Buscar conquistas") (`radius.md`, `space.sm`, `font.body`, `color.focus`), Grade/Lista de cards de conquistas (`radius.lg`, `elevation.card`, `space.md`), Modal de detalhes da conquista (**1.4**) (`radius.lg`, `elevation.card`, `space.lg`, `font.title`, `font.body`), Botão "Compartilhar" (`button.bg`, `button.label`, `button.radius`), Botão "✕" (Fechar) (`color.on-surface`, `font.label`).
- **Passos:**
  1. Acessa a tela de Conquistas (**1.3**) a partir do painel expandido (**1.2**) ou da aba Perfil.
  2. Filtra ou busca conquistas pelo campo de busca.
  3. Toque em um card de conquista abre o modal de detalhes (**1.4**), exibindo título, descrição do critério, data de desbloqueio (ou progresso restante) e botão "Compartilhar".
  4. Botão "Compartilhar" dispara o compartilhamento nativo; botão "✕" fecha o modal e retorna à lista.
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

- **Objetivo:** Explorar o mapa visual de constelações, celebrando a evolução dos estudos por meio do desbloqueio progressivo de estrelas e curiosidades espaciais.
- **Componentes:** Mapa interativo da constelação (`color.surface`, `space.lg`, `motion.duration.medium`), Pontos de estrela bloqueadas/desbloqueadas (`color.action`, `color.on-surface`, `motion.duration.short`), Modal [Detalhe da Estrela] (`radius.lg`, `elevation.card`, `space.lg`, `font.title`, `font.body`), Botão "✕" (Fechar) (`color.on-surface`, `font.label`).
- **Passos:**
  1. Estudante navega para a aba **Cosmos** na navbar fixa.
  2. Visualiza a constelação com estrelas acesas (conquistadas) e estrelas em contorno neutro (a desbloquear conforme horas/hábitos cumpridos).
  3. Toque em uma estrela desbloqueada abre o modal [Detalhe da Estrela], apresentando seu nome, curiosidade astronômica associada e data de desbloqueio.
  4. Toque em uma estrela bloqueada indica o marco de estudo necessário para acendê-la.
  5. Botão "✕" ou toque fora fecha o modal e devolve a interação ao mapa.
- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Carregando** | Fundo espacial neutro com marcadores posicionais discretos | `color.surface`, `motion.duration.short` |
| **Vazio** | Constelação inicial com primeira estrela-guia e instruções sutis de exploração | `color.on-surface`, `font.body`, `space.md` |
| **Sucesso** | Estrelas acesas interligadas por traçados luminosos e modal de curiosidade detalhado | `color.action`, `radius.lg`, `elevation.card`, `font.title` |

- **Faça:** Garanta que cada estrela tenha identificador visual perceptível além da cor (forma/ícone e texto explicativo).
- **Evite:** Fazer o estudante perder estrelas já acesas ou regredir sua constelação por pausas na rotina.

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
- **F5 (Gestão Tarefa):** Checkbox simples (concluir/desmarcar); abas de filtro; menu "…".
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
5. **Ajustes de UI:** Corrigir busca da tela 1.3 ("Buscar conquistas") e prever modal de confirmação na exclusão em lote. No padrão F1/F2, o progresso é expresso como minutos concluídos/meta, por exemplo, "15 / 25 min".
