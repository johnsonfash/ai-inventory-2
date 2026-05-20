import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import path from "path"
import fs from "fs"

const hasCertificates =
  fs.existsSync("./localhost-key.pem") && fs.existsSync("./localhost.pem")

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // `injectManifest` so we control the SW source in src/sw.js. Workbox
      // precache list is generated at build time and injected via the
      // self.__WB_MANIFEST placeholder.
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",

      // Show a custom update toast when a new SW is waiting. The auto
      // injector would prompt with an alert(); we want our own UI.
      registerType: "prompt",
      injectRegister: null,

      // The handwritten manifest at `public/manifest.json` is the single
      // source of truth — index.html references `/manifest.json` directly.
      // Disable the plugin's auto-generated `manifest.webmanifest` so the two
      // can't drift out of sync.
      manifest: false,

      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },

      injectManifest: {
        // ~6 MiB lets charts-vendor + export-vendor precache. The runtime
        // cache below catches anything bigger or out-of-band.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webmanifest,json}"],
        swDest: "dist/sw.js",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    https: hasCertificates
      ? {
          key: fs.readFileSync("./localhost-key.pem"),
          cert: fs.readFileSync("./localhost.pem"),
        }
      : undefined,
    allowedHosts: ["all"],
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Service-Worker-Allowed": "/",
    },
  },
  publicDir: "public",
  build: {
    sourcemap: true,
    outDir: "dist",
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        // Function-based manualChunks (sleekr pattern). More flexible than
        // the object form — handles arbitrary nested deps and any vendor
        // path Rollup throws at it. The rule: split anything heavy + lazy;
        // keep React + router in the eager bundle.
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined

          // Heavy + lazy: only loaded by /reporting + Dashboard charts.
          if (id.includes("recharts")) return "charts-vendor"

          // PDF + image export: Reports PDF + invoice print only.
          if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("/dompurify/")) return "export-vendor"

          // Animation runtime touches every route (page transitions),
          // but it's chunky enough to be worth a dedicated cache slot.
          if (id.includes("framer-motion")) return "motion-vendor"

          // Used by data-heavy pages (analytics, AI panel).
          if (id.includes("@tanstack/react-query")) return "query-vendor"

          // Capacitor runtime — only loaded inside the native shell.
          if (id.includes("@capacitor")) return "capacitor-vendor"

          // Core React stays in the main bundle — small + on every page.
          // Splitting it can trigger cross-chunk init cycles on iOS Safari
          // (see sleekr's vite.config notes — same WKWebView lives inside
          // our Capacitor build).
          if (id.includes("react/") || id.includes("react-dom/") || id.includes("react-router")) {
            return undefined
          }

          // Everything else: one shared vendor chunk. Lumped so we don't
          // fragment too far.
          return "vendor"
        },
      },
    },
  },
})
