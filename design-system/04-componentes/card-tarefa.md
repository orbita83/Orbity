# Card de tarefa (TaskCard)

> Em `themes.cosmic`, o card usa `color.surface-variant` e a marca do checkbox usa `color.on-action`. Os temas legados mantêm sua superfície anterior. Os contrastes legados citados abaixo não se aplicam automaticamente ao tema cósmico.

Origem no sistema base: listas e cards do Material 3. Situação: Adaptado. O padrão F5 define o card de tarefa, checkbox circular e tokens de forma/elevação. O protótipo de referência mostra título, prazo, conclusão e controle de opções. Desde a issue #25, o card também mostra a categoria de estudo como [tag](tag-categoria.md).

## Quando usar

- Use para apresentar título, categoria e prazo opcionais e estado de conclusão em uma lista de tarefas.
- Forneça callbacks para que o chamador controle a conclusão e a abertura do menu.

## Quando não usar

- Não use como botão primário, filtro ou controle de navegação.
- Não atribua edição, exclusão, seleção múltipla ou abertura de detalhes ao card sem uma especificação própria.

## Anatomia

1. Container com `color.surface`, `radius.lg`, `elevation.card` e padding `space.md`.
2. Indicador circular de conclusão com dimensão visual `space-24` (24 dp) e alvo interativo mínimo `target.min-size` (48 dp). `radius.md` (12 dp) corresponde à metade do diâmetro visual de 24 dp e produz a geometria circular indicada pelo padrão F5.
3. Título escalável em `font.body`, sem truncamento; quando concluído, recebe tachado conforme F5.
4. Linha de metadados, abaixo do título com espaço `space-4` (4 dp), mostrada só quando há categoria ou prazo. Fica em linha com espaço horizontal `space.sm` e vertical `space-4`, e quebra de linha (`flexWrap`) com texto ampliado. Contém, nesta ordem:
   - **Categoria** opcional: [tag de categoria](tag-categoria.md) com ícone e rótulo, recebidos prontos do chamador (`category: { label, symbol }`). O componente não conhece os ids de categoria (issue #25).
   - **Prazo** opcional: texto fornecido pelo chamador, em `font.label`; o componente não interpreta datas. Desde a 1.2, o formato recomendado é dia/mês, ponto médio e intervalo de horário: "19/10 · 08:00–09:00" (traço meia-risca entre os horários).
5. Controle de opções com reticências e alvo mínimo de 48 dp. O componente chama `onOptionsPress`; a abertura e o conteúdo do menu pertencem ao chamador.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Com prazo | Exibe o texto de prazo informado | `color.on-surface`, `font.body`, `font.label`, `space.sm`, `space.md` |
| Sem prazo | Oculta o prazo; sem categoria, oculta a linha de metadados | `color.on-surface`, `font.body`, `space.md` |
| Com categoria (#25) | Mostra a tag antes do prazo, ou sozinha se não houver prazo | Tokens da [tag de categoria](tag-categoria.md): `color.action-subtle`, `color.on-surface`, `font.label`, `radius.md`, `space.sm`, `space-4` |
| Concluída | Indicador preenchido e marca de verificação | `color.action`, `color.on-action`, `radius.md`, `space-24` |

Os temas claro e escuro preservam os mesmos papéis semânticos. A conclusão é controlada pela propriedade `completed`; o título recebe tachado em `true` e texto normal em `false`.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Pendente | Fundo interno `color.surface`, contorno `color.action`; indicador circular de 24 dp | Chama `onToggleCompleted` ao ativar | Papel checkbox e `checked: false` |
| Concluído | Fundo `color.action`, marca em `color.surface` e título tachado | Chama `onToggleCompleted` ao ativar; o chamador atualiza `completed` | Papel checkbox e `checked: true` |
| Opções disponíveis | Reticências do protótipo | Chama `onOptionsPress`; não abre menu internamente | Papel botão e rótulo contextual com o título |
| Foco, hover e pressionado | Não especificados para o card | Sem comportamento adicional presumido | Foco nativo permanece disponível |

O estilo atual ainda usa `focus.ring-width` (2 dp) como espessura do contorno do checkbox, mas F5 não aprova esse token para esse papel. Não há decisão aprovada nem token específico para essa espessura; o uso permanece como pendência e precisa de decisão do grupo.

`motion.duration.short` está documentado como 100 ms em `02-tokens.md` e, desde a 1.2, exposto no tema como `theme.motion.durationShort`. Por isso, o Card aplica o tachado sem animação; o feedback sutil previsto em F5 depende de expor o token no tema e definir o tratamento visual.

## Acessibilidade

- O checkbox anuncia papel, ação contextual para concluir/desmarcar, título da tarefa e estado `checked`.
- O botão de opções anuncia a ação e o título da tarefa.
- Os alvos do checkbox e do menu têm ao menos `target.min-size` (48 dp).
- Textos mantêm escala de fonte, podem quebrar linha e não são truncados.
- A tag de categoria é anunciada como "Categoria: <rótulo>" junto com o conteúdo do card. Quando o conteúdo aceita toque longo, ele vira um único elemento acessível, e o iOS deixa de ler o rótulo próprio da tag. Por isso, o grupo recebe o rótulo "<título>, Categoria: <rótulo>, <prazo>", sem as partes que a tarefa não tiver. No modo de seleção, o card inteiro vira um `checkbox` com rótulo próprio ("Selecionar tarefa: <título>"), e a categoria não entra nesse rótulo.
- No card selecionado (fundo `color.action-subtle`), a tag fica com a mesma cor do fundo. O texto e o ícone continuam legíveis, com o mesmo contraste da tag (ver [tag-categoria.md](tag-categoria.md#acessibilidade)).
- `color.on-surface` sobre `color.surface` tem contraste documentado de 17,17:1 nos dois temas. O par `color.surface` sobre `color.action` também deve manter o contraste documentado de 6,29:1 no claro e 6,50:1 no escuro.

## Elevação e plataformas

O estilo recebe `elevation.card` (2 dp) pela propriedade `elevation` do React Native. Essa propriedade fornece elevação nativa no Android. Não foram adicionadas propriedades de sombra para iOS porque não há especificação de sombra equivalente no Design System. A aparência de elevação nesse ambiente requer validação e uma decisão específica, sem inventar parâmetros de sombra.

## Lacunas registradas

- Não há token próprio ou decisão aprovada para a espessura do contorno do checkbox; a definição permanece pendente.
- `motion.duration.short` (100 ms) está exposto no tema desde a 1.2, mas o tachado continua instantâneo; o feedback sutil animado permanece pendente.
- O protótipo mostra um contorno arredondado externo, mas esta implementação não adiciona contorno, conforme escopo aprovado.
- `elevation.card` não tem representação visual uniforme entre Android e iOS. A 1.2 não criou sombra para o card: no cósmico, a separação vem do gradiente e do contorno `cosmicBorders.card`.
- A tipografia manuscrita aparente no protótipo não tem fonte ou token aprovado; o título usa `font.body`.
- O tratamento tipográfico do prazo, prazos vencidos e formatação de datas não foi definido além de receber texto do chamador.
- O conteúdo do menu foi especificado na 1.3 em [menu-opcoes.md](menu-opcoes.md); a abertura continua delegada a `onOptionsPress`.
- Não foi definido se tocar no container abre detalhes. O long-press abre a seleção múltipla (F6).
- Não há estado desabilitado ou de carregamento especificado para o Card.

## Código

A implementação está em [TaskCard.tsx](../../src/view/components/TaskCard.tsx), as histórias em [TaskCard.stories.tsx](../../src/view/components/TaskCard.stories.tsx), e os tokens consumidos vêm de [tokens.ts](../../src/view/theme/tokens.ts).

Desde a tela de Tarefas (protótipo 2 e 2.3):

- O tema padrão passa a ser `themes.cosmic`, com gradiente `cosmicGradients.card` e contorno `cosmicBorders.card`.
- A conclusão usa o [CheckCircle](circulo-concluir.md).
- O prazo usa `font.label` em `color.on-surface-variant`.
- `onLongPress` no texto abre a seleção múltipla (F6). Na 1.3, o "•••" (`onOptionsPress`) passa a abrir o [menu de opções](menu-opcoes.md) (Editar, Fixar e Excluir) para uma tarefa só; antes, ele abria a seleção múltipla.
- `pinned` mostra o ícone `push_pin` antes do título.
- `category` (issue #25) mostra a [CategoryTag](tag-categoria.md) antes do prazo. Antes, o rótulo era colado ao prazo como texto ("Programação · 19/10 · 08:00–09:00"). Na tela de Tarefas, `tasks-content.tsx` converte o id em rótulo e símbolo pelo `categoryCopy.ts`.
- `selectionMode`, `selected` e `onToggleSelected`: o card inteiro vira um `checkbox` "Selecionar tarefa: <título>"; selecionado, ganha fundo `color.action-subtle`, borda de 2 dp `color.focus` e marca preenchida.

## Mudanças da 1.2

- No cósmico, o alvo é gradiente `cosmicGradients.card` (`#141332` → `#0D0E26`) com contorno de 1 dp `cosmicBorders.card` (`#232044`), sem brilho em volta do card nem do checkbox.
- Formato de prazo "19/10 · 08:00–09:00".

**Implementação pendente:** `TaskCard.tsx` continua com superfície sólida `color.surface-variant` até existir um componente de gradiente.
