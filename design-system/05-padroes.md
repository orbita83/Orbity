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

- **Objetivo:** Alternar entre abas e iniciar sessões de foco via painel deslizante.
- **Componentes:** Navbar fixa de 5 abas (`color.surface`, `elevation.card`, `font.label`, `color.action`, `color.on-surface`), Bottom Sheet com alça (`color.surface`, `radius.lg`, `elevation.card`, `space.md`), Botão "Iniciar" (`button.bg`, `button.label`, `button.radius`), Barra de progresso (`color.surface`, `color.action`, `radius.md`).
- **Passos:**
  1. Navbar fixa: **Início**, **Tarefas**, **Rotinas**, **Cosmos**, **Perfil**.
  2. Na Tela Inicial, swipe para cima abre painel **1.1** (Modo Foco e Progresso).
  3. Segundo swipe expande para **1.2** (Progresso completo e atalho "Conquistas >").
  4. "Iniciar" dispara o foco. Navbar oculta-se com o painel aberto ou em seleção múltipla.
- **Estados:**

| Situação | O que vê | Tokens |
| :--- | :--- | :--- |
| **Carregando** | Esqueleto (*skeleton*) dos cards do painel em transição | `color.surface`, `radius.md`, `motion.duration.short` |
| **Vazio** | "Nenhuma sessão hoje" com botão Iniciar | `font.body`, `button.bg`, `button.label`, `button.radius` |
| **Sucesso** | Progresso atualizado ("1 \| 15") e barra de progresso preenchida | `color.action`, `radius.lg`, `font.title`, `space.sm` |

- **Faça:** Permita abrir o painel tanto por gesto (swipe) quanto por toque na alça.
- **Evite:** Deixar o usuário sem saída ao abrir o painel inferior.

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
- **Componentes:** Cabeçalho de identificação do estudante (`font.title`, `font.body`, `space.md`), Cards de métricas com sequência, horas e conquistas (`radius.lg`, `elevation.card`, `space.sm`, `font.title`, `color.action`), Atalhos navegáveis de Conquistas, Categorias e Ajustes (`radius.md`, `space.md`, `font.body`, `color.on-surface`).
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
- **Evite:** Destaques alarmantes em vermelho ou penalizações visuais caso a sequência de dias seja interrompida.

---

## Resumo dos Fluxos (Excalidraw)

- **F0 (Entrada):** Splash → Onboarding (4 passos) → 1. Tela Inicial.
- **F1 (Navegação):** 5 abas fixas (*Início*, *Tarefas*, *Rotinas*, *Cosmos*, *Perfil*); oculta em 1.1/1.2 e 2.3.
- **F2 (Foco/Progresso):** Planeta → Swipe Up (1.1 Foco/Progresso) → Swipe Up (1.2 Expandido).
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
2. **Modo Foco:** O protótipo tem botão "Iniciar" em 1.1, mas faltam telas de cronômetro e conclusão.
3. **Tarefas de Rotina vs. Gerais:** Definir se tarefas de rotinas aparecem ou não na aba geral de Tarefas.
4. **Conquistas na ERS:** Fluxo desenhado precisa ser formalizado como requisito funcional.
5. **Ajustes de UI:** Corrigir busca da tela 1.3 ("Buscar conquistas"), definir legenda de "1 \| 15" e prever modal de confirmação na exclusão em lote.
