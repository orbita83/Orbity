import { mkdirSync, readFileSync, copyFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..");
// Somente a fonte de tokens versionada é avaliada, sem imports de runtime.
const source = readFileSync(resolve(root, "src/view/theme/tokens.ts"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const exports = {};
runInNewContext(compiled.outputText, { exports });
const theme = exports.themes.cosmic;
const rem = (value) => `${value / theme.font.body.fontSize}rem`;
const tokens = {
  surface: theme.color.surface,
  "on-surface": theme.color["on-surface"],
  "space-sm": rem(theme.space.sm),
  "space-md": rem(theme.space.md),
  "space-lg": rem(theme.space.lg),
  "font-family": theme.font.body.fontFamily,
  "body-size": rem(theme.font.body.fontSize),
  "body-line-height": String(theme.font.body.lineHeight / theme.font.body.fontSize),
  "title-size": rem(theme.font.title.fontSize),
  "title-line-height": String(theme.font.title.lineHeight / theme.font.title.fontSize),
  "title-weight": theme.font.title.fontWeight,
  "focus-color": theme.color.focus,
  "focus-width": rem(theme.focus.ringWidth),
  "focus-offset": rem(theme.focus.ringOffset),
};
const output = resolve(root, ".dev/privacy-site");
mkdirSync(resolve(output, "privacidade"), { recursive: true });
copyFileSync(resolve(root, "site/privacidade/index.html"), resolve(output, "privacidade/index.html"));
copyFileSync(resolve(root, "site/privacy.css"), resolve(output, "privacy.css"));
writeFileSync(resolve(output, "tokens.css"), `/* Gerado do ODS; não editar. */\n:root {\n${Object.entries(tokens).map(([key, value]) => `  --${key}: ${value};`).join("\n")}\n}\n`);
writeFileSync(resolve(output, ".nojekyll"), "");
writeFileSync(resolve(output, "index.html"), '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Orbity</title><a href="privacidade/">Política de privacidade do Orbity</a></html>\n');
console.log("Página preparada em .dev/privacy-site/privacidade/index.html");
