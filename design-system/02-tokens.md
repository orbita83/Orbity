# Tokens

<!-- Camada 2 da aula: decisões com nome. Três níveis: primitivo → semântico → componente.
     Formato do nome: categoria.papel.variação (ex.: color.action, space.md, radius.lg, font.title).
     Escreva sempre valor + unidade (px, dp ou pt). Em toda tabela, a coluna "Origem" usa: Herdado | Adaptado | Novo. -->

## 1. Primitivos (o valor bruto)

### Cor

| Token | Valor | Origem |
| --- | --- | --- |
| `blue-600` | `#4F46E5` | Adaptado |
| `purple-500` | `#8B5CF6` | Adaptado |
| `purple-600` | `#9333EA` | Adaptado |
| `purple-400` | `#C084FC` | Adaptado |
| `purple-200` | `#E9D5FF` | Adaptado |
| `neutral-0` | `#FFFFFF` | Adaptado |
| `neutral-100` | `#F3F4F6` | Adaptado |
| `neutral-200` | `#E5E7EB` | Adaptado |
| `neutral-500` | `#6B7280` | Adaptado |
| `neutral-900` | `#1B1B1F` | Adaptado |
| `success-500` | `#22C55E` | Novo |
| `warning-500` | `#F59E0B` | Novo |
| `error-500` | `#EF4444` | Adaptado |
| `info-500` | `#3B82F6` | Novo |

### Espaço (grade de 8 pontos: múltiplos de 8, ou de 4 para ajustes finos)

| Token | Valor | Origem |
| --- | --- | --- |
| `space-4` | 4 px | Adaptado |
| `space-8` | 8 px | Herdado |
| `space-16` | 16 px | Herdado |
| `space-24` | 24 px | Herdado |
| `space-32` | 32 px | Herdado |

## 2. Semânticos (o significado)

### Cor

| Token | Claro | Escuro | Uso | Origem |
| --- | --- | --- | --- | --- |
| `color.action` | `blue-600` | `purple-400` | Ações principais | Adaptado |
| `color.on-action` | `neutral-0` | `neutral-900` | Texto e ícone sobre `color.action` | Adaptado |
| `color.surface` | `neutral-0` | `neutral-900` | Fundo das telas | Adaptado |
| `color.on-surface` | `neutral-900` | `neutral-0` | Texto sobre `color.surface` | Adaptado |
| `color.error` | `error-500` | `error-500` | Erros e ações destrutivas | Adaptado |
| `color.focus` | `blue-600` | `purple-400` | Anel de foco | Adaptado |

### Tipografia

| Token | Família | Tamanho | Peso | Altura de linha | Uso | Origem |
| --- | --- | --- | --- | --- | --- | --- |
| `font.title` | Roboto | 24 px | 700 | 32 px | Títulos de tela | Adaptado |
| `font.body` | Roboto | 16 px | 400 | 24 px | Texto corrido | Adaptado |
| `font.label` | Roboto | 14 px | 500 | 20 px | Rótulos de botão e campo | Adaptado |

### Espaço, forma e elevação

| Token | Valor | Uso | Origem |
| --- | --- | --- | --- |
| `space.sm` | `space-8` | Espaço entre elementos relacionados | Herdado |
| `space.md` | `space-16` | Margem interna padrão | Herdado |
| `space.lg` | `space-24` | Separação entre grupos | Herdado |
| `radius.md` | 12 px | Campos e botões | Adaptado |
| `radius.lg` | 16 px | Cards | Adaptado |
| `elevation.card` | 2 dp | Cards sobre a superfície | Adaptado |

### Movimento

| Token | Valor | Uso | Origem |
| --- | --- | --- | --- |
| `motion.duration.short` | 100 ms | Feedback de toque | Adaptado |
| `motion.duration.medium` | 300 ms | Transições entre telas | Adaptado |
| `motion.easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Curva padrão | Adaptado |

## 3. Tokens de componente (onde é usado)

| Token | Aponta para | Origem |
| --- | --- | --- |
| `button.bg` | `color.action` | Adaptado |
| `button.label` | `color.on-action` | Adaptado |
| `button.radius` | `radius.md` | Adaptado |
| `button.bg-hover` | `color.action` + estado hover | Adaptado |
| `button.bg-pressed` | `color.action` + estado pressed | Adaptado |
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
