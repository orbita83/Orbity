# Card de tarefa (CardTarefa)

Origem no sistema base: listas e cards do Material 3. Situação: Adaptado. O padrão F5 define o card de tarefa, checkbox circular e tokens de forma/elevação. O protótipo de referência mostra título, prazo, conclusão e controle de opções.

## Quando usar

- Use para apresentar título, prazo opcional e estado de conclusão em uma lista de tarefas.
- Forneça callbacks para que o chamador controle a conclusão e a abertura do menu.

## Quando não usar

- Não use como botão primário, filtro ou controle de navegação.
- Não atribua edição, exclusão, seleção múltipla ou abertura de detalhes ao card sem uma especificação própria.

## Anatomia

1. Container com `color.surface`, `radius.lg`, `elevation.card` e padding `space.md`.
2. Indicador circular de conclusão com dimensão visual `space-24` (24 dp) e alvo interativo mínimo `target.min-size` (48 dp). `radius.md` (12 dp) corresponde à metade do diâmetro visual de 24 dp e produz a geometria circular indicada pelo padrão F5.
3. Título escalável em `font.body`, sem truncamento; quando concluído, recebe tachado conforme F5.
4. Prazo opcional como texto fornecido pelo chamador, em `font.label`; o componente não interpreta datas.
5. Controle de opções com reticências e alvo mínimo de 48 dp. O componente chama `onOptionsPress`; a abertura e o conteúdo do menu pertencem ao chamador.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Com prazo | Exibe o texto de prazo informado | `color.on-surface`, `font.body`, `font.label`, `space.sm`, `space.md` |
| Sem prazo | Oculta a linha de prazo | `color.on-surface`, `font.body`, `space.md` |
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

`motion.duration.short` está documentado como 100 ms em `02-tokens.md`, mas ainda não está disponível no tema. Por isso, o Card aplica o tachado sem animação; o feedback sutil previsto em F5 depende de expor o token no tema e definir o tratamento visual.

## Acessibilidade

- O checkbox anuncia papel, ação contextual para concluir/desmarcar, título da tarefa e estado `checked`.
- O botão de opções anuncia a ação e o título da tarefa.
- Os alvos do checkbox e do menu têm ao menos `target.min-size` (48 dp).
- Textos mantêm escala de fonte, podem quebrar linha e não são truncados.
- `color.on-surface` sobre `color.surface` tem contraste documentado de 17,17:1 nos dois temas. O par `color.surface` sobre `color.action` também deve manter o contraste documentado de 6,29:1 no claro e 6,50:1 no escuro.

## Elevação e plataformas

O estilo recebe `elevation.card` (2 dp) pela propriedade `elevation` do React Native. Essa propriedade fornece elevação nativa no Android. React Native Web ignora `elevation`, e não foram adicionadas propriedades de sombra para iOS ou Web porque não há especificação de sombra equivalente no Design System. A aparência de elevação nesses ambientes requer validação e uma decisão específica, sem inventar parâmetros de sombra.

## Lacunas registradas

- Não há token próprio ou decisão aprovada para a espessura do contorno do checkbox; a definição permanece pendente.
- `motion.duration.short` (100 ms) existe na documentação, mas não está exposto no tema; o tachado é instantâneo e o feedback sutil animado permanece pendente.
- O protótipo mostra um contorno arredondado externo, mas esta implementação não adiciona contorno, conforme escopo aprovado.
- `elevation.card` não tem representação visual uniforme entre Android, iOS e Web com os tokens disponíveis. Não foram inventadas sombras adicionais.
- A tipografia manuscrita aparente no protótipo não tem fonte ou token aprovado; o título usa `font.body`.
- O tratamento tipográfico do prazo, prazos vencidos e formatação de datas não foi definido além de receber texto do chamador.
- O conteúdo do menu e as ações disponíveis não estão especificados; a abertura é delegada a `onOptionsPress`.
- Não foi definido se tocar no container abre detalhes, nem o comportamento de long-press/seleção múltipla.
- Não há estado desabilitado ou de carregamento especificado para o Card.

## Código

A implementação está em [card-tarefa.tsx](../../src/view/components/card-tarefa.tsx), as histórias em [card-tarefa.stories.tsx](../../src/view/components/card-tarefa.stories.tsx), e os tokens consumidos vêm de [tokens.ts](../../src/view/theme/tokens.ts).
