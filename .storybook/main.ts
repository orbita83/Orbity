import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-native-web-vite";

const config: StorybookConfig = {
  stories: ["../src/view/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-native-web-vite",
  core: { disableTelemetry: true },
  // As ViewModels usam o Expo Router; nas histórias isoladas não há navegador montado.
  viteFinal: (viteConfig) => {
    const alias = { find: /^expo-router$/, replacement: fileURLToPath(new URL("./mocks/expo-router.ts", import.meta.url)) };
    const current = viteConfig.resolve?.alias;
    const aliases = Array.isArray(current)
      ? [alias, ...current]
      : [alias, ...Object.entries(current ?? {}).map(([find, replacement]) => ({ find, replacement }))];
    return { ...viteConfig, resolve: { ...viteConfig.resolve, alias: aliases } };
  },
};

export default config;
