# Modal (Modal)

Origem no sistema base: Material 3, Dialog. Situação: Novo (1.2). Motivo: apresentar detalhes (como a conquista em F3) sobre a tela atual, com véu escuro e fechamento explícito por "✕".

Referências locais: [05-padroes.md](../05-padroes.md#6-conquistas-f3), [cartao-conquista.md](cartao-conquista.md) e [06-acessibilidade.md](../06-acessibilidade.md).

## Quando usar

- Use para o detalhe da conquista (1.4) e para confirmações curtas (como a exclusão em lote, quando desenhada).

## Quando não usar

- Não use para formulários longos de criação; use tela própria.
- Não use para conteúdo que o estudante precise comparar com a tela de fundo.

## Anatomia

1. Véu: `color.scrim` (`rgba(3, 4, 23, 0.72)`) cobrindo a tela inteira.
2. Superfície: `color.surface-variant`, cantos `radius.sheet` (24 dp), fio `color.border-subtle`, sombra `shadow.modal`, padding `space.lg`.
3. Botão "✕" no canto superior, 48 × 48 dp, nome "Fechar".
4. Conteúdo: título `font.title`, descrição `font.body`; no detalhe da conquista, medalha de 120 dp com `radius.xl`.
5. Ações: `PrimaryButton` (ex.: "Compartilhar") no rodapé.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Detalhe | Conquista | Anatomia acima |
| Confirmação | Ação destrutiva | Mesmos tokens; ação destrutiva com ícone `color.error` e texto (pendente) |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Aberto | Véu e superfície | Foco vai para o título ou o "✕" | Papel de diálogo modal, título anunciado |
| Fechando | Desvanecimento em `motion.duration.short` | Fecha por "✕", `Escape`, gesto de voltar ou toque no véu | Foco volta ao elemento de origem |
| Hover, pressionado | Nos controles internos, conforme cada componente | — | — |
| Foco | Confinado ao modal | Tab circula dentro dele | WCAG 2.4.3 |
| Desabilitado | Não se aplica | — | — |

## Acessibilidade

- Confine o foco enquanto aberto e restaure-o ao fechar.
- Com movimento reduzido, abra e feche sem escala, apenas com opacidade curta ou instantânea.
- Texto sobre a superfície: `#FAF9FF` sobre `#141332` = 17,16:1.

## Faça e evite

- **Faça:** ofereça sempre o "✕" visível.
- **Evite:** brilho em volta da superfície; use `shadow.modal`.

## Código

Ainda não implementado. React Native oferece `Modal`; os valores estão em `theme.color.scrim`, `theme.shadow.modal` e `theme.sheet.radius`.
