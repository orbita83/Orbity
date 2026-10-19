# Tokens

<!-- Camada 2 da aula: decisões com nome. Três níveis: primitivo → semântico → componente.
     Formato do nome: categoria.papel.variação (ex.: color.action, space.md, radius.lg, font.title).
     Escreva sempre valor + unidade (px, dp ou pt). Em toda tabela, a coluna "Origem" usa: Herdado | Adaptado | Novo. -->

## 1. Primitivos (o valor bruto)

### Cor

| Token | Valor | Origem |
| --- | --- | --- |
| `blue-600` | `#4F46E5` | TODO |
| `neutral-0` | `#FFFFFF` | TODO |
| `neutral-900` | `#1B1B1F` | TODO |
| TODO | TODO | TODO |

### Espaço (grade de 8 pontos: múltiplos de 8, ou de 4 para ajustes finos)

| Token | Valor | Origem |
| --- | --- | --- |
| `space-4` | 4 px | TODO |
| `space-8` | 8 px | TODO |
| `space-16` | 16 px | TODO |
| `space-24` | 24 px | TODO |
| `space-32` | 32 px | TODO |

## 2. Semânticos (o significado)

### Cor

| Token | Claro | Escuro | Uso | Origem |
| --- | --- | --- | --- | --- |
| `color.action` | `blue-600` | TODO | Ações principais | TODO |
| `color.on-action` | `neutral-0` | TODO | Texto e ícone sobre `color.action` | TODO |
| `color.surface` | TODO | TODO | Fundo das telas | TODO |
| `color.on-surface` | TODO | TODO | Texto sobre `color.surface` | TODO |
| `color.error` | TODO | TODO | Erros e ações destrutivas | TODO |
| `color.focus` | TODO | TODO | Anel de foco | TODO |

### Tipografia

| Token | Família | Tamanho | Peso | Altura de linha | Uso | Origem |
| --- | --- | --- | --- | --- | --- | --- |
| `font.title` | TODO | TODO | TODO | TODO | Títulos de tela | TODO |
| `font.body` | TODO | TODO | TODO | TODO | Texto corrido | TODO |
| `font.label` | TODO | TODO | TODO | TODO | Rótulos de botão e campo | TODO |

### Espaço, forma e elevação

| Token | Valor | Uso | Origem |
| --- | --- | --- | --- |
| `space.sm` | `space-8` | Espaço entre elementos relacionados | TODO |
| `space.md` | `space-16` | Margem interna padrão | TODO |
| `space.lg` | `space-24` | Separação entre grupos | TODO |
| `radius.md` | TODO | Campos e botões | TODO |
| `radius.lg` | TODO | Cards | TODO |
| `elevation.card` | TODO | Cards sobre a superfície | TODO |

### Movimento

| Token | Valor | Uso | Origem |
| --- | --- | --- | --- |
| `motion.duration.short` | TODO ms | Feedback de toque | TODO |
| `motion.duration.medium` | TODO ms | Transições entre telas | TODO |
| `motion.easing.standard` | TODO | Curva padrão | TODO |

## 3. Tokens de componente (onde é usado)

| Token | Aponta para | Origem |
| --- | --- | --- |
| `button.bg` | `color.action` | TODO |
| `button.label` | `color.on-action` | TODO |
| `button.radius` | `radius.md` | TODO |
| `button.bg-hover` | TODO | TODO |
| `button.bg-pressed` | TODO | TODO |
| `button.bg-disabled` | TODO | TODO |

## 4. Modo escuro

TODO: diga quais tokens semânticos mudam de valor no modo escuro. Os componentes não mudam, só os valores dos tokens semânticos.

## 5. (Bônus) Versão legível por máquina

<!-- Opcional: os mesmos tokens no formato do W3C Design Tokens (designtokens.org), em JSON. -->
