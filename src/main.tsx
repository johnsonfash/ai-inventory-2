import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import { kv } from "./lib/storage/kv"
import "./index.css"

// Native-only: copy any Preferences-only keys back into localStorage
// so the sync readers in src/lib/pos/storage.ts + team chat see the
// full set on first render. Fire-and-forget — the consumers tolerate
// an empty initial read (drafts simply look empty for ~1 frame), and
// hydration completes well before any user-driven write.
kv.hydrate()

// Dev-mode cleanup: vite-plugin-pwa used to be enabled in dev (Wave
// 15 default), which left a Workbox SW behind that CacheFirst'd
// /@vite/client + /src/* — kills HMR on the next reload. Now that
// devOptions.enabled is false, any registered worker is stale.
// Unregister it once on dev mount so users coming from old sessions
// don't have to manually clear site data. Production builds keep
// the active SW (vite-plugin-pwa registers via virtual:pwa-register).
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister().catch(() => { /* ignore */ }))
  }).catch(() => { /* ignore */ })
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
