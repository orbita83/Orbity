# Cartão de conquista (AchievementBadge)

Origem no sistema base: sem equivalente direto no Material 3. Situação: Novo (1.2). Motivo: representar conquistas no painel e na lista como caixas arredondadas, com estado perceptível além da cor e sem brilho.

Referências locais: [05-padroes.md](../05-padroes.md) (F1/F2 e F3), [modal.md](modal.md) e [02-tokens.md](../02-tokens.md).

## Quando usar

- Use na faixa de Conquistas do painel (F1/F2) e na lista de Conquistas (F3).
- Use para abrir o detalhe da conquista em [modal](modal.md).

## Quando não usar

- Não use como botão de ação geral ou filtro.
- Não use círculos: a 1.2 adotou caixa arredondada.

## Anatomia

1. Caixa: `achievement.size` (60 × 60 dp) no painel, cantos `achievement.radius` (`radius.lg`), alvo de toque mínimo de 48 dp garantido pela própria caixa.
2. Ícone central de 24 dp: símbolo da conquista quando desbloqueada; cadeado quando bloqueada.
3. Sem rótulo visual de dias abaixo da caixa (1.2). O nome acessível carrega posição e estado.
4. No detalhe, a medalha cresce para 120 dp com `radius.xl` (28 dp).

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Desbloqueada | Conquista obtida | Preenchimento `achievement.unlocked-bg` (`color.action-subtle`), contorno de 1 dp `achievement.unlocked-border` (`#C47EFF` no cósmico), ícone `color.on-surface` |
| Bloqueada | Conquista a obter | Sem preenchimento, contorno `achievement.locked-border` (`color.border-subtle`; cósmico pendente `#2B2654`), cadeado `achievementPendingIcon` (`#8C7BCB`) |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Conforme a variante | Toque abre o modal de detalhe | Papel `button`; nome "Conquista 2 de 6, desbloqueada" |
| Hover | Não se aplica em toque | — | — |
| Pressionado | `motion.scale-pressed` + `motion.opacity-pressed` | Feedback em `motion.duration.short` | Mantém nome e área |
| Foco | Anel `color.focus`, `focus.ring-width`, `focus.ring-offset` | Navegação por teclado | Contraste do foco ≥ 3:1 |
| Desabilitado | Não se aplica | Bloqueadas continuam abríveis para mostrar o critério | — |

## Acessibilidade

- Contraste: contorno desbloqueado `#C47EFF` = 5,55:1 sobre o preenchimento e 6,65:1 sobre o card; cadeado `#8C7BCB` = 4,97:1 sobre o card.
- Estado além da cor: preenchimento, contorno e ícone (símbolo vs cadeado) mudam juntos.
- Leitor de tela: nome com posição, título e estado; o ícone é decorativo.

## Faça e evite

- **Faça:** mostre o critério de desbloqueio mesmo nas bloqueadas.
- **Evite:** halo ou brilho colorido em volta da caixa.
- **Evite:** rótulos de dias sob as caixas no painel.

## Lacunas

- Tipos de conquista além de dias de sequência e se conquistas dão estrelas no Cosmos.
- Carrossel automático com pausa ou rolagem pelo dedo (até decidir, rolagem pelo dedo).

## Código

Ainda não implementado. Os valores estão em `theme.achievement` em [tokens.ts](../../src/view/theme/tokens.ts).
