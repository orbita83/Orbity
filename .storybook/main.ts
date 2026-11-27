import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-native-web-vite";

const config: StorybookConfig = {
  stories: ["../src/view/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-native-web-vite",
  core: { disableTelemetry: true },
  // CanvasKit (WebAssembly do Skia) para o planeta procedural nas histórias (#221).
  staticDirs: [{ from: "../node_modules/canvaskit-wasm/bin/full", to: "/" }],
  // As ViewModels usam o Expo Router; nas histórias isoladas não há navegador montado.
  viteFinal: (viteConfig) => {
    const alias = { find: /^expo-router$/, replacement: fileURLToPath(new URL("./mocks/expo-router.ts", import.meta.url)) };
    const current = viteConfig.resolve?.alias;
    const aliases = Array.isArray(current)
      ? [alias, ...current]
      : [alias, ...Object.entries(current ?? {}).map(([find, replacement]) => ({ find, replacement }))];
    // O Skia web importa o AssetRegistry do React Native, que não existe no react-native-web.
    // A dependência é pré-empacotada pelo esbuild, que não usa o alias do Vite: o desvio fica aqui.
    const assetRegistry = fileURLToPath(new URL("./mocks/asset-registry.ts", import.meta.url));
    const esbuildOptions = viteConfig.optimizeDeps?.esbuildOptions ?? {};
    const skiaAssetRegistry = {
      name: "orbity-skia-asset-registry",
      setup(build: { onResolve: (o: { filter: RegExp }, cb: () => { path: string }) => void }) {
        build.onResolve({ filter: /^react-native\/Libraries\/Image\/AssetRegistry$/ }, () => ({ path: assetRegistry }));
      },
    };
    return {
      ...viteConfig,
      resolve: { ...viteConfig.resolve, alias: aliases },
      optimizeDeps: {
        ...viteConfig.optimizeDeps,
        esbuildOptions: { ...esbuildOptions, plugins: [skiaAssetRegistry, ...(esbuildOptions.plugins ?? [])] },
      },
    };
  },
};

export default config;
