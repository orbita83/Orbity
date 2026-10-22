# Chips de filtro de tarefas (FilterChips)

Origem no sistema base: Material Design 3, Filter Chip. Situação: Adaptado. Motivo da adaptação: aplicar a paleta semântica e os tokens de tema do Orbity (modo claro com `color.action` azul e modo escuro com `color.action` roxo `purple-400`), incorporar requisitos estritos de acessibilidade (WCAG 2.1/2.2 AA) com alvo de toque mínimo de 48 × 48 dp (`target.min-size`), anel visível de foco de 2 dp (`focus.ring-width`) e garantia de indicadores perceptíveis além da cor.

Referências locais: [05-padroes.md](../05-padroes.md) (Seção 4: Gestão de Tarefas e Ações em Lote, fluxos F5 e F6), [01-principios.md](../01-principios.md) (Princípios 1, 2 e 3), [02-tokens.md](../02-tokens.md) e [06-acessibilidade.md](../06-acessibilidade.md). O componente viabiliza a filtragem imediata das tarefas do estudante entre todas, pendentes e concluídas.

## Quando usar

- Use para alternar a visualização da lista de tarefas entre "Todos", "Pendentes" e "Concluídas".
- Posicione no topo da lista de tarefas, antes dos cards de tarefa e conforme o padrão F5.
- Permita a seleção de apenas um filtro por vez no grupo de filtros de status.
- Atualize a listagem de tarefas imediatamente após a seleção de outro filtro.

## Quando não usar

- Não use como botões de ação única ou disparadores de formulário (utilize `PrimaryButton`).
- Não use como navegação de nível superior entre telas principais do app (utilize `NavBar`).
- Não utilize seleção múltipla para filtros excludentes de status da tarefa.
- Não use para ações destrutivas ou de lote (ex.: excluir, marcar todas).

## Anatomia

1. **Container do grupo (`FilterChips`):** disposição horizontal em linha (`flexDirection: "row"`), quebra elástica (`flexWrap: "wrap"`), espaçamento horizontal e vertical uniforme com `space.sm` (8 dp), garantindo separação entre alvos adjacentes e integridade em ampliações de texto.
2. **Item do chip (`FilterChipItem`):**
   - **Dimensões e alvo:** altura mínima `target.min-size` (48 dp) e largura mínima de 48 dp, assegurando a área de contato recomendada pelo Material 3 e critérios WCAG 2.5.5 / 2.5.8 sem depender de truncamento.
   - **Bordas e geometria:** cantos arredondados definidos por `radius.md` (12 dp), contorno com espessura `focus.ring-width` (2 dp) em `color.action`.
   - **Preenchimento interno:** padding horizontal `space.md` (16 dp) e vertical `space.sm` (8 dp).
3. **Rótulo textual:** tipografia baseada em `font.label` (14 px, altura de linha 20 px), com `allowFontScaling={true}` habilitado. No estado selecionado, adota peso em negrito (`700`) e no estado não selecionado, peso médio (`500`), oferecendo indicador perceptível independente da percepção de cores (WCAG 1.4.1).
4. **Anel externo de foco:** anel sólido em `color.focus`, espessura `focus.ring-width` (2 dp) e afastamento `focus.ring-offset` (2 dp) para navegação acessível por teclado (Tab).

## Variantes e Estados

| Estado | Tema Claro | Tema Escuro | Comportamento | Acessibilidade |
| :--- | :--- | :--- | :--- | :--- |
| **Não selecionado (Padrão)** | Fundo `color.surface` (`neutral-0` / branco), contorno `color.action` (`blue-600`), texto `color.on-surface` (`neutral-900`) | Fundo `color.surface` (`neutral-900` / escuro), contorno `color.action` (`purple-400` / roxo), texto `color.on-surface` (`neutral-0` / branco) | Seleciona o filtro ao toque/clique e atualiza a lista de tarefas | Papel `button`, `{ selected: false }`, contraste 17,17:1 |
| **Selecionado** | Fundo preenchido em `color.action` (`blue-600`), contorno `color.action`, texto `color.on-action` (`neutral-0` / branco), peso negrito (700) | Fundo preenchido em `color.action` (`purple-400` / roxo), contorno `color.action`, texto `color.on-action` (`neutral-900` / escuro), peso negrito (700) | Indica o filtro ativo; foco e toque repetido mantêm o estado selecionado | Papel `button`, `{ selected: true }`, contraste 6,50:1 no escuro e 6,29:1 no claro |
| **Pressionado** | Redução sutil de opacidade (0.85) para feedback tátil | Redução sutil de opacidade (0.85) para feedback tátil | Feedback visual imediato ao toque | Preserva legibilidade e área de toque |
| **Foco (Teclado)** | Anel externo de 2 dp em `color.focus` com 2 dp de afastamento | Anel externo de 2 dp em `color.focus` com 2 dp de afastamento | Destaca o chip ativo durante a navegação por teclado (Tab) | Atende WCAG 2.4.7 e 2.4.11 |
| **Desabilitado** | Opacidade reduzida, bloqueio de interação | Opacidade reduzida, bloqueio de interação | Bloqueia seleção | Anuncia `{ disabled: true }` |

## Acessibilidade

- **Alvo de toque mínimo:** Cada chip possui altura mínima de **48 dp** (`target.min-size`) e largura mínima de 48 dp, atendendo a WCAG 2.5.5 / 2.5.8 e Material Design 3.
- **Contraste de cores (WCAG 1.4.3 e 1.4.11):**
  - Não selecionado no tema escuro: texto `color.on-surface` (`#FFFFFF`) sobre fundo escuro `color.surface` (`#1B1B1F`) alcança razão de **17,17:1**. Contorno `purple-400` (`#C084FC`) sobre `#1B1B1F` alcança **6,50:1** (superior ao mínimo de 3:0 exigido para componentes).
  - Selecionado no tema escuro: texto `color.on-action` (`#1B1B1F`) sobre fundo roxo `color.action` (`#C084FC`) alcança razão de **6,50:1** (superior ao mínimo de 4,5:1 para texto normal).
  - Tema claro: atinge contrastes documentados de 17,17:1 (não selecionado) e 6,29:1 (selecionado).
- **Independência de cor (WCAG 1.4.1):** O chip selecionado combina mudança de cor de fundo com alteração no peso da fonte (negrito `700` vs médio `500`) e anúncio semântico de seleção.
- **Leitor de tela:** O grupo declara `accessibilityRole="radiogroup"` com rótulo "Filtros de tarefas". Cada chip declara `accessibilityRole="button"`, `accessibilityLabel="Filtrar por [Rótulo]"` e estado dinâmico `accessibilityState={{ selected }}`.
- **Texto ampliado:** Utiliza `allowFontScaling={true}`, sem truncamento fixo e com `flexWrap: "wrap"` no contêiner para suportar escalas de fonte até 200%.
- **Listas vazias:** Quando um filtro selecionado não retorna tarefas (ex.: "Concluídas" sem itens finalizados), a interface apresenta mensagem acolhedora em `color.on-surface` e `font.body` ("Nenhuma tarefa concluída"), sem mensagens punitivas.

## Código

A implementação está em [filter-chips.tsx](../../src/view/components/filter-chips.tsx), o catálogo interativo em [filter-chips.stories.tsx](../../src/view/components/filter-chips.stories.tsx) e os tokens utilizados vêm de [tokens.ts](../../src/view/theme/tokens.ts).
