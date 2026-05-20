import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { visualizer } from "rollup-plugin-visualizer"
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
    // Build-time bundle visualizer. Writes dist/stats.html with an
    // interactive treemap of every chunk + the modules inside it.
    // Opt-in via ANALYZE=1 so the default `npm run build` stays clean.
    // We don't auto-open — run `open dist/stats.html` yourself when
    // you want to inspect.
    process.env.ANALYZE === "1" &&
      visualizer({
        filename: "dist/stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
  ].filter(Boolean),
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
        // path Rollup throws at it. The rule: split anything heavy + lazy
        // and keep its transitive deps with it; keep React + router in
        // the eager bundle.
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined

          // Charts cluster (only loaded by /reporting + Dashboard widgets).
          // Recharts pulls in the whole d3 family + lodash + react-smooth +
          // victory-vendor + fast-equals. Co-locate them so the eager
          // bundle isn't paying for 200 KB of d3 it never uses.
          if (
            id.includes("/recharts/") ||
            id.includes("/recharts-scale/") ||
            id.includes("/d3-") ||
            id.includes("/victory-vendor/") ||
            id.includes("/react-smooth/") ||
            id.includes("/fast-equals/") ||
            id.includes("/lodash/") ||
            id.includes("/lodash-es/") ||
            id.includes("/internmap/") ||
            id.includes("/decimal.js-light/") ||
            id.includes("/fast-png/") ||
            id.includes("/iobuffer/")
          ) return "charts-vendor"

          // PDF + image export: only loaded when the user clicks Export PDF.
          // jspdf pulls dompurify + fflate; html2canvas brings its own
          // canvas helpers + the css-line-break dep.
          if (
            id.includes("/jspdf/") ||
            id.includes("/html2canvas/") ||
            id.includes("/dompurify/") ||
            id.includes("/fflate/") ||
            id.includes("/css-line-break/") ||
            id.includes("/text-segmentation/") ||
            id.includes("/utrie/") ||
            id.includes("/base64-arraybuffer/") ||
            id.includes("/canvg/") ||
            id.includes("/core-js/")
          ) return "export-vendor"

          // Animation runtime touches every route (page transitions),
          // but it's chunky enough to be worth a dedicated cache slot.
          // framer-motion sub-packages itself into motion-dom + motion-utils.
          if (
            id.includes("/framer-motion/") ||
            id.includes("/motion-dom/") ||
            id.includes("/motion-utils/")
          ) return "motion-vendor"

          // React Query — query-core is the internal engine, react-query is
          // the binding layer. Keep them together.
          if (
            id.includes("/@tanstack/react-query/") ||
            id.includes("/@tanstack/query-core/")
          ) return "query-vendor"

          // Capacitor runtime — only loaded inside the native shell.
          if (id.includes("/@capacitor/")) return "capacitor-vendor"

          // Core React stays in the main bundle — small + on every page.
          // Splitting it can trigger cross-chunk init cycles on iOS Safari
          // (see sleekr's vite.config notes — same WKWebView lives inside
          // our Capacitor build).
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/react-router")) {
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
