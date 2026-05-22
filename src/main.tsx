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

// Dismiss the inline splash painted by index.html. We wait until both
// (a) React has rendered (two RAFs) and (b) the splash entrance
// animations have had time to play, whichever is later. The entrance
// runs ~1040ms; we add a tiny breathing room and call it 1200ms total.
// Faster cold-loads still get the full splash, slow loads dismiss the
// moment React is ready after the minimum.
const SPLASH_MIN_MS = 1200
const splashStart = performance.now()

function dismissSplash() {
  const el = document.getElementById("pallio-splash")
  if (!el) return
  el.classList.add("is-hiding")
  el.addEventListener("transitionend", () => el.remove(), { once: true })
  // Safety net in case the transition event never fires.
  setTimeout(() => el.remove(), 1000)
}
requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    const elapsed = performance.now() - splashStart
    const wait = Math.max(0, SPLASH_MIN_MS - elapsed)
    setTimeout(dismissSplash, wait)
  }),
)
