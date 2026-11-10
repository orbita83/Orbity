# Campos de formulário (FormFields)

Origem no sistema base: Material 3, Text fields (outlined). Situação: Novo (1.2). Motivo: padronizar os campos de Nova tarefa e Nova rotina (F4/F7) no tema cósmico, sem transbordar a tela.

Referências locais: [05-padroes.md](../05-padroes.md#3-criação-de-tarefas-e-rotinas-f4-f7), [02-tokens.md](../02-tokens.md) e [06-acessibilidade.md](../06-acessibilidade.md).

## Quando usar

- Use em formulários de criação e edição de tarefas e rotinas: título, descrição, data, horário de início e fim, categoria.

## Quando não usar

- Não use para busca rápida em listas sem especificação própria.
- Não use campos sem rótulo visível.

## Anatomia

1. Rótulo visível acima do campo, `font.label`, `color.on-surface-variant`.
2. Campo: fundo `color.surface-variant`, contorno de 1 dp `color.border-subtle`, cantos `radius.md`, altura mínima `target.min-size`, padding `space.md`, texto `font.body` em `color.on-surface`.
3. Texto de ajuda ou erro abaixo, `font.label`; erro com ícone em `color.error` e texto em `color.on-surface`.
4. Grupos em linha (data e horários): `fieldset` com `min-width: 0` e grade `repeat(n, minmax(0, 1fr))` na Web; `flex: 1` com `minWidth: 0` no app. Isso impede que campos de data e hora empurrem o formulário para fora da tela (problema visto no protótipo de Nova tarefa).

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Texto | Título, descrição | Anatomia acima |
| Data e hora | Prazo e intervalo | Mesmos tokens, grade de colunas iguais |
| Seleção | Categoria, repetição | Mesmos tokens com ícone `expand_more` (glifo pendente em `material-symbol.tsx`) |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Contorno `color.border-subtle` | Recebe digitação | Rótulo associado ao campo |
| Hover | Contorno `color.border` (Web) | — | — |
| Pressionado | Sem mudança visual | Abre teclado ou seletor | — |
| Foco | Contorno 2 dp `color.focus` | Indica edição | Contraste ≥ 3:1 |
| Erro | Ícone `color.error` e mensagem | Mantém o valor digitado | Mensagem associada e anunciada |
| Desabilitado | Opacidade `button.opacity-disabled` (0,6) | Bloqueia edição | `{ disabled: true }` |

## Acessibilidade

- Rótulo visível sempre; placeholder não substitui o rótulo.
- Texto secundário claro usa `#5F6673` (5,25:1 sobre `surface-variant`), corrigido na 1.2.
- Texto ampliado até 200%: a grade quebra em linhas antes de truncar.

## Faça e evite

- **Faça:** use `minmax(0, 1fr)` em grupos em linha.
- **Evite:** largura fixa em campos de data e hora.

## Código

Ainda não implementado.
