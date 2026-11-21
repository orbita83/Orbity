// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const sqliteExecutor = "src/infra/database/expoSqlExecutor.ts";
const testDriver = {
  group: ["better-sqlite3", "better-sqlite3/**"],
  message: "O better-sqlite3 é só para testes (tests/fixtures).",
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "storybook-static/**"],
  },
  {
    // ADR-0001: só o executor do Expo importa o driver SQLite; testes usam tests/fixtures.
    files: ["src/**"],
    ignores: [sqliteExecutor],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          { group: ["expo-sqlite", "expo-sqlite/**"], message: `Use ISqlExecutor. Só ${sqliteExecutor} importa o expo-sqlite.` },
          testDriver,
        ],
      }],
    },
  },
  {
    files: [sqliteExecutor],
    rules: {
      "no-restricted-imports": ["error", { patterns: [testDriver] }],
    },
  },
]);
