# Barra de ações contextuais (ContextualActionBar)

Origem no sistema base: Material 3, Bottom app bar e Top app bar contextual. Situação: Novo (1.2). Motivo: substituir a navbar durante a seleção múltipla de tarefas (F6), com cabeçalho de contador e ações em lote.

Referências locais: [05-padroes.md](../05-padroes.md#4-gestão-de-tarefas-e-ações-em-lote-f5-f6), [navbar.md](navbar.md) e [02-tokens.md](../02-tokens.md).

## Quando usar

- Use apenas no modo de seleção múltipla, aberto por *long-press* em um card de tarefa ou, desde a 1.3, de rotina (protótipo 3.5 · Seleção de rotinas, com as mesmas ações: Fixar, Marcar todas e Excluir (n)).

## Quando não usar

- Não use como navegação global ou junto da navbar.

## Anatomia

1. **Cabeçalho fixo:** botão "✕" (48 dp) e texto "N selecionados" em `font.title` (24/32, 700; até a 1.2 era `font.label`, 14/20, pequeno demais para o título do cabeçalho); fundo `navbar.bg`, fio inferior `color.border-subtle` e `shadow.bar-top`.
2. **Barra inferior:** ocupa exatamente o lugar da navbar; fundo `navbar.bg`, fio superior `color.border-subtle` e `shadow.bar`.
3. **Ações:** Fixar, Marcar todas e Excluir (n), cada uma com ícone de 24 dp e rótulo visível em `font.label` e `color.on-surface`. Na 1.3, os ícones passam de `color.focus` (`#D4A3FF`, o lavanda-rosado que destoava da barra) para `color.on-surface-variant` (`#BBB6E3`, 9,4:1 sobre `navbar.bg`); o de Excluir continua em `color.error`. **Editar sai da barra na 1.3:** editar vale para um item só, então fica no detalhe da tarefa ou da rotina e no [menu de opções](menu-opcoes.md) do "•••".

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Seleção de tarefas | F6 | `navbar.bg`, `color.border-subtle`, `shadow.bar`, `shadow.bar-top`, `font.label`, `color.error`, `target.min-size` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Conforme a anatomia | Ações aplicam-se aos selecionados | Papel `toolbar`; contador anunciado ao mudar |
| Pressionado | `motion.scale-pressed` + `motion.opacity-pressed` | Feedback curto | Mantém área de 48 dp |
| Foco | Anel `color.focus` | Teclado | Contraste ≥ 3:1 |
| Desabilitado | Opacidade 0,6 quando nada está selecionado | Bloqueia a ação | `{ disabled: true }` |

## Acessibilidade

- "✕" tem nome "Cancelar seleção" e devolve o foco ao card de origem.
- O contador é anunciado em região ao vivo educada.
- Excluir combina ícone, texto e número; a confirmação é obrigatória por meio da variante Confirmação do [modal](modal.md), onde confirmar usa o estilo primário e cancelar usa o secundário.

## Faça e evite

- **Faça:** restaure a navbar ao cancelar ou concluir a ação.
- **Evite:** excluir em lote sem confirmação.

## Lacunas

- A confirmação de exclusão em lote usa a variante Confirmação do [modal](modal.md); o texto final fica com a tela de Tarefas.

## Código

Implementado em [ContextualActionBar.tsx](../../src/view/components/ContextualActionBar.tsx): `ContextualHeader` (✕ "Cancelar seleção" e contador em região ao vivo) e `ContextualActionBar` (ações com ícone em `color.focus` e rótulo; `destructive` usa `color.error` no ícone; `disabled` usa `button.opacity-disabled`). Os dois respeitam a área segura. Testes em `FeedbackComponents.test.tsx`.
