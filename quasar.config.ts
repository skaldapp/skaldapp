import { viteStaticCopy } from "vite-plugin-static-copy";

import { defineConfig } from "#q-app";

const appId = "skald",
  base = "./",
  boot = ["main", "route", "i18n", "monaco"],
  bundler = "builder",
  channels = ["stable"],
  css = [
    "~@fontsource/space-mono",
    "~@fontsource/noto-sans",
    "~@fontsource/noto-serif",
    "app.scss",
    "~@milkdown/crepe/theme/common/style.css",
  ],
  dark = "auto",
  darkModeSupport = true,
  define = {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  dest = "runtime",
  open = false,
  devServer = { open },
  lintCommand = "eslint -c ./eslint.config.ts src src-electron",
  useFlatConfig = true,
  eslint = { lintCommand, useFlatConfig },
  identity = "-",
  mac = { darkModeSupport, identity },
  preloadScripts = ["electron-preload"],
  releaseNotesFile = "release-notes.md",
  releaseInfo = { releaseNotesFile },
  releaseType = "release",
  stripBase = 4,
  rename = { stripBase },
  server = false,
  src = "./node_modules/@skaldapp/runtime/dist",
  strict = true,
  targets = [{ dest, rename, src }],
  vueShim = true,
  typescript = { strict, vueShim },
  vueTsc = true;

const extendViteConf = () => ({
  base,
  define,
  plugins: [viteStaticCopy({ targets })],
});

export default defineConfig((ctx) => ({
  animations: ["zoomIn", "zoomOut"],
  boot,
  build: {
    extendViteConf,
    typescript,
    vitePlugins: [
      [
        "@intlify/unplugin-vue-i18n/vite",
        { include: [ctx.appPaths.resolve.app("src/i18n")] },
      ],
      ["vite-plugin-checker", { eslint, vueTsc }, { server }],
    ],
  },
  css,
  devServer,
  electron: {
    builder: {
      appId,
      mac,
      publish: [{ provider: "github", releaseType }],
      releaseInfo,
      snap: { publish: [{ channels, provider: "snapStore" }] },
    },
    bundler,
    preloadScripts,
  },
  extras: ["roboto-font", "material-icons"],
  framework: {
    config: { dark },
    plugins: ["Dialog", "Notify"],
  },
}));
