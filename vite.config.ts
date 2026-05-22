import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { visualizer } from "rollup-plugin-visualizer"
import path from "path"
import fs from "fs"

// HTTPS in dev requires the two mkcert-generated PEMs. We also gate on
// VITE_NO_HTTPS so the Tauri shell (which bridges JS ↔ Rust over the
// `ipc://` scheme) can run against a plain-HTTP Vite — WKWebView blocks
// `ipc://` as mixed content when the parent page is HTTPS, which breaks
// every Tauri plugin call. See package.json's `dev:tauri` script.
const hasCertificates =
  process.env.VITE_NO_HTTPS !== "1" &&
  fs.existsSync("./localhost-key.pem") &&
  fs.existsSync("./localhost.pem")

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

      // autoUpdate: the new SW activates on next page load with no
      // user prompt. Pairs with src/sw.js's `skipWaiting` + `clients.
      // claim` so a deploy takes effect within one navigation. We
      // also have a chunk-load reload fallback in src/routes.ts for
      // the in-flight case where the running tab tries to fetch a
      // chunk hash that no longer exists on the new deploy.
      registerType: "autoUpdate",
      injectRegister: "auto",

      // The handwritten manifest at `public/manifest.json` is the single
      // source of truth — index.html references `/manifest.json` directly.
      // Disable the plugin's auto-generated `manifest.webmanifest` so the two
      // can't drift out of sync.
      manifest: false,

      // Off in dev. Without this the SW intercepts /@vite/client,
      // /src/*.tsx, /node_modules/.vite/deps/*, etc. and serves them
      // CacheFirst — kills HMR + produces stale source on every
      // reload until the user manually unregisters the worker. The
      // PWA is tested via `npm run preview` (built dist/) or inside
      // the Capacitor shell; dev should be free of SW churn.
      devOptions: {
        enabled: false,
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
    // Tauri requires a fixed port (it spawns the webview against the
    // URL in tauri.conf.json → build.devUrl). strictPort throws if the
    // port is busy instead of silently picking another one.
    strictPort: true,
    // HMR — explicit `localhost` so the Tauri webview's WebSocket
    // client can connect. Browsers can't dial `0.0.0.0` (it's a bind
    // address, not a destination), so leaving host undefined is wrong.
    hmr: {
      host: "localhost",
      protocol: process.env.VITE_NO_HTTPS === "1" ? "ws" : "wss",
    },
    watch: {
      // Don't trigger a Vite restart when Cargo rebuilds.
      ignored: ["**/src-tauri/**"],
    },
  },
  // Keep CLI output from the `tauri dev` watcher intact.
  clearScreen: false,
  publicDir: "public",
  define: {
    // Build-time constant baked into the service worker. The SW uses
    // this to namespace its runtime caches per deploy — old caches
    // get orphaned (and cleaned up by cleanupOutdatedCaches + the
    // activate handler) instead of accumulating stale chunk URLs.
    __PALLIO_BUILD_ID__: JSON.stringify(Date.now().toString(36)),
  },
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

          // Tauri runtime + plugins — only loaded inside the Tauri shell
          // (desktop, iOS, Android). On the web build these end up in
          // dead code that the isTauri() guards never call.
          if (id.includes("/@tauri-apps/") || id.includes("/tauri-plugin-")) return "tauri-vendor"

          // Core React + react-dom + scheduler + the JSX runtime go in
          // their own dedicated chunk. Every other vendor chunk depends
          // on this one, so the browser loads it first deterministically.
          //
          // Earlier we tried returning `undefined` here to keep React in
          // the main entry. Rollup interpreted that as "you decide" and
          // co-located React with query-vendor (the first vendor chunk
          // to import it). Other vendor chunks (lucide-react etc.) then
          // imported React via the query-vendor module — and on cold
          // load, evaluating an icon-using module before query-vendor
          // finished initialising raised `Cannot read properties of
          // undefined (reading 'forwardRef')`. Pinning React to its own
          // named chunk makes the dep graph explicit.
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/") ||
            id.includes("/react/jsx-runtime") ||
            id.includes("/react/jsx-dev-runtime")
          ) return "react-vendor"
          if (id.includes("/react-router") || id.includes("/@remix-run/router/")) return "react-vendor"

          // Everything else: one shared vendor chunk. Lumped so we don't
          // fragment too far.
          return "vendor"
        },
      },
    },
  },
})
