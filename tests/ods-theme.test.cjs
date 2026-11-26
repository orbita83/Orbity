const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync('src/view/theme/tokens.ts', 'utf8');
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleExports = {};
vm.runInNewContext(javascript, { exports: moduleExports });
const { themes, cosmicColors, planetColors } = moduleExports;

assert.equal(themes.light.color.surface, '#FFFFFF');
assert.equal(themes.dark.color.surface, '#1B1B1F');
assert.equal(themes.cosmic.color.surface, '#030417');
assert.equal(themes.cosmic.color['surface-variant'], '#141332');
assert.equal(themes.cosmic.button.bg, themes.cosmic.color.action);
assert.equal(themes.cosmic.button.label, themes.cosmic.color['on-action']);
assert.equal(themes.cosmic.navbar.focusColor, themes.cosmic.color.focus);

// Versão 1.2: borda sutil na navbar, correção do texto secundário claro e novos tokens.
assert.equal(themes.light.color['on-surface-variant'], '#5F6673');
assert.equal(themes.cosmic.color['border-subtle'], 'rgba(250, 249, 255, 0.06)');
assert.equal(themes.cosmic.color['border-control'], '#7A70B8');
assert.equal(themes.cosmic.componentOverrides.navbarBorder, themes.cosmic.color['border-subtle']);
assert.equal(themes.cosmic.navbar.indicatorRadius, 16);
assert.equal(themes.cosmic.sheet.radius, 24);
assert.equal(themes.cosmic.radius.xl, 28);
assert.equal(themes.cosmic.progress.height, 20);
assert.equal(themes.cosmic.achievement.size, 60);
assert.equal(themes.cosmic.font.streak.fontSize, 64);
assert.equal(themes.cosmic.motion.scalePressed, 0.96);
assert.equal(themes.cosmic.motion.opacityPressed, 0.8);

// Tela Inicial (Etapa 0.2a): grade de 8 pontos e tokens novos.
assert.equal(themes.cosmic.sheet.handleHeight, 4);
assert.equal(themes.cosmic.size.headerHeight, 64);
assert.equal(themes.cosmic.size.iconLg, 32);
assert.equal(themes.cosmic.size.dialogIcon, 96);
assert.equal(themes.cosmic.button.opacityDisabled, 0.6);
assert.equal(themes.cosmic.border.widthThin, 1);
assert.equal(themes.cosmic.button.bgDisabled, '#232052');
assert.equal(themes.cosmic.button.labelDisabled, '#BBB6E3');
assert.equal(themes.light.button.bgDisabled, themes.light.button.bg);
assert.deepEqual([themes.cosmic.font.brand.fontSize, themes.cosmic.font.brand.lineHeight], [28, 36]);
assert.deepEqual([themes.cosmic.font.caption.fontSize, themes.cosmic.font.caption.lineHeight], [12, 16]);
assert.deepEqual(
  [themes.cosmic.font['card-title'].fontSize, themes.cosmic.font['card-title'].lineHeight, themes.cosmic.font['card-title'].fontWeight],
  [16, 24, '600'],
);
assert.deepEqual(
  [themes.cosmic.font['body-sm'].fontSize, themes.cosmic.font['body-sm'].lineHeight, themes.cosmic.font['body-sm'].fontWeight],
  [14, 20, '400'],
);
assert.equal(planetColors.relief, '#5320B2');
for (const value of [themes.cosmic.size.headerHeight, themes.cosmic.size.iconLg, themes.cosmic.sheet.handleHeight, themes.cosmic.sheet.handleWidth, themes.cosmic.progress.height, themes.cosmic.achievement.size]) {
  assert.equal(value % 4, 0, `fora da grade de 4: ${value}`);
}

function luminance(hex) {
  const channels = hex.match(/[\da-f]{2}/gi).map((channel) => parseInt(channel, 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
for (const [foreground, background, minimum] of [
  [themes.cosmic.color['on-surface'], themes.cosmic.color.surface, 4.5],
  [themes.cosmic.color['on-surface-variant'], themes.cosmic.color['surface-variant'], 4.5],
  [themes.cosmic.color['on-action'], themes.cosmic.color.action, 4.5],
  [themes.cosmic.button.labelDisabled, themes.cosmic.button.bgDisabled, 4.5],
  [themes.cosmic.color.action, themes.cosmic.color.surface, 3],
  [themes.cosmic.color.action, themes.cosmic.color['surface-variant'], 3],
  [themes.cosmic.navbar.itemActive, themes.cosmic.navbar.indicatorBg, 4.5],
  [themes.cosmic.navbar.itemInactive, themes.cosmic.navbar.bg, 4.5],
  [themes.cosmic.color.focus, themes.cosmic.color['surface-variant'], 3],
  [themes.light.color['on-surface-variant'], themes.light.color.surface, 4.5],
  [themes.light.color['on-surface-variant'], themes.light.color['surface-variant'], 4.5],
  // Tag de categoria (issue #25): texto e ícone em on-surface sobre action-subtle, nos três temas.
  ...['cosmic', 'dark', 'light'].map((name) => [themes[name].color['on-surface'], themes[name].color['action-subtle'], 4.5]),
  // Tela Inicial: ícones e chama são indicadores gráficos (3:1) sobre o fundo, o painel e o card.
  ...[cosmicColors.iconAccent, cosmicColors.streakFlame, cosmicColors.achievementPendingIcon].flatMap((color) => [
    [color, cosmicColors.background, 3],
    [color, cosmicColors.sheet, 3],
    [color, cosmicColors.card, 3],
  ]),
  // Issue #262 (WCAG 1.4.11): contorno de controle ≥ 3:1 contra o campo e a superfície, nos três temas.
  ...['cosmic', 'dark', 'light'].flatMap((name) => [
    [themes[name].color['border-control'], themes[name].color['surface-variant'], 3],
    [themes[name].color['border-control'], themes[name].color.surface, 3],
  ]),
  [themes.cosmic.color['border-control'], themes.cosmic.navbar.bg, 3],
  // Contorno da conquista bloqueada sobre o card e o painel.
  [cosmicColors.achievementPendingBorder, cosmicColors.card, 3],
  [cosmicColors.achievementPendingBorder, cosmicColors.sheet, 3],
  // Cores semânticas como ícone ou contorno (3:1) sobre a superfície, em todos os temas.
  ...['cosmic', 'dark', 'light'].flatMap((name) =>
    ['success', 'warning', 'info', 'error'].map((role) => [themes[name].color[role], themes[name].color.surface, 3]),
  ),
]) assert.ok(contrast(foreground, background) >= minimum, `${foreground} / ${background}`);
console.log('Contratos de tema e contrastes: OK');

// Modelo de referência: interpolação linear em sRGB, sem transparência.
function channels(hex) {
  return hex.match(/[\da-f]{2}/gi).map((channel) => parseInt(channel, 16));
}
function toHex(rgb) {
  return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}
function mix(start, end, fraction) {
  const a = channels(start);
  const b = channels(end);
  return toHex(a.map((value, index) => value + (b[index] - value) * fraction));
}
for (const [start, end, other, minimum, label] of [
  [cosmicColors.action, cosmicColors.actionEnd, cosmicColors.text, 4.5, 'ação'],
  [cosmicColors.progress, cosmicColors.progressEnd, cosmicColors.track, 3, 'progresso'],
]) {
  let lowest = Infinity;
  for (let step = 0; step <= 10000; step += 1) {
    lowest = Math.min(lowest, contrast(mix(start, end, step / 10000), other));
  }
  assert.ok(lowest >= minimum, `Gradiente ${label}: ${lowest}`);
  console.log(`Gradiente ${label}, mínimo amostrado: ${lowest.toFixed(4)}:1`);
}

// Chips aplicam opacidade ao conjunto (texto e fundo) sobre a superfície.
const chipBackgroundPressed = mix(themes.cosmic.color.surface, themes.cosmic.color.action, 0.85);
const chipTextPressed = mix(themes.cosmic.color.surface, themes.cosmic.color['on-action'], 0.85);
const pressedContrast = contrast(chipTextPressed, chipBackgroundPressed);
console.log(`Chip selecionado pressionado, modelo sRGB: ${pressedContrast.toFixed(4)}:1`);
assert.ok(pressedContrast >= 4.5, 'Texto do chip pressionado abaixo de 4,5:1');

// Perfil: texto e foco não recebem opacidade no estado pressionado.
for (const [name, theme] of Object.entries(themes)) {
  assert.equal(theme.divider.width, 1);
  assert.equal(theme.feedback.pressedOpacity, 0.8);
  for (const [foreground, background] of [
    [theme.color['on-action'], theme.color.action],
    [theme.color['on-surface'], theme.color['surface-variant']],
  ]) {
    assert.ok(contrast(foreground, background) >= 4.5, `Texto do perfil em ${name}`);
  }
  assert.ok(contrast(theme.color.focus, theme.color['surface-variant']) >= 3, `Foco do perfil em ${name}`);
}
console.log('Métricas, atalhos e foco do perfil nos três temas: OK');
