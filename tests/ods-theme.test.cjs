const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync('src/view/theme/tokens.ts', 'utf8');
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleExports = {};
vm.runInNewContext(javascript, { exports: moduleExports });
const { themes, cosmicColors } = moduleExports;

assert.equal(themes.light.color.surface, '#FFFFFF');
assert.equal(themes.dark.color.surface, '#1B1B1F');
assert.equal(themes.cosmic.color.surface, '#030417');
assert.equal(themes.cosmic.color['surface-variant'], '#141332');
assert.equal(themes.cosmic.button.bg, themes.cosmic.color.action);
assert.equal(themes.cosmic.button.label, themes.cosmic.color['on-action']);
assert.equal(themes.cosmic.navbar.focusColor, themes.cosmic.color.focus);

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
  [themes.cosmic.color.action, themes.cosmic.color.surface, 3],
  [themes.cosmic.color.action, themes.cosmic.color['surface-variant'], 3],
  [themes.cosmic.navbar.itemActive, themes.cosmic.navbar.indicatorBg, 4.5],
  [themes.cosmic.navbar.itemInactive, themes.cosmic.navbar.bg, 4.5],
  [themes.cosmic.color.focus, themes.cosmic.color['surface-variant'], 3],
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
