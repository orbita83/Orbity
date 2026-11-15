# Seletor de opções em modal (TaskPickerModal)

Origem no sistema base: Material 3, Dialog com lista de seleção única (Simple dialog). Situação: Novo (1.2). Motivo: escolher data, horário e categoria em Nova tarefa (F4) sem teclado, com alvos grandes e estado perceptível além da cor.

Referências locais: [modal.md](modal.md), [campos-formulario.md](campos-formulario.md), [05-padroes.md](../05-padroes.md#3-criação-de-tarefas-e-rotinas-f4-f7) e [06-acessibilidade.md](../06-acessibilidade.md).

## Quando usar

- Use para escolher um valor de uma lista curta e conhecida: datas próximas, horários e categorias.
- Use ao lado de um campo que também aceita digitação (data e hora), pelo botão acessório do `TextField`.

## Quando não usar

- Não use para escolha múltipla; use caixas de seleção.
- Não use para listas longas que precisem de busca.
- Não use para confirmar ações; use a variante Confirmação do [modal](modal.md).

## Anatomia

1. Véu `color.scrim` e superfície do [modal](modal.md): `color.surface-variant`, cantos `radius.sheet` (24 dp), fio `color.border-subtle`, sombra `shadow.modal`, padding `space.lg`.
2. Cabeçalho: título em `font.card-title` e botão ✕ de 48 × 48 dp com nome explícito.
3. Lista rolável com altura máxima de seis opções, em `radiogroup` com o nome do título.
4. Opção: alvo mínimo de `target.min-size`, cantos `radius.md`, fio `color.border-subtle` sobre `color.surface`; ícone opcional de 24 dp, rótulo em `font.body` e dica opcional em `font.body-sm` com `color.on-surface-variant`.
5. Opção escolhida: borda de 2 dp `color.focus`, fundo `color.action-subtle`, ícone preenchido e marca `check` à direita.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Data | "Sem data", Hoje, Amanhã e os próximos dias, com a data completa como dica | Anatomia acima |
| Horário | "Sem horário" e horários de 30 em 30 minutos | Anatomia acima, sem ícone |
| Categoria | "Sem categoria" e as categorias de estudo | Anatomia acima, com ícone da categoria |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Conforme a anatomia | Toque escolhe e fecha | Papel `radio` com `checked` |
| Hover | Não se aplica em toque | — | — |
| Pressionado | `motion.opacity-pressed` | Feedback curto | Mantém a área de 48 dp |
| Foco | Anel `color.focus` | Teclado | Contraste ≥ 3:1 |
| Escolhida | Borda `color.focus`, fundo `color.action-subtle` e `check` | — | Estado anunciado, não depende só da cor |
| Desabilitado | Não se aplica | — | — |

## Acessibilidade

- O ✕ e o voltar do sistema fecham sem mudar o valor.
- Rótulo e dica são lidos juntos (por exemplo, "Hoje, 15/11/2026").
- `#FAF9FF` sobre `#030417` (opção) e sobre `#232052` (opção escolhida) passam de 4,5:1.

## Faça e evite

- **Faça:** mantenha a digitação direta disponível no campo; o seletor é um atalho.
- **Evite:** listas sem a opção de "nenhum" quando o campo é opcional (ex.: "Sem categoria").

## Código

Ainda não implementado. As opções devem chegar da ViewModel de Nova tarefa (data, horário e categoria); a view não monta a lista a partir de regras do model.
