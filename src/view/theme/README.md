# theme

## Overview

Implementação em TypeScript dos tokens visuais do Orbity. O comentário no topo de `tokens.ts` indica que os valores são definidos em `design-system/02-tokens.md`. O módulo expõe primitivas, a paleta cósmica opt-in (comentário: "versão 1.1"), tokens de acessibilidade e os temas prontos `light`, `dark` e `cosmic` consumidos pelos componentes de `src/view/components`.

## Interface

- `tokens.ts`
  - `primitives` (`as const`): cores primitivas (`blue-600`, `purple-500`, `purple-600`, `purple-400`, `purple-200`, `neutral-0`, `neutral-100`, `neutral-200`, `neutral-500`, `neutral-900`, `success-500`, `warning-500`, `error-500`, `info-500`) e espaçamentos (`space-4`, `space-8`, `space-16`, `space-24`, `space-32`).
  - `ThemeMode`: `"light" | "dark"`.
  - `cosmicColors` (`as const`): `background`, `card`, `sheet`, `text`, `muted`, `inactive`, `action`, `actionEnd`, `actionHover`, `focus`, `track`, `progress`, `progressEnd`.
  - `accessibilityTokens` (`as const`): `target.minSize = 48`, `focus.ringWidth = 2`, `focus.ringOffset = 2`.
  - `sharedTokens` (`as const`): `target`, `focus` (reaproveitados de `accessibilityTokens`), `radius: { md: 12, lg: 16 }`, `elevation: { card: 2 }`.
  - `OrbityTheme`: `ReturnType<typeof createTheme>` acrescido de `componentOverrides?: { cardSurface?, checkboxMark?, navbarBorder? }`. Grupos: `color` (`action`, `on-action`, `action-subtle`, `surface`, `surface-variant`, `on-surface`, `on-surface-variant`, `border`, `error`, `success`, `warning`, `info`, `focus`), `space` (`sm`, `md`, `lg`), `target`, `focus`, `radius`, `elevation`, `primitive`, `font` (`title`, `body`, `label`), `button` e `navbar`.
  - `themes: Record<"light" | "dark" | "cosmic", OrbityTheme>`: `light = createTheme("light")`, `dark = createTheme("dark")`, `cosmic = { ...createTheme("dark", true), componentOverrides: { cardSurface, checkboxMark, navbarBorder } }`.
  - `createTheme(mode, cosmic = false)`: fábrica interna (não exportada).

## Invariants

- Os valores devem permanecer sincronizados com `design-system/02-tokens.md` (comentário em `tokens.ts`); componentes não devem usar valores literais de cor, espaçamento, tipografia ou raio, e sim estes tokens.
- `space.sm`/`md`/`lg` derivam de `primitives["space-8"]`/`["space-16"]`/`["space-24"]`.
- Tokens de botão e navbar derivam dos tokens semânticos: `button.bg = color.action`, `button.label = color["on-action"]`, `button.focusColor = navbar.focusColor = color.focus`, `button.minHeight`/`minWidth` e `navbar.minHeight = sharedTokens.target.minSize`, `focusWidth`/`focusOffset` vêm de `sharedTokens.focus`.
- No modo cósmico, `color` usa `cosmicColors`; `navbar.bg = cosmicColors.sheet`, `navbar.itemActive = color["on-surface"]` e `navbar.itemInactive = cosmicColors.inactive`. Fora do modo cósmico, `navbar.bg = color.surface`, `itemActive = color.action` e `itemInactive = color["on-surface"]`.
- `color.error`, `success`, `warning` e `info` são iguais em todos os temas (primitivas `*-500`).
- Tipografia usa `fontFamily: "Roboto"` com `title` 24/32 peso 700, `body` 16/24 peso 400, `label` 14/20 peso 500 (`fontSize`/`lineHeight`).
- Apenas o tema `cosmic` define `componentOverrides`.

## Side Effects

- None (módulo de constantes puras; sem I/O nem estado mutável).

## Verification

- Run: `npm test`
