import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import fs from "fs"

const hasCertificates =
  fs.existsSync("./localhost-key.pem") && fs.existsSync("./localhost.pem")

export default defineConfig({
  plugins: [react()],
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
    },
  },
  publicDir: "public",
})
