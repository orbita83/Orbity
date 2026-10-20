# Tokens

<!-- Camada 2 da aula: decisões com nome. Três níveis: primitivo → semântico → componente.
     Formato do nome: categoria.papel.variação (ex.: color.action, space.md, radius.lg, font.title).
     Escreva sempre valor + unidade (px, dp ou pt). Em toda tabela, a coluna "Origem" usa: Herdado | Adaptado | Novo. -->

## 1. Primitivos (o valor bruto)

### Cor

| Token         | Valor     | Amostra                                         | Origem   |
| ---           | ---       | ---                                             | ---      |
| `blue-600`    | `#4F46E5` | ![blue-600](./images/colors/blue-600.svg)       | Adaptado |
| `purple-500`  | `#8B5CF6` | ![purple-500](./images/colors/purple-500.svg)   | Adaptado |
| `purple-600`  | `#9333EA` | ![purple-600](./images/colors/purple-600.svg)   | Adaptado |
| `purple-400`  | `#C084FC` | ![purple-400](./images/colors/purple-400.svg)   | Adaptado |
| `purple-200`  | `#E9D5FF` | ![purple-200](./images/colors/purple-200.svg)   | Adaptado |
| `neutral-0`   | `#FFFFFF` | ![neutral-0](./images/colors/neutral-0.svg)     | Adaptado |
| `neutral-100` | `#F3F4F6` | ![neutral-100](./images/colors/neutral-100.svg) | Adaptado |
| `neutral-200` | `#E5E7EB` | ![neutral-200](./images/colors/neutral-200.svg) | Adaptado |
| `neutral-500` | `#6B7280` | ![neutral-500](./images/colors/neutral-500.svg) | Adaptado |
| `neutral-900` | `#1B1B1F` | ![neutral-900](./images/colors/neutral-900.svg) | Adaptado |
| `success-500` | `#22C55E` | ![success-500](./images/colors/success-500.svg) | Novo     |
| `warning-500` | `#F59E0B` | ![warning-500](./images/colors/warning-500.svg) | Novo     |
| `error-500`   | `#EF4444` | ![error-500](./images/colors/error-500.svg)     | Adaptado |
| `info-500`    | `#3B82F6` | ![info-500](./images/colors/info-500.svg)       | Novo     |

### Espaço (grade de 8 pontos: múltiplos de 8, ou de 4 para ajustes finos)

| Token     | Valor | Origem  |
| ---       | ---   | ---     |
| `space-4` | 4 px  | Herdado |
| `space-8` | 8 px  | Herdado |
| `space-16`| 16 px | Herdado |
| `space-24`| 24 px | Herdado |
| `space-32`| 32 px | Herdado |

## 2. Semânticos (o significado)

### Cor

| Token             | Claro        | Escuro       | Uso                               | Origem   |
| ---               | ---          | ---          | ---                               | ---      |
| `color.action`    | `blue-600`   | `purple-400` | Ações principais                  | Adaptado |
| `color.on-action` | `neutral-0`  | `neutral-900`| Texto e ícone sobre `color.action`| Adaptado |
| `color.surface`   | `neutral-0`  | `neutral-900`| Fundo das telas                   | Adaptado |
| `color.on-surface`| `neutral-900`| `neutral-0`  | Texto sobre `color.surface`       | Adaptado |
| `color.error`     | `error-500`  | `error-500`  | Erros e ações destrutivas         | Adaptado |
| `color.focus`     | `blue-600`   | `purple-400` | Anel de foco                      | Adaptado |

### Tipografia

| Token        | Família | Tamanho | Peso | Altura de linha | Uso                     | Origem   |
| ---          | ---     | ---     | ---  | ---             | ---                     | ---      |
| `font.title` | Roboto  | 24 px   | 700  | 32 px           | Títulos de tela         | Adaptado |
| `font.body`  | Roboto  | 16 px   | 400  | 24 px           | Texto corrido           | Adaptado |
| `font.label` | Roboto  | 14 px   | 500  | 20 px           | Rótulos de botão e campo| Adaptado |

### Espaço, forma e elevação

| Token            | Valor     | Uso                                 | Origem   |
| ---              | ---       | ---                                 | ---      |
| `space.sm`       | `space-8` | Espaço entre elementos relacionados | Herdado  |
| `space.md`       | `space-16`| Margem interna padrão               | Herdado  |
| `space.lg`       | `space-24`| Separação entre grupos              | Herdado  |
| `radius.md`      | 12 px     | Campos e botões                     | Adaptado |
| `radius.lg`      | 16 px     | Cards                               | Adaptado |
| `elevation.card` | 2 dp      | Cards sobre a superfície            | Adaptado |
| `target.min-size`| 48 dp     | Área mínima de controles interativos| Herdado  |
| `focus.ring-width` | 2 dp    | Espessura do indicador de foco      | Herdado  |
| `focus.ring-offset`| 2 dp    | Distância entre foco e componente   | Herdado  |

### Movimento

| Token                    | Valor                        | Uso                     | Origem   |
| ---                      | ---                          | ---                     | ---      |
| `motion.duration.short`  | 100 ms                       | Feedback de toque       | Adaptado |
| `motion.duration.medium` | 300 ms                       | Transições entre telas  | Adaptado |
| `motion.easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Curva padrão            | Adaptado |

## 3. Tokens de componente (onde é usado)

| Token                | Aponta para                       | Origem   |
| ---                  | ---                               | ---      |
| `button.bg`          | `color.action`                    | Adaptado |
| `button.label`       | `color.on-action`                 | Adaptado |
| `button.radius`      | `radius.md`                       | Adaptado |
| `button.min-height`  | `target.min-size`                 | Herdado  |
| `button.min-width`   | `target.min-size`                 | Herdado  |
| `button.focus-color` | `color.focus`                     | Adaptado |
| `button.focus-width` | `focus.ring-width`                | Herdado  |
| `button.focus-offset`| `focus.ring-offset`               | Herdado  |
| `button.bg-hover`    | `color.action` + estado hover     | Adaptado |
| `button.bg-pressed`  | `color.action` + estado pressed   | Adaptado |
| `button.bg-disabled` | `color.surface` + estado disabled | Adaptado |

## 4. Modo escuro

O Orbity possui os modos claro e escuro, mantendo os mesmos nomes de tokens semânticos nos dois temas. A mudança ocorre nos valores associados aos tokens, sem exigir componentes diferentes para cada modo.

Os seguintes tokens semânticos mudam de valor:

- `color.action`: de `blue-600` para `purple-400`.
- `color.on-action`: de `neutral-0` para `neutral-900`.
- `color.surface`: de `neutral-0` para `neutral-900`.
- `color.on-surface`: de `neutral-900` para `neutral-0`.
- `color.focus`: de `blue-600` para `purple-400`.

O token `color.error` mantém `error-500` nos dois temas. Todas as combinações devem ser verificadas quanto ao contraste, com mínimo de 4,5:1 para texto comum.

## 5. (Bônus) Versão legível por máquina

<!-- Opcional: os mesmos tokens no formato do W3C Design Tokens (designtokens.org), em JSON. -->
