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

      // Use the existing handwritten /public/manifest.json as the single
      // source of truth — disable the auto-generated webmanifest so they
      // can't drift.
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
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // Every page imports react + router — pin them in one cache-friendly chunk.
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Used by data-heavy pages (analytics, AI panel). Separate so it
          // doesn't pad the cold-start chunk.
          "query-vendor": ["@tanstack/react-query"],
          // Recharts is huge — only Reports + Dashboard widgets use it.
          "charts-vendor": ["recharts"],
          // PDF / image-export libs only used by the Reports printer + invoice print.
          "export-vendor": ["html2canvas", "jspdf"],
        },
      },
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
})
