// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const sqliteExecutor = "src/infra/database/expoSqlExecutor.ts";
const notificationService = "src/infra/services/expoNotificationService.ts";
const testDriver = {
  group: ["node:sqlite"],
  message: "O node:sqlite só roda no Node e é só para testes (tests/fixtures).",
};
const sqlitePattern = {
  group: ["expo-sqlite", "expo-sqlite/**"],
  message: `Use ISqlExecutor. Só ${sqliteExecutor} importa o expo-sqlite.`,
};
const notificationPattern = {
  group: ["expo-notifications", "expo-notifications/**"],
  message: `Use INotificationService. Só ${notificationService} importa o expo-notifications.`,
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "storybook-static/**"],
  },
  {
    // ADR-0001 e ADR-0002: drivers nativos ficam restritos aos seus adaptadores na infraestrutura.
    files: ["src/**"],
    ignores: [sqliteExecutor, notificationService],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          sqlitePattern,
          notificationPattern,
          testDriver,
        ],
      }],
    },
  },
  {
    files: [sqliteExecutor],
    rules: {
      "no-restricted-imports": ["error", { patterns: [notificationPattern, testDriver] }],
    },
  },
  {
    files: [notificationService],
    rules: {
      "no-restricted-imports": ["error", { patterns: [sqlitePattern, testDriver] }],
    },
  },
]);
