# Cabeçalho de tela (ScreenHeader)

Origem no sistema base: Material 3, Top app bar (small). Situação: Adaptado (1.2). Motivo: dar às telas que abrem por cima das abas (Nova tarefa, Nova rotina, Detalhe da rotina) um caminho de volta claro, sem navbar.

## Anatomia

1. Botão de 48 × 48 dp: seta `arrow_back` (variante Voltar) ou `close` (variante Fechar), em `color.on-surface`.
2. Título da tela em `font.title`, `color.on-surface`, com papel de cabeçalho.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Voltar | Detalhe e formulários de rotina | `arrow_back` |
| Fechar | Formulário que pode ser descartado (Nova tarefa) | `close` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Conforme a anatomia | Toque volta ou fecha | Nome explícito ("Voltar para Rotinas") |
| Pressionado | `motion.scale-pressed` e `motion.opacity-pressed` | — | — |
| Foco | Anel `color.focus` | Teclado | Contraste ≥ 3:1 |

## Código

Implementado em [ScreenHeader.tsx](../../src/view/components/ScreenHeader.tsx). A tela decide para onde voltar.
