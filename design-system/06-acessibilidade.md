# Acessibilidade

A acessibilidade no Orbity é projetada como um fundamento estrutural, e não como uma adaptação posterior. As diretrizes aqui definidas combinam as recomendações do **Material Design 3 (Assistive Technology & Foundations)** com os critérios de sucesso das **Diretrizes de Acessibilidade para Conteúdo Web (WCAG 2.1 e 2.2)** nos níveis A e AA, garantindo uma experiência inclusiva, equitativa e autônoma para todos os estudantes.

---

## Contraste dos pares de cor

As razões de contraste foram calculadas seguindo o padrão da WCAG:

$$\text{Razão} = \frac{L_1 + 0{,}05}{L_2 + 0{,}05}$$

Onde $L_1$ representa a luminância relativa da cor mais clara e $L_2$ a da mais escura, variando de 1:1 a 21:1.

- **Texto normal (< 24 px em peso normal ou < 18,67 px em negrito):** Mínimo de **4,5:1** (WCAG 1.4.3 Contraste Mínimo — Nível AA).
- **Texto grande (≥ 24 px em peso normal ou ≥ 18,67 px em negrito, como `font.title`):** Mínimo de **3,0:1** (WCAG 1.4.3).
- **Elementos de interface gráficos e foco (`color.focus`):** Mínimo de **3,0:1** em relação ao fundo adjacente (WCAG 1.4.11 Contraste de Não-Texto — Nível AA).

> **Equivalência tipográfica (WCAG vs. Orbity):** A especificação original da WCAG adota pontos tipográficos (18 pt para texto normal e 14 pt para negrito). Em telas digitais e ecossistemas web/mobile com escala em pixels CSS ($1\text{ pt} = \frac{4}{3}\text{ px} \approx 1{,}333\text{ px}$), os limiares correspondem a **24 px** para peso normal e **18,67 px** para negrito (peso $\ge 700$). Portanto, o token `font.title` (24 px, peso 700) qualifica-se como texto grande por ambos os parâmetros. Já os tokens `font.label` (14 px, peso 500) e `font.body` (16 px, peso 400) enquadram-se estritamente como texto normal, exigindo razão de contraste mínima de 4,5:1.

### Tabela de validação de pares semânticos

| Par (primeiro plano sobre fundo) | Modo | Cores utilizadas | Razão | Mínimo | Resultado | Origem |
| --- | --- | --- | --- | --- | --- | --- |
| `color.on-action` sobre `color.action` | Claro | `neutral-0` (`#FFFFFF`) sobre `blue-600` (`#4F46E5`) | **6,29:1** | 4,5:1 | **Aprovado** | Adaptado |
| `color.on-action` sobre `color.action` | Escuro | `neutral-900` (`#1B1B1F`) sobre `purple-400` (`#C084FC`) | **6,50:1** | 4,5:1 | **Aprovado** | Adaptado |
| `color.on-surface` sobre `color.surface` | Claro | `neutral-900` (`#1B1B1F`) sobre `neutral-0` (`#FFFFFF`) | **17,17:1** | 4,5:1 | **Aprovado** | Adaptado |
| `color.on-surface` sobre `color.surface` | Escuro | `neutral-0` (`#FFFFFF`) sobre `neutral-900` (`#1B1B1F`) | **17,17:1** | 4,5:1 | **Aprovado** | Adaptado |
| `color.on-surface-variant` sobre `color.surface` | Claro | `neutral-500` (`#6B7280`) sobre `neutral-0` (`#FFFFFF`) | **4,79:1** | 4,5:1 | **Aprovado** | Adaptado |
| `color.on-surface-variant` sobre `color.surface` | Escuro | `neutral-200` (`#E5E7EB`) sobre `neutral-900` (`#1B1B1F`) | **13,46:1** | 4,5:1 | **Aprovado** | Adaptado |
| `color.error` sobre `color.surface` | Claro | `error-500` (`#EF4444`) sobre `neutral-0` (`#FFFFFF`) | **3,76:1** | 4,5:1 | **Reprovado para texto comum** *(aprovado para texto grande ≥ 24 px ou ≥ 18,67 px em negrito e ícones/elementos ≥ 3,0:1)* | Adaptado |
| `color.error` sobre `color.surface` | Escuro | `error-500` (`#EF4444`) sobre `neutral-900` (`#1B1B1F`) | **4,56:1** | 4,5:1 | **Aprovado** | Adaptado |
| `color.focus` sobre `color.surface` | Claro | `blue-600` (`#4F46E5`) sobre `neutral-0` (`#FFFFFF`) | **6,29:1** | 3,0:1 | **Aprovado** | Adaptado |
| `color.focus` sobre `color.surface` | Escuro | `purple-400` (`#C084FC`) sobre `neutral-900` (`#1B1B1F`) | **6,50:1** | 3,0:1 | **Aprovado** | Adaptado |

### Regras de uso de cor e estados de erro

- **Independência de cor (WCAG 1.4.1):** Nunca utilize a cor como o único meio para comunicar status, conclusão de tarefa, rotina pendente ou erro de validação. Sempre associe um ícone semântico (ex.: `error` ou `check_circle`) e uma mensagem textual explicativa. (Herdado)
- **Adequação do `color.error` no tema claro:** Como o par `error-500` sobre `neutral-0` atinge 3,76:1 (insuficiente para texto comum de 14–16 px), mensagens de erro de formulário no tema claro devem utilizar o texto padrão em `color.on-surface` acompanhado de um ícone indicador em `color.error`, ou utilizar peso e tamanho que assegurem legibilidade. (Adaptado)

---

## Alvos de toque

Para garantir usabilidade por pessoas com deficiências motoras, tremores ou em situações de mobilidade reduzida:

- **Dimensão mínima do alvo (Material 3 e WCAG 2.5.5 / 2.5.8):** Todo elemento tocável deve possuir área interativa mínima de **48 × 48 dp** (Android/Material) ou **44 × 44 pt** (iOS). (Herdado)
- **Expansão de toque em elementos visuais menores:** Quando o elemento visual for menor que 48 dp (como ícones de ação de 24 dp, checkboxes de 20 dp ou chips compactos), a área interativa deve ser expandida internamente através de padding ou da propriedade `hitSlop` do componente. (Adaptado)
- **Espaçamento entre alvos adjacentes:** Mantenha um espaçamento mínimo de **8 dp** (`space.sm`) entre as bordas de áreas clicáveis vizinhas, evitando acionamentos acidentais. (Herdado)

### Especificação por tipo de componente

| Componente | Tamanho visual padrão | Área de toque mínima | Implementação / Estratégia |
| --- | --- | --- | --- |
| Botão de Ação (`button.bg`) | Altura 48 dp (Herdado - Material 3), largura variável | 48 × 48 dp (ou largura total) | `minHeight: 48`, alinhamento vertical centralizado com padding vertical via `space.sm` (8 px) ou `space.md` (16 px) e padding horizontal `space.md`. |
| Botão de Ícone (fechar, voltar, menu) | Ícone de 24 dp (`space-24`) | 48 × 48 dp (Herdado - Material 3) | Container delimitado de 48 × 48 dp centralizando o ícone de tamanho `space-24`. |
| Campo de texto (Input) | Altura 56 dp (Herdado - Material 3) | 56 dp de altura | Altura padrão de 56 dp do container de Input herdada do Material 3, superando a meta mínima de 48 dp. |
| Checkbox / Conclusão de Tarefa | Caixa de 24 × 24 dp (`space-24`) | 48 × 48 dp (Herdado - Material 3) | Caixa delimitada ou expansão via `hitSlop: { top: 12, bottom: 12, left: 12, right: 12 }` (compensação calculada: $(48 - 24) / 2 = 12\text{ dp}$). |
| Itens de Lista / Cards de Rotina | Variável (conteúdo dinâmico com padding `space.md`) | Altura mínima de 48 dp | Container de card clicável com `minHeight: 48` e área de toque contínua em toda a superfície. |

### Registro de tokens e lacunas de componente (Seção 9 do README)

Conforme estabelecido na Seção 9 do guia do Design System (*"Se faltar um token, componente ou regra, pergunte ou registre a lacuna. Não invente valores"*), as dimensões derivadas das diretrizes de plataforma devem indicar se já foram formalizadas em `02-tokens.md`:

| Dimensão / Regra | Medida literal | Origem | Situação |
| --- | --- | --- | --- |
| **Alvo interativo mínimo** | `48 × 48 dp` | Herdado (Material 3 / WCAG 2.5.5) | Formalizado como `target.min-size`; botões apontam para ele por `button.min-height` e `button.min-width`. |
| **Altura padrão de Input** | `56 dp` | Herdado (Material 3 Text Field) | Lacuna: proposta de token `input.height`. |
| **Altura mínima de Botão** | `48 dp` | Herdado (Material 3 Button) | Formalizado como `button.min-height`. |
| **Compensação geométrica (hitSlop)** | `12 dp` | Calculado: $(48 - 24) / 2$ | Lacuna: cálculo utilitário sem token; proposta `hit-slop.compact`. |

A geometria do foco também foi formalizada em `02-tokens.md`: `focus.ring-width` e `focus.ring-offset` definem os 2 dp estabelecidos nesta diretriz, enquanto os tokens de componente `button.focus-width` e `button.focus-offset` apontam para esses valores.

---

## Foco

A indicação e a ordem de foco asseguram a navegabilidade completa por teclado físico, switches de acessibilidade, D-Pads ou leitores de tela acoplados.

### Aparência do foco visível (WCAG 2.4.7 e 2.4.11)

- **Token de foco:** Utilizar `color.focus` (`blue-600` no modo claro; `purple-400` no modo escuro). (Adaptado)
- **Geometria do anel de foco:**
  - Espessura de **2 dp** em linha sólida.
  - Afastamento (*outline offset*) de **2 dp** em relação à borda do componente, prevenindo sobreposição com o fundo ou a borda nativa do componente.
  - A curvatura do anel acompanha o raio do elemento correspondente (`radius.md` para botões e campos, `radius.lg` para cards).
- **Sem ocultação de foco:** É proibido suprimir o indicador visual de foco (`outline: none` na web ou remoção de realce nativo) sem fornecer uma alternativa com contraste superior a 3:1. (Herdado)

### Ordem e gestão do foco (WCAG 2.4.3 e 2.1.2)

- **Fluxo sequencial:** A navegação deve seguir uma sequência lógica e previsível: de cima para baixo e da esquerda para a direita (LTR), correspondendo à hierarquia visual da tela de estudos. (Herdado)
- **Confinamento de foco (*focus trap*):** Ao abrir diálogos, modais ou painéis inferiores (bottom sheets) para criação de tarefas ou edição de rotinas, o foco deve ser transferido imediatamente para o primeiro elemento interativo do diálogo e confinado dentro dele até o fechamento. (Adaptado)
- **Restauração de foco:** Ao fechar um modal ou confirmação, o foco deve retornar exatamente ao elemento que disparou a abertura, evitando desorientação do estudante. (Herdado)
- **Sem armadilhas de teclado (WCAG 2.1.2):** Nenhum controle pode reter o foco indefinidamente; teclas padrão (como `Tab`, `Shift+Tab` ou `Esc`) devem sempre permitir avançar, retroceder ou fechar o elemento ativo. (Herdado)

---

## Leitor de tela

O Orbity oferece suporte completo aos leitores de tela padrão das plataformas suportadas (TalkBack no Android, VoiceOver no iOS e leitores no ambiente Web), alinhando-se ao critério WCAG 4.1.2 (Nome, Papel, Valor).

### Papéis e atributos semânticos (`accessibilityRole`)

Todo elemento deve declarar seu papel semântico correto por meio de `accessibilityRole` no React Native:

- **Botões e ações:** `accessibilityRole="button"`.
- **Cabeçalhos e seções:** `accessibilityRole="header"` para títulos de tela e subtópicos (`font.title`), permitindo navegação rápida por seções.
- **Campos de formulário:** `accessibilityRole="none"` associado a `TextInput` nativo para entrada de dados.
- **Seleções e alternadores:** `accessibilityRole="checkbox"`, `accessibilityRole="radio"` ou `accessibilityRole="switch"`.
- **Links de navegação externa:** `accessibilityRole="link"`.

### Diretrizes de rótulo e conteúdo (`accessibilityLabel`)

- **Botões apenas com ícone:** Devem possuir obrigatoriamente um `accessibilityLabel` claro e descritivo que expresse a ação e seu contexto. Exemplo: um botão com ícone de engrenagem deve anunciar *"Configurações de estudo"*, nunca *"ícone engrenagem"* ou *"botão"*. (Herdado)
- **Campos de texto:** O rótulo visível deve ser associado ao campo. Em campos com máscaras ou formatos específicos (como horários de estudo), utilize `accessibilityLabel` incluindo a instrução de formato (ex.: *"Horário de início da rotina, formato horas e minutos"*). (Adaptado)
- **Elementos puramente decorativos (WCAG 1.1.1):** Ilustrações de fundo, constelações decorativas ou ícones que acompanhem texto idêntico devem ser ocultados do leitor de tela utilizando `accessible={false}` ou `importantForAccessibility="no-hide-descendants"`. (Herdado)

### Estados dinâmicos (`accessibilityState`)

Os componentes devem comunicar dinamicamente suas alterações de estado via `accessibilityState`:

- **Conclusão:** `{ checked: true | false }` em itens de verificação de tarefas e metas de rotina.
- **Desabilitação:** `{ disabled: true }` quando uma ação não estiver disponível (ex.: botão de salvar com campos pendentes). O leitor deve anunciar o estado desabilitado.
- **Seleção:** `{ selected: true | false }` em abas de navegação, filtros de disciplina ou dias da semana.
- **Carregamento:** `{ busy: true }` quando o componente estiver executando uma sincronização ou salvamento assíncrono.

### Dicas de interação e anúncios em tempo real

- **Dicas de ação (`accessibilityHint`):** Usadas somente quando a consequência do acionamento não for evidente pelo rótulo. Exemplo: `accessibilityHint="Conclui a tarefa e registra seu progresso na constelação"`. (Adaptado)
- **Regiões ativas (*Live Regions*):** Mensagens de feedback imediato, erros de preenchimento ou celebração de conclusão de tarefas devem utilizar `accessibilityLiveRegion="polite"` (para leitura assim que o usuário concluir a leitura atual) ou `"assertive"` em erros impeditivos, sem roubar abruptamente o foco visual. (Herdado)

---

## Texto ampliado e movimento

A interface do Orbity é flexível e se adapta às necessidades sensoriais e cognitivas individuais do usuário.

### Texto ampliado (WCAG 1.4.4 e Material 3)

- **Respeito à preferência do sistema:** O aplicativo respeita a escala de tamanho de fonte configurada pelo usuário nas opções de acessibilidade do sistema operacional (Dynamic Type / Escala de Fonte do Android), suportando ampliações de até **200%** sem perda de conteúdo ou funcionalidade. (Herdado)
- **Configuração no código:** Manter `allowFontScaling={true}` (padrão no React Native) habilitado em todos os textos da aplicação. (Herdado)
- **Containers flexíveis:**
  - Não utilizar alturas fixas (`height`) rígidas em elementos que contenham texto (`font.title`, `font.body`, `font.label`).
  - Utilizar `minHeight`, permitindo que o container cresça verticalmente para acomodar quebras de linha adicionais.
  - Prover rolagem vertical (`ScrollView`) em todas as telas com formulários ou listas para evitar que o conteúdo excedente seja cortado.
- **Controle de truncamento:** Textos com `numberOfLines` e reticências devem ser restritos a prévias resumidas que permitam expansão através de toque ou navegação para detalhe, nunca sendo aplicados a instruções críticas, botões ou mensagens de erro. (Adaptado)

### Redução de movimento (WCAG 2.3.3 e Material 3)

- **Detecção de preferência:** A aplicação deve consultar o estado de preferência do sistema (por meio de `AccessibilityInfo.isReduceMotionEnabled()` no React Native ou media query `@media (prefers-reduced-motion: reduce)` na Web). (Herdado)
- **Comportamento com movimento reduzido ativo:**
  - Desativar animações complexas, como transições de constelações, efeitos de partículas, translações laterais longas e zooms.
  - Substituir transições de tela por transições instantâneas ou por um desvanecimento suave de opacidade (*crossfade*) com duração ultra curta (`motion.duration.short` de 100 ms ou 0 ms).
  - Manter feedback de interação instantâneo para preservar a percepção de resposta tátil da interface sem deslocamento espacial. (Adaptado)
- **Prevenção de convulsões e reações vestibulares (WCAG 2.3.1):** É expressamente proibido qualquer componente com efeitos visuais que pisquem ou oscilem mais de 3 vezes por segundo (limiar de convulsões fotossensíveis). (Herdado)
