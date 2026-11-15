# Quadro de ícone (IconTile)

Origem no sistema base: sem equivalente direto. Situação: Novo (1.2). Motivo: identificar uma rotina pelo ícone escolhido pelo estudante, na lista e no detalhe (protótipo 3 e 3.2).

## Anatomia

1. Caixa de `achievement.size` (60 dp), cantos `achievement.radius` (`radius.lg`), fundo `color.action-subtle` e contorno `cosmicBorders.sheet`.
2. Ícone de `size.icon-lg` (32 dp) em `color.focus`.

## Estados

É decorativo: não recebe toque nem foco, e o leitor de tela o ignora. O nome da rotina carrega a informação.

## Acessibilidade

- Ícone `#D4A3FF` sobre `#232052`: acima de 3:1 (WCAG 1.4.11).

## Código

Implementado em [IconTile.tsx](../../src/view/components/IconTile.tsx). Ícones disponíveis para rotinas: `track_changes` (Geral), `menu_book`, `calculate`, `translate`, `science`, `code` e `music_note`.
