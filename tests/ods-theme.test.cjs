const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync('src/view/theme/tokens.ts', 'utf8');
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleExports = {};
vm.runInNewContext(javascript, { exports: moduleExports });
const { themes } = moduleExports;

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
