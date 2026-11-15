# Barra de progresso (ProgressBar)

Origem no sistema base: Material 3, Linear progress indicator. Situação: Novo (1.2). Motivo da adaptação: mostrar o avanço do dia com contador textual e porcentagem legível, sem depender da cor nem do contraste do preenchimento.

Referências locais: [05-padroes.md](../05-padroes.md#2-navegação-e-modo-foco-f1-f2) (card Progresso de hoje), [painel-deslizante.md](painel-deslizante.md), [02-tokens.md](../02-tokens.md) e [06-acessibilidade.md](../06-acessibilidade.md).

## Quando usar

- Use no card "Progresso de hoje" para mostrar tarefas e rotinas concluídas sobre o total do dia ("1 / 25").
- Use quando o total for conhecido e o progresso puder ser expresso como proporção.

## Quando não usar

- Não use para tempo de foco: os minutos da sessão ficam no card Última sessão e no cronômetro.
- Não use para carregamento indeterminado; use esqueletos.
- Não use cor de erro ou mensagem de falha quando o progresso estiver baixo.

## Anatomia

1. Linha de texto: rótulo ("Progresso de hoje") à esquerda; contador "concluídas / total" e porcentagem à direita, em `font.label` com `color.on-surface`. **A porcentagem fica fora da barra**, nunca sobre o preenchimento.
2. Trilha: altura `progress.height` (20 dp), fundo `progress.track` (`color.action-subtle`; cósmico `#232052`), cantos totalmente arredondados (metade da altura).
3. Preenchimento: largura proporcional exata ao valor, `progress.fill` (cósmico `cosmicGradients.progress`, `#8A42FA` → `#8648FA`; legados `color.action`), mesmos cantos.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Padrão | Progresso de hoje no painel | `progress.height`, `progress.track`, `progress.fill`, `font.label`, `color.on-surface`, `space.sm` |
| Compacta | Futuro uso em listas; não validada | Mesmos tokens com altura menor ainda não definida (lacuna) |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Trilha e preenchimento proporcionais; texto "1 / 25 · 4%" | Atualiza ao concluir ou desmarcar itens | Papel `progressbar` com `min`, `max`, `now` e texto |
| Vazio | Só a trilha; texto "0 / 25" e mensagem acolhedora | Sem animação | Anuncia "0 de 25 concluídas" |
| Completo | Preenchimento em toda a trilha; texto "25 / 25 · 100%" | Pode acompanhar celebração textual | Anuncia conclusão em texto |
| Hover | Não se aplica | Não interativa | — |
| Pressionado | Não se aplica | Não interativa | — |
| Foco | Não recebe foco; o card pode receber | — | — |
| Desabilitado | Não se aplica | — | — |

## Acessibilidade

- Contraste: porcentagem e contador `#FAF9FF` sobre card `#141332` = 17,16:1; preenchimento sobre trilha = 3,03:1 a 3,09:1 (ver [06-acessibilidade.md](../06-acessibilidade.md)).
- Leitor de tela: `accessibilityRole="progressbar"` com `accessibilityValue={{ min: 0, max: total, now: concluídas, text: "1 de 25 concluídas, 4%" }}`.
- Movimento: a mudança de largura pode usar `motion.duration.medium`; com movimento reduzido, atualize sem transição.
- Texto ampliado: a linha de texto quebra acima da barra; a barra não encolhe abaixo de `progress.height`.

## Faça e evite

- **Faça:** conte tarefas e rotinas concluídas sobre o total do dia.
- **Faça:** mantenha contador e porcentagem em texto, fora da barra.
- **Evite:** escrever a porcentagem sobre o preenchimento: o contraste varia com o avanço.
- **Evite:** adicionar brilho no preenchimento.

## Código

Ainda não implementado. Os valores estão em `theme.progress` e `cosmicGradients.progress` em [tokens.ts](../../src/view/theme/tokens.ts).
