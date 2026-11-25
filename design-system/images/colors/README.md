# Amostras de cor do ODS

Amostras visuais das cores primitivas do Orbity Design System. Não entram no build do app: servem só para a documentação.

## Arquivos

Um SVG por token primitivo, com o mesmo nome do token: `<token>.svg` (ex.: `purple-500.svg`). Cada arquivo é um quadrado de 24×24 com cantos de 3 px, preenchido com o valor do token e contornado em cinza (`#999`), para que as cores claras continuem visíveis em fundo branco.

| Usado em | Amostras |
| :--- | :--- |
| `design-system/02-tokens.md` (tabela de primitivos) | Todas |
| `README.md` da raiz (paleta) | `purple-500`, `purple-400`, `purple-200`, `blue-600`, `neutral-900`, `success-500` |

## Ao alterar um token

O valor de cada amostra precisa ser igual ao do token em `design-system/02-tokens.md` e em `src/view/theme/tokens.ts`.

- **Valor alterado:** atualize o `fill` do SVG correspondente.
- **Token novo:** crie a amostra com o mesmo nome e o mesmo modelo dos outros arquivos.
- **Token removido:** apague a amostra só depois de conferir com `git grep -n "images/colors/<token>.svg"` que nada a referencia.

## Origem

- As 14 primeiras amostras foram adicionadas por Cassiosampaio2016 em 19/10/2026 (commit `2243fad`).
- A `neutral-600` foi adicionada por MailsonSousa88 em 10/11/2026 (commit `4b25c7d`, ODS 1.2.0).
- São SVGs de uma linha, com um único retângulo e nenhuma imagem raster, e não há registro de uso de IA.
