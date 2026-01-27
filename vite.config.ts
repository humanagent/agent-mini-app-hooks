import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icon.svg"],
      manifest: {
        name: "Agent Mini App Hooks",
        short_name: "Agent Mini App Hooks",
        description:
          "Group Chat Agent Mini App Examples - Demo app for XMTP group chat agents",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  optimizeDeps: {
    exclude: ["@xmtp/wasm-bindings", "@xmtp/browser-sdk"],
    include: ["@xmtp/proto"],
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
    cssMinify: "lightningcss",
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === "EVAL" ||
          warning.code === "SOURCEMAP_BROKEN" ||
          warning.message.includes("eval") ||
          warning.message.includes("__PURE__") ||
          warning.message.includes("chunk size")
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: ["amazed-hedgehog-actual.ngrok-free.app"],
    watch: {
      usePolling: false,
    },
    hmr: false,
  },
  logLevel: "info",
  onLog(level, log, _options) {
    if (
      level === "warn" &&
      (log.includes("workers/client") ||
        log.includes("optimize deps directory") ||
        log.includes("dep optimizer") ||
        log.includes("The file does not exist"))
    ) {
      return;
    }
  },
});
