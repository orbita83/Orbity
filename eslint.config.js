// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "storybook-static/**"],
  },
  {
    // ADR-0001: só o executor do Expo importa o driver SQLite; testes usam tests/fixtures.
    files: ["src/**"],
    ignores: ["src/infra/database/expoSqlExecutor.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [
          { name: "expo-sqlite", message: "Use ISqlExecutor; só src/infra/database/expoSqlExecutor.ts importa o expo-sqlite." },
          { name: "better-sqlite3", message: "O better-sqlite3 é só para testes (tests/fixtures)." },
        ],
      }],
    },
  },
]);
