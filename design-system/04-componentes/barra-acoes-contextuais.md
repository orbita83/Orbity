# Barra de ações contextuais (ContextualActionBar)

Origem no sistema base: Material 3, Bottom app bar e Top app bar contextual. Situação: Novo (1.2). Motivo: substituir a navbar durante a seleção múltipla de tarefas (F6), com cabeçalho de contador e ações em lote.

Referências locais: [05-padroes.md](../05-padroes.md#4-gestão-de-tarefas-e-ações-em-lote-f5-f6), [navbar.md](navbar.md) e [02-tokens.md](../02-tokens.md).

## Quando usar

- Use apenas no modo de seleção múltipla, aberto por *long-press* em um card de tarefa.

## Quando não usar

- Não use como navegação global ou junto da navbar.

## Anatomia

1. **Cabeçalho fixo:** botão "✕" (48 dp) e texto "N selecionados" em `font.label`; fundo `navbar.bg`, fio inferior `color.border-subtle` e `shadow.bar-top`.
2. **Barra inferior:** ocupa exatamente o lugar da navbar; fundo `navbar.bg`, fio superior `color.border-subtle` e `shadow.bar`.
3. **Ações:** Fixar, Marcar todas e Excluir (n), cada uma com ícone de 24 dp e rótulo visível em `font.label` e `color.on-surface`; o ícone de Excluir usa `color.error`.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Seleção de tarefas | F6 | `navbar.bg`, `color.border-subtle`, `shadow.bar`, `shadow.bar-top`, `font.label`, `color.error`, `target.min-size` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Conforme a anatomia | Ações aplicam-se aos selecionados | Papel `toolbar`; contador anunciado ao mudar |
| Hover | Fundo `color.action-subtle` na ação (Web) | — | — |
| Pressionado | `motion.scale-pressed` + `motion.opacity-pressed` | Feedback curto | Mantém área de 48 dp |
| Foco | Anel `color.focus` | Teclado | Contraste ≥ 3:1 |
| Desabilitado | Opacidade 0,6 quando nada está selecionado | Bloqueia a ação | `{ disabled: true }` |

## Acessibilidade

- "✕" tem nome "Cancelar seleção" e devolve o foco ao card de origem.
- O contador é anunciado em região ao vivo educada.
- Excluir combina ícone, texto e número; a confirmação é obrigatória (desenho pendente).

## Faça e evite

- **Faça:** restaure a navbar ao cancelar ou concluir a ação.
- **Evite:** excluir em lote sem confirmação.

## Lacunas

- Desenho da confirmação de exclusão em lote.

## Código

Ainda não implementado.
