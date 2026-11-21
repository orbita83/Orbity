# Círculo de concluir (CheckCircle)

Origem no sistema base: Material 3, Checkbox. Situação: Adaptado (1.2). Motivo: marcar a conclusão de tarefas e rotinas com um controle redondo, igual nas duas listas (protótipo 2, 3 e 3.2).

## Quando usar

- Use para concluir uma tarefa, uma rotina do dia ou uma tarefa dentro da rotina.

## Quando não usar

- Não use para escolher opções de formulário; use chips ou rádio.

## Anatomia

1. Alvo: 48 × 48 dp (`target.min-size`).
2. Círculo de `navbar.icon-size` (24 dp) com borda `focus.ring-width` (2 dp) em `color.action`.
3. Concluído: preenchimento `color.action` e ícone `check` em `color.on-action`.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Pendente | Item a fazer | Borda `color.action` |
| Concluído | Item feito | Preenchimento `color.action` e `check` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Conforme a variante | Toque alterna | Papel `checkbox` com `checked` |
| Hover | Não se aplica em toque | — | — |
| Pressionado | `motion.scale-pressed` e `motion.opacity-pressed` | Feedback curto | Mantém a área |
| Foco | Anel `color.focus` | Teclado | Contraste ≥ 3:1 |
| Desabilitado | Bloqueia o toque | — | `{ disabled: true }` |

## Acessibilidade

- O nome inclui a ação e o item: "Concluir tarefa Revisar SOLID" ou "Desmarcar …".
- O estado não depende só da cor: o `check` aparece e a tela risca o título do item.

## Faça e evite

- **Faça:** separe o toque de concluir do toque que abre o item.
- **Evite:** mensagens punitivas ao desmarcar.

## Código

Implementado em [CheckCircle.tsx](../../src/view/components/CheckCircle.tsx). O `TaskCard` passa a usá-lo na tela de Tarefas.

## Marca de seleção (1.3)

Na seleção múltipla de tarefas (2.3) e de rotinas (3.5), a marca de cada card usa o mesmo desenho do `CheckCircle`: preenchida em `color.action` com ✓ em `color.on-action` quando selecionado, e só o aro de 2 dp em `color.action` quando não. Antes (1.2), a marca da seleção era lavanda (`color.focus`) e `inactive`, diferente do círculo das listas.
