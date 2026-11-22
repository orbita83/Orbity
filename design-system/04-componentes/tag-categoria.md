# Tag de categoria (CategoryTag)

Origem no sistema base: Material Design 3, Assist chip. Situação: Adaptado. Motivo da adaptação: o Orbity usa o chip só para **informar** a categoria de estudo de uma tarefa, sem ação ao toque. Por isso ele perde o contorno, o alvo de toque, o foco e os estados interativos do Assist chip, e ganha superfície sólida `color.action-subtle` (destaque por superfície, sem brilho, `03-fundamentos.md`).

Referências locais: [card-tarefa.md](card-tarefa.md), [05-padroes.md](../05-padroes.md) (Seção 4, fluxo F5), [01-principios.md](../01-principios.md) (Princípio 3), [02-tokens.md](../02-tokens.md) e [06-acessibilidade.md](../06-acessibilidade.md). Issue #25.

## Quando usar

- Use para mostrar a categoria de estudo de uma tarefa (Matemática, Leitura, Idiomas, Ciências, Programação ou Música) dentro do [card de tarefa](card-tarefa.md).
- Use sempre com ícone e rótulo juntos.

## Quando não usar

- Não use como filtro, botão ou controle de seleção. Para filtrar a lista, use os [chips de filtro](chips-filtro.md).
- Não use para estados da tarefa (pendente, concluída, fixada). Esses estados têm indicadores próprios no card.
- Não use para "Sem categoria": a tarefa sem categoria não mostra tag.

## Anatomia

1. **Container:** fundo `color.action-subtle`, cantos `radius.md` (12 dp), padding horizontal `space.sm` (8 dp) e vertical `space-4` (4 dp), conteúdo em linha com espaço `space-4` (4 dp). Ocupa só a largura do conteúdo (`alignSelf: "flex-start"`) e pode encolher (`flexShrink: 1`).
2. **Ícone:** Material Symbols preenchido, tamanho `space.md` (16 dp, o mesmo do alfinete de fixação do card), cor `color.on-surface`. O ícone de cada categoria vem do chamador (`TASK_CATEGORY_SYMBOLS` em `src/view/categoryCopy.ts`).
3. **Rótulo:** `font.label` (14/20, 500) em `color.on-surface`, com `allowFontScaling`. Quebra de linha dentro da tag em vez de truncar.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Padrão | Uma categoria dentro do card de tarefa | `color.action-subtle`, `color.on-surface`, `font.label`, `radius.md`, `space.sm`, `space-4`, `space.md` |

Os três temas usam os mesmos papéis: cósmico (`#FAF9FF` sobre `#232052`), escuro legado (`#FFFFFF` sobre `purple-600`, `#9333EA`) e claro (`#1B1B1F` sobre `purple-200`, `#E9D5FF`).

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Fundo `color.action-subtle`, ícone e rótulo em `color.on-surface` | Só informa; não responde ao toque | Papel `text` e rótulo "Categoria: <rótulo>" |
| Hover | Não se aplica: a tag não é interativa | Nenhum | Nenhum |
| Pressionado | Não se aplica: o toque passa para o card | Nenhum | Nenhum |
| Foco | Não se aplica: a tag não recebe foco de teclado | Nenhum | O leitor de tela lê a tag junto com o conteúdo do card |
| Desabilitado | Não se aplica | Nenhum | Nenhum |

A tarefa concluída mantém a tag igual: o tachado vale só para o título (padrão F5).

## Acessibilidade

- **Alvo de toque:** não se aplica, porque a tag não é interativa. Se um dia ela virar controle (por exemplo, um filtro por categoria), passa a valer o alvo de 48 × 48 dp (`target.min-size`) ou a compensação por `hitSlop` de [06-acessibilidade.md](../06-acessibilidade.md#alvos-de-toque), e a tag precisa de especificação de estados.
- **Contraste do texto e do ícone** (`color.on-surface` sobre `color.action-subtle`, mínimo de 4,5:1 para `font.label`):
  - cósmico: `#FAF9FF` sobre `#232052` = **14,33:1**;
  - escuro: `#FFFFFF` sobre `#9333EA` = **5,38:1**;
  - claro: `#1B1B1F` sobre `#E9D5FF` = **12,61:1**.

  Os três pares estão em [06-acessibilidade.md](../06-acessibilidade.md#tag-de-categoria-issue-25) e são verificados por `tests/ods-theme.test.cjs`.
- **Fundo da tag sobre o card:** no cósmico, `#232052` sobre `#141332` dá 1,20:1, e no claro, `#E9D5FF` sobre `#F3F4F6` dá 1,24:1. A superfície é decorativa: a informação está no texto e no ícone, que passam com folga, e nenhuma ação depende de perceber o limite da tag (WCAG 1.4.11).
- **Independência de cor:** a categoria é identificada pelo rótulo e pelo ícone, nunca só pela cor. Todas as categorias usam a mesma superfície.
- **Leitor de tela:** a tag é um elemento acessível com papel `text` e rótulo "Categoria: <rótulo>" (ex.: "Categoria: Programação"). O ícone não é anunciado separadamente.
- **Texto ampliado:** o rótulo respeita a escala do sistema e quebra de linha. No card, tag e prazo ficam numa linha com `flexWrap`, então com texto ampliado o prazo desce para a linha de baixo.

## Faça e evite

- **Faça:** passe sempre rótulo e símbolo, vindos do `categoryCopy.ts`, para que todas as telas mostrem a mesma categoria do mesmo jeito.
- **Faça:** coloque a tag antes do prazo, na linha de metadados do card.
- **Evite:** cores diferentes por categoria. A distinção vem do rótulo e do ícone; cores por categoria exigiriam novos tokens e novas verificações de contraste.
- **Evite:** dar ação de toque à tag dentro do card. O toque longo e o "•••" do card continuam sendo as únicas ações.

## Código

A implementação está em [CategoryTag.tsx](../../src/view/components/CategoryTag.tsx), as histórias em [CategoryTag.stories.tsx](../../src/view/components/CategoryTag.stories.tsx) e os testes em [CategoryTag.test.tsx](../../src/view/components/CategoryTag.test.tsx).

```tsx
<CategoryTag label={TASK_CATEGORY_LABELS[category]} symbol={TASK_CATEGORY_SYMBOLS[category]} theme={theme} />
```

```ts
tag: {
  backgroundColor: theme.color["action-subtle"],
  borderRadius: theme.radius.md,
  gap: theme.primitive["space-4"],
  paddingHorizontal: theme.space.sm,
  paddingVertical: theme.primitive["space-4"],
},
label: { ...theme.font.label, color: theme.color["on-surface"] },
```

## Lacunas registradas

- Não há filtro por categoria nesta iteração (padrão F5). Um filtro, se vier, exige especificação própria e não deve reaproveitar esta tag sem os estados interativos.
- As categorias são fixas (`tarefas.md`, T3). Categorias criadas pelo estudante e a tela Perfil → Categorias seguem pendentes.
- As rotinas mostram o ícone escolhido em `IconTile`, não esta tag. Mostrar a tag também nos cards de rotina fica para uma decisão futura.
