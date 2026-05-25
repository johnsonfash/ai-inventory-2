import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import { kv } from "./lib/storage/kv"
import { isTauriMobile, isTauriDesktop } from "./lib/platform"
import { startSyncWorker } from "./lib/pos/sync"
import "./index.css"

// On Tauri mobile (iOS / Android), the OS LaunchScreen / Splash
// Screen API owns the entire launch phase. The HTML splash inside
// the WebView would just duplicate it, so we strip it the moment
// JS starts running. The window itself is hidden (set in
// tauri.ios.conf.json + tauri.android.conf.json) and revealed
// from JS once React has rendered.
const MOBILE_NATIVE = isTauriMobile()
if (MOBILE_NATIVE) {
  document.getElementById("pallio-splash")?.remove()
}

// Native-only: copy any Preferences-only keys back into localStorage
// so the sync readers in src/lib/pos/storage.ts + team chat see the
// full set on first render. Fire-and-forget — the consumers tolerate
// an empty initial read (drafts simply look empty for ~1 frame), and
// hydration completes well before any user-driven write.
kv.hydrate()

// POS-5: start the offline-sync worker. Drains the sync_outbox when
// online + a backend is configured; a safe no-op otherwise.
startSyncWorker()

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

// Post-mount cleanup. Two distinct paths:
//
//   * Mobile native (iOS / Android Tauri):
//     The HTML splash was already stripped above. The window itself
//     is hidden — the OS LaunchScreen / Android Splash Screen is
//     covering the screen. As soon as React paints, show the window
//     so the user sees a fully-rendered app the moment the OS splash
//     dismisses. No double-pop.
//
//   * Desktop Tauri + web + PWA:
//     No OS-level splash to defer to. Play the HTML splash for at
//     least SPLASH_MIN_MS (the entrance animation needs ~1040ms to
//     finish), then fade it out.
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

async function showNativeWindow() {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window")
    await getCurrentWindow().show()
  } catch { /* dev / non-Tauri / window already visible — no-op */ }
}

requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    if (MOBILE_NATIVE) {
      // Reveal the WebView window — OS splash gets replaced by an
      // already-rendered app in one frame.
      showNativeWindow()
      return
    }
    // Desktop Tauri windows are visible from launch (with the dark
    // backgroundColor) so we still need to show() in case a future
    // config flips it. Cheap no-op when window is already visible.
    if (isTauriDesktop()) showNativeWindow()
    const elapsed = performance.now() - splashStart
    const wait = Math.max(0, SPLASH_MIN_MS - elapsed)
    setTimeout(dismissSplash, wait)
  }),
)
