# Tokens

> A identidade cósmica é um tema global para todas as telas e componentes. `themes.cosmic` implementa os papéis semânticos indicados abaixo. `themes.light` e `themes.dark` preservam os contratos anteriores para migração explícita.

<!-- Camada 2 da aula: decisões com nome. Três níveis: primitivo → semântico → componente.
     Formato do nome: categoria.papel.variação (ex.: color.action, space.md, radius.lg, font.title).
     Escreva sempre valor + unidade (px, dp ou pt). Em toda tabela, a coluna "Origem" usa: Herdado | Adaptado | Novo. -->

## 1. Primitivos (o valor bruto)

### Cor

| Token         | Valor     | Amostra                                         | Origem   |
| ---           | ---       | ---                                             | ---      |
| `blue-600`    | `#4F46E5` | ![blue-600](./images/colors/blue-600.svg)       | Adaptado |
| `purple-500`  | `#8B5CF6` | ![purple-500](./images/colors/purple-500.svg)   | Adaptado |
| `purple-600`  | `#9333EA` | ![purple-600](./images/colors/purple-600.svg)   | Adaptado |
| `purple-400`  | `#C084FC` | ![purple-400](./images/colors/purple-400.svg)   | Adaptado |
| `purple-200`  | `#E9D5FF` | ![purple-200](./images/colors/purple-200.svg)   | Adaptado |
| `neutral-0`   | `#FFFFFF` | ![neutral-0](./images/colors/neutral-0.svg)     | Adaptado |
| `neutral-100` | `#F3F4F6` | ![neutral-100](./images/colors/neutral-100.svg) | Adaptado |
| `neutral-200` | `#E5E7EB` | ![neutral-200](./images/colors/neutral-200.svg) | Adaptado |
| `neutral-500` | `#6B7280` | ![neutral-500](./images/colors/neutral-500.svg) | Adaptado |
| `neutral-600` | `#5F6673` | ![neutral-600](./images/colors/neutral-600.svg) | Novo (1.2) |
| `neutral-900` | `#1B1B1F` | ![neutral-900](./images/colors/neutral-900.svg) | Adaptado |
| `success-500` | `#22C55E` | ![success-500](./images/colors/success-500.svg) | Novo     |
| `warning-500` | `#F59E0B` | ![warning-500](./images/colors/warning-500.svg) | Novo     |
| `error-500`   | `#EF4444` | ![error-500](./images/colors/error-500.svg)     | Adaptado |
| `info-500`    | `#3B82F6` | ![info-500](./images/colors/info-500.svg)       | Novo     |

### Espaço (grade de 8 pontos: múltiplos de 8, ou de 4 para ajustes finos)

| Token     | Valor | Origem  |
| ---       | ---   | ---     |
| `space-4` | 4 px  | Herdado |
| `space-8` | 8 px  | Herdado |
| `space-16`| 16 px | Herdado |
| `space-24`| 24 px | Herdado |
| `space-32`| 32 px | Herdado |

## 2. Semânticos (o significado)

### Cor

| Token             | Claro        | Escuro       | Uso                               | Origem   |
| ---               | ---          | ---          | ---                               | ---      |
| `color.action`            | `blue-600`    | `purple-400`  | Ações principais, botões primários e estados ativos        | Adaptado |
| `color.action-subtle`     | `purple-200`  | `purple-600`  | Fundo de pílulas ativas, indicadores e tags suaves         | Adaptado |
| `color.on-action` | `neutral-0`  | `neutral-900`| Texto e ícone sobre `color.action`| Adaptado |
| `color.surface`           | `neutral-0`   | `neutral-900` | Fundo principal das telas e superfícies base               | Adaptado |
| `color.surface-variant`   | `neutral-100` | `neutral-900` | Fundo secundário, containers de cards e campos             | Adaptado |
| `color.on-surface`        | `neutral-900` | `neutral-0`   | Texto principal, títulos e ícones sobre superfícies        | Adaptado |
| `color.on-surface-variant`| `neutral-600` | `neutral-200` | Textos secundários, prazos, legendas e rótulos auxiliares (claro corrigido na 1.2) | Adaptado |
| `color.border`            | `neutral-200` | `neutral-500` | Bordas divisórias, separadores e contornos sutis           | Adaptado |
| `color.border-subtle`     | `rgba(27, 27, 31, 0.08)` | `rgba(255, 255, 255, 0.08)` | Fio de separação de barras, cabeçalhos fixos e painel (cósmico: `rgba(250, 249, 255, 0.06)`) | Novo (1.2) |
| `color.scrim`             | `rgba(3, 4, 23, 0.72)` | `rgba(3, 4, 23, 0.72)` | Véu atrás de modais e do painel aberto | Novo (1.2) |
| `color.focus`             | `blue-600`    | `purple-400`  | Anel indicador de foco de acessibilidade                   | Adaptado |
| `color.error`             | `error-500`   | `error-500`   | Alertas de erro, campos inválidos e ações destrutivas      | Adaptado |
| `color.success`           | `success-500` | `success-500` | Confirmação de metas, conclusão de rotinas e conquistas    | Novo     |
| `color.warning`           | `warning-500` | `warning-500` | Avisos de pendência, prazo próximo e atenção               | Novo     |
| `color.info`              | `info-500`    | `info-500`    | Dicas de estudo, notas contextuais e informativos          | Novo     |

### Tipografia

| Token        | Família | Tamanho | Peso | Altura de linha | Uso                     | Origem   |
| ---          | ---     | ---     | ---  | ---             | ---                     | ---      |
| `font.title` | Roboto  | 24 px   | 700  | 32 px           | Títulos de tela         | Adaptado |
| `font.body`  | Roboto  | 16 px   | 400  | 24 px           | Texto corrido           | Adaptado |
| `font.label` | Roboto  | 14 px   | 500  | 20 px           | Rótulos de botão e campo| Adaptado |
| `font.streak`| Roboto  | 64 px   | 700  | 64 px           | Número da sequência     | Novo (1.2) |

### Espaço, forma e elevação

| Token            | Valor     | Uso                                 | Origem   |
| ---              | ---       | ---                                 | ---      |
| `space.sm`       | `space-8` | Espaço entre elementos relacionados | Herdado  |
| `space.md`       | `space-16`| Margem interna padrão               | Herdado  |
| `space.lg`       | `space-24`| Separação entre grupos              | Herdado  |
| `radius.md`      | 12 px     | Campos e botões                     | Adaptado |
| `radius.lg`      | 16 px     | Cards, indicador da navbar e caixa de conquista | Adaptado |
| `radius.sheet`   | 24 px     | Cantos superiores do painel deslizante | Novo (1.2) |
| `radius.xl`      | 28 px     | Medalha de 120 px no detalhe da conquista | Novo (1.2) |
| `elevation.card` | 2 dp      | Cards sobre a superfície            | Adaptado |
| `target.min-size`| 48 dp     | Área mínima de controles interativos| Herdado  |
| `focus.ring-width` | 2 dp    | Espessura do indicador de foco      | Herdado  |
| `focus.ring-offset`| 2 dp    | Distância entre foco e componente   | Herdado  |
| `size.progress-height` | 20 dp | Altura da barra de progresso        | Novo (1.2) |
| `size.handle-width` / `size.handle-height` | 40 × 5 dp | Alça do painel deslizante | Novo (1.2) |
| `size.achievement-badge` | 60 dp | Caixa da conquista no painel      | Novo (1.2) |

### Sombras (1.2)

**Regra 1.2 — destaque sem brilho.** No Orbity, o destaque vem da superfície, da borda e da cor sólida, nunca de halos coloridos. Brilhos em volta de botões, conquistas, chips e checkbox foram testados no protótipo e descartados porque competiam com o conteúdo. As sombras abaixo são escuras (cor do fundo cósmico) e servem apenas para separar camadas. O único brilho colorido permitido é `glow-planet`, que pertence à ilustração do planeta.

| Token | Valor | Uso | Origem |
| --- | --- | --- | --- |
| `shadow.bar` | `0 -8px 24px rgba(3, 4, 23, 0.6)` | NavBar, barra de ações contextuais e barra do botão Criar | Novo (1.2) |
| `shadow.bar-top` | `0 8px 24px rgba(3, 4, 23, 0.6)` | Cabeçalho fixo | Novo (1.2) |
| `shadow.sheet` | `0 -12px 32px rgba(3, 4, 23, 0.7)` | Painel deslizante | Novo (1.2) |
| `shadow.button` | `0 4px 12px rgba(3, 4, 23, 0.5)` | Botão principal (substitui o halo roxo) | Novo (1.2) |
| `shadow.modal` | `0 24px 64px rgba(3, 4, 23, 0.8)` | Modais | Novo (1.2) |
| `shadow.glow-planet` | `0 0 72px rgba(130, 54, 217, 0.55)` | Somente a ilustração do planeta | Novo (1.2) |

No código, os valores ficam em `shadowTokens` como strings `boxShadow`; `elevation.card` continua como alternativa no Android.

### Movimento

| Token                    | Valor                        | Uso                     | Origem   |
| ---                      | ---                          | ---                     | ---      |
| `motion.duration.short`  | 100 ms                       | Feedback de toque       | Adaptado |
| `motion.duration.medium` | 300 ms                       | Transições entre telas  | Adaptado |
| `motion.easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Curva padrão            | Adaptado |
| `motion.scale-pressed`   | `0.96`                       | Escala de botões, ícones, abas e links ao toque | Novo (1.2) |
| `motion.opacity-pressed` | `0.8`                        | Opacidade aplicada junto da escala ao toque     | Novo (1.2) |
| `motion.planet.rotation` | 24 s, linear, contínua       | Volta das crateras do planeta | Novo (1.2) |
| `motion.planet.pulse`    | 4 s, `ease-in-out`, alternada | Pulso do brilho do planeta   | Novo (1.2) |

O estado pressionado combina `scale-pressed` e `opacity-pressed` em `motion.duration.short` com `motion.easing.standard`. Isso resolve a lacuna de cor do estado pressionado sem inventar uma cor nova. Com movimento reduzido, a escala, a rotação e o pulso são desligados; a opacidade continua como feedback.

### Variante cósmica

Esta paleta é a direção global escura do Orbity, aplicável a qualquer tela. Os nomes `cosmicTokens` abaixo são referências documentais; `cosmicColors` exporta os valores implementados, e telas e componentes consomem os papéis semânticos de `themes.cosmic`. As tabelas base anteriores continuam representando os contratos legados 1.0.

| Papel global | Tema cósmico | Uso |
| --- | --- | --- |
| `color.surface` | `#030417` | Fundo de qualquer tela |
| `color.surface-variant` | `#141332` | Superfície sólida de cards |
| `color.on-surface` | `#FAF9FF` | Conteúdo principal |
| `color.on-surface-variant` | `#BBB6E3` | Conteúdo secundário |
| `color.action` / `color.on-action` | `#7137F5` / `#FAF9FF` | Ação sólida e seu conteúdo |
| `color.action-subtle` | `#232052` | Fundo do indicador ativo |
| `color.focus` / `color.border` | `#D4A3FF` | Foco e contorno de controle |

`button.bg` usa uma cor sólida; o gradiente `#7137F5` → `#703BF6` foi validado no protótipo 1.2 e está exportado em `cosmicGradients.action`, mas o `PrimaryButton` só passa a desenhá-lo quando houver um componente de gradiente no app. A navbar usa fundo `#0D0D29`, indicador `#232052` ocupando a aba inteira, texto ativo `#FAF9FF`, inativo `#9990CB` e fio superior `color.border-subtle` (1.2; antes `#D4A3FF`). Cards de tarefa usam `color.surface-variant`, com gradiente `cosmicGradients.card` e contorno `cosmicBorders.card` como alvo da 1.2.

**Migração 1.1:** selecione e propague `themes.cosmic` para cada tela e componente que adote a identidade escura global. `themes.dark` mantém o escuro 1.0 (`#1B1B1F`); `themes.light` permanece igual. Não há troca automática da preferência do estudante. Novos consumidores devem usar papéis semânticos em vez de cores literais; o modo claro cósmico ainda não foi definido.

| Papel | Valor | Uso | Origem |
| --- | --- | --- | --- |
| `cosmicTokens.color.background` | `#030417` | Fundo global de telas | Adaptado |
| `cosmicTokens.color.desktop` | `#07081F` | Área externa da prévia | Adaptado |
| `cosmicTokens.color.sheet`, `sheetEnd` | `#0D0D29` → `#08091D` | Gradiente do painel | Adaptado |
| `cosmicTokens.color.sheetBorder` | `#373064` | Contorno do painel | Adaptado |
| `cosmicTokens.color.card`, `cardEnd` | `#141332` → `#0D0E26` | Gradiente dos cards | Adaptado |
| `cosmicTokens.color.cardBorder` | `#232044` | Contorno dos cards | Adaptado |
| `cosmicTokens.color.text` | `#FAF9FF` | Texto principal e texto claro da ação | Adaptado |
| `cosmicTokens.color.muted` | `#BBB6E3` | Texto secundário | Adaptado |
| `cosmicTokens.color.inactive` | `#9990CB` | Navegação inativa e chevrons | Adaptado |
| `cosmicTokens.color.action`, `actionEnd` | `#7137F5` → `#703BF6` | Gradiente da ação principal | Adaptado |
| `cosmicTokens.color.actionHover` | `#8648FA` | Realce da ação no hover | Adaptado |
| `cosmicTokens.color.focus` | `#D4A3FF` | Indicador de foco | Adaptado |
| `cosmicTokens.color.track` | `#232052` | Trilha do progresso | Adaptado |
| `cosmicTokens.color.progress`, `progressEnd` | `#8A42FA` → `#8648FA` | Preenchimento do progresso | Adaptado |
| `cosmicTokens.color.unlocked` | `#C47EFF` | Aro de conquista ativa (`cosmicColors.unlocked` na 1.2) | Adaptado |
| `cosmicTokens.color.achievementPendingIcon` | `#8C7BCB` | Ícone de conquista pendente | Adaptado |
| `cosmicTokens.color.achievementPendingBorder` | `#2B2654` | Contorno de conquista pendente | Adaptado |
| `cosmicTokens.planet.highlight` | `#EBACFF` | Realce do planeta | Adaptado |
| `cosmicTokens.planet.light` | `#BD6AFF` | Luz do planeta | Adaptado |
| `cosmicTokens.planet.surface` | `#8840E9` | Superfície do planeta | Adaptado |
| `cosmicTokens.planet.relief` | `#5320B2` | Relevo do planeta | Adaptado |
| `cosmicTokens.planet.shadow` | `#39149A` | Sombra do planeta | Adaptado |
| `cosmicTokens.planet.night` | `#17075B` | Face noturna do planeta | Adaptado |
| `cosmicTokens.planet.border` | `#D08BFF` | Borda do planeta | Adaptado |
| `cosmicTokens.planet.ring` | `#A95BFA` | Anel orbital | Adaptado |
| `cosmicTokens.planet.ringHighlight` | `#E8B5FF` | Realce do anel | Adaptado |
| `cosmicTokens.planet.glow` | `#8236D9` | Brilho decorativo | Adaptado |

Nas linhas com dois nomes, ambos pertencem ao mesmo grupo `cosmicTokens.color`. Os nomes para hover, conquistas pendentes e camadas do planeta formalizam papéis descritos no protótipo, sem afirmar sua implementação.

**Lacunas:** o estado pressionado da ação cósmica foi resolvido na 1.2 por escala e opacidade (ver Movimento). O estado desabilitado ainda precisa de validação visual e de contraste. Os gradientes de ação, painel, card e progresso estão exportados em `cosmicGradients`, mas ainda não são desenhados pelos componentes. O teste `tests/ods-theme.test.cjs` amostra os gradientes de ação e de progresso; os de painel e card não carregam texto direto.

## 3. Tokens de componente (onde é usado)

| Token | Referência | Origem |
| --- | --- | --- |
| `button.bg`               | `color.action`                               | Adaptado |
| `button.label`            | `color.on-action`                            | Adaptado |
| `button.radius`           | `radius.md`                                  | Adaptado |
| `button.min-height`       | `target.min-size`                            | Herdado  |
| `button.min-width`        | `target.min-size`                            | Herdado  |
| `button.focus-color`      | `color.focus`                                | Adaptado |
| `button.focus-width`      | `focus.ring-width`                           | Herdado  |
| `button.focus-offset`     | `focus.ring-offset`                          | Herdado  |
| `button.bg-hover`         | `color.action` + estado hover                | Adaptado |
| `button.bg-pressed`       | `color.action` + `motion.scale-pressed` + `motion.opacity-pressed` (1.2) | Adaptado |
| `button.shadow`           | `shadow.button` (1.2)                        | Novo     |
| `button.bg-disabled`      | `color.surface` + estado disabled            | Adaptado |
| `button.label-disabled`   | `color.on-surface`                           | Adaptado |
| `button.opacity-disabled` | `0.6`                                        | Novo     |
| `navbar.bg`               | `color.surface`                              | Adaptado |
| `navbar.item-active`      | `color.action`                               | Adaptado |
| `navbar.item-inactive`    | `color.on-surface`                           | Adaptado |
| `navbar.indicator-bg`     | `color.action-subtle`                        | Adaptado |
| `navbar.indicator-radius` | `radius.lg`, ocupando a aba inteira (1.2)    | Novo     |
| `navbar.border`           | `color.border-subtle` (1.2; cósmico antes `color.focus`) | Novo |
| `navbar.shadow`           | `shadow.bar` (1.2)                           | Novo     |
| `navbar.min-height`       | `target.min-size`                            | Herdado  |
| `navbar.elevation`        | `elevation.card`                             | Adaptado |
| `navbar.focus-color`      | `color.focus`                                | Adaptado |
| `navbar.focus-width`      | `focus.ring-width`                           | Herdado  |
| `navbar.focus-offset`     | `focus.ring-offset`                          | Herdado  |
| `sheet.radius`            | `radius.sheet` (1.2)                         | Novo     |
| `sheet.handle`            | cósmico `cosmicColors.inactive`; legados `color.on-surface-variant` (1.2) | Novo |
| `sheet.scrim`             | `color.scrim` (1.2)                          | Novo     |
| `sheet.shadow`            | `shadow.sheet` (1.2)                         | Novo     |
| `progress.height`         | `size.progress-height` (1.2)                 | Novo     |
| `progress.track`          | `color.action-subtle` (1.2)                  | Novo     |
| `progress.fill`           | cósmico `cosmicColors.progress`; legados `color.action` (1.2) | Novo |
| `achievement.size`        | `size.achievement-badge` (1.2)               | Novo     |
| `achievement.unlocked-bg` | `color.action-subtle` (1.2)                  | Novo     |
| `achievement.unlocked-border` | cósmico `cosmicColors.unlocked`; legados `color.action` (1.2) | Novo |
| `achievement.locked-border` | `color.border-subtle` (1.2)                | Novo     |

## 4. Modo escuro

O Orbity possui suporte integral aos modos claro e escuro, mantendo os mesmos nomes de tokens semânticos nos dois temas. A alternância de tema altera previsivelmente os valores primitivos vinculados aos papéis semânticos, preservando a hierarquia da informação, a identidade da marca e o contraste acessível em todas as telas.

### Matriz semântica de cores por modo

Esta matriz registra os temas legados `themes.light` e `themes.dark` de 1.0. Para a identidade global escura de 1.1, consulte a tabela de `themes.cosmic` na seção Variante cósmica acima.

| Papel semântico | Modo Claro | Modo Escuro | Razão de contraste mínima e justificativa |
| :--- | :--- | :--- | :--- |
| `color.action` | `blue-600` (`#4F46E5`) | `purple-400` (`#C084FC`) | **6,29:1** no claro e **6,50:1** no escuro sobre superfície base. Transiciona do anil profundo para o lavanda luminoso, garantindo destaque sem ofuscamento no escuro. |
| `color.on-action` | `neutral-0` (`#FFFFFF`) | `neutral-900` (`#1B1B1F`) | **6,29:1** no claro e **6,50:1** no escuro sobre `color.action`. Garante legibilidade máxima em rótulos de botões primários. |
| `color.action-subtle` | `purple-200` (`#E9D5FF`) | `purple-600` (`#9333EA`) | Utilizado em indicadores de repouso/ativos (ex.: pílula da navbar) e chips de categoria. Fornece distinção suave sem conflitar com a ação principal. |
| `color.surface` | `neutral-0` (`#FFFFFF`) | `neutral-900` (`#1B1B1F`) | Superfície principal de fundo. Proporciona descanso visual no tema escuro e alta clareza no tema claro. |
| `color.surface-variant` | `neutral-100` (`#F3F4F6`) | `neutral-900` (`#1B1B1F`) | Superfície secundária para agrupamentos visuais e cards. No tema escuro, a diferenciação é reforçada pela elevação (`elevation.card`) ou borda sutil. |
| `color.on-surface` | `neutral-900` (`#1B1B1F`) | `neutral-0` (`#FFFFFF`) | **17,17:1** em ambos os modos sobre `color.surface`. Destinado a títulos de tela (`font.title`), textos corridos (`font.body`) e ícones principais. |
| `color.on-surface-variant` | `neutral-600` (`#5F6673`) | `neutral-200` (`#E5E7EB`) | **5,78:1** no claro sobre `color.surface` (`#FFFFFF`), **5,25:1** sobre `color.surface-variant` (`#F3F4F6`) e **13,46:1** no escuro (sobre `#1B1B1F`). Corrigido na 1.2: o valor anterior, `neutral-500` (`#6B7280`), dava 4,83:1 sobre branco, mas só 4,39:1 sobre `#F3F4F6` e reprovava o WCAG 1.4.3 dentro de cards e campos. |
| `color.border` | `neutral-200` (`#E5E7EB`) | `neutral-500` (`#6B7280`) | Bordas divisórias de cards e separadores de listas. Delimita áreas sem criar ruído visual. |
| `color.focus` | `blue-600` (`#4F46E5`) | `purple-400` (`#C084FC`) | **6,29:1** no claro e **6,50:1** no escuro sobre o fundo adjacente. Supera o mínimo de 3,0:1 exigido pela WCAG 2.4.11 para anéis de foco visíveis. |
| `color.error` | `error-500` (`#EF4444`) | `error-500` (`#EF4444`) | Sinalização de falhas e erros de validação. No modo claro (3,76:1), deve sempre acompanhar ícone de alerta e mensagem textual em `color.on-surface`. No modo escuro (4,56:1), atinge conformidade total. |
| `color.success` | `success-500` (`#22C55E`) | `success-500` (`#22C55E`) | Celebração de metas, conclusão de hábitos e feedback positivo. Aplicado a ícones e badges, sempre acompanhado de texto em `color.on-surface`. |
| `color.warning` | `warning-500` (`#F59E0B`) | `warning-500` (`#F59E0B`) | Avisos de pendência e prazos próximos. Sempre associado a ícones semânticos de alerta. |
| `color.info` | `info-500` (`#3B82F6`) | `info-500` (`#3B82F6`) | Dicas de estudo e mensagens informativas da jornada. |

### Regras de transição e aplicação de tema

1. **Uso de primitivos de status:** Os tokens de status (`error`, `success`, `warning`, `info`) mantêm o mesmo tom vibrante (`-500`) em ambos os temas para preservar o reconhecimento universal. Como no fundo claro o contraste direto de texto colorido pode ser inferior a 4,5:1, é **obrigatório** aplicar o Princípio de Independência de Cor (WCAG 1.4.1), associando texto em `color.on-surface` e ícone semântico representativo.
2. **Superfícies e elevações no escuro:** No modo escuro, a diferenciação entre `color.surface` e `color.surface-variant` é mediada pela elevação (`elevation.card`) ou por borda delimitadora em `color.border`, evitando contrastes abruptos que gerem cansaço visual.
3. **Equivalência semântica:** Nenhum componente deve realizar checagens manuais como `isDark ? "#FFFFFF" : "#000000"`. A estilização deve consumir estritamente os nomes de tokens semânticos (`theme.color.*`), garantindo consistência total caso novos temas ou ajustes finos de contraste sejam introduzidos.

## 5. (Bônus) Versão legível por máquina

<!-- Opcional: os mesmos tokens no formato do W3C Design Tokens (designtokens.org), em JSON. -->
