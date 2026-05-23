import * as React from "react"

// True when we have *some* path to the network (cell, Wi-Fi, ethernet,
// VPN). Doesn't guarantee the API is reachable — connectivity != reach —
// but it covers the common case (airplane mode, dead Wi-Fi).
export type NetworkSnapshot = {
  online: boolean
  /** Reserved — when Tauri lands a connection-type API we'll fill
   *  this on native. For now `null` everywhere. */
  connectionType: string | null
}

// `navigator.onLine` is famously unreliable: WebKit (Safari / Tauri
// WKWebView) can report `false` after sleep/wake or DNS hiccups even
// when the machine has a working connection. Treat it as a *hint*,
// never as ground truth. Before flipping the banner to offline, we
// confirm with a real same-origin probe; while we think we're
// offline, we re-probe periodically so a recovered connection clears
// the banner without waiting for the browser event to fire again.
//
// Probe shape: HEAD `/favicon.svg` — same-origin (no CORS), 0-byte
// body (HEAD never returns a body), reuses the page's existing
// HTTP/2 connection so there is no fresh DNS / TCP / TLS handshake.
// Effective wire cost is one ~300-byte header round-trip. Cache-bust
// query string + `cache: "no-store"` keep the service worker and
// HTTP cache out of the way so the probe actually touches the
// network. On Vercel today this lands at ~80–140 ms from Lagos;
// dropping behind Cloudflare later collapses it to ~15 ms via the
// Lagos POP without changing any client code.
const PROBE_URL = "/favicon.svg"
const PROBE_TIMEOUT_MS = 3000
const REPROBE_WHILE_OFFLINE_MS = 30_000

async function probeReachable(): Promise<boolean> {
  if (typeof fetch === "undefined") return true
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), PROBE_TIMEOUT_MS)
  try {
    // `__probe=1` is the contract with `src/sw.js` — the SW
    // short-circuits this URL straight to the network so the cached
    // favicon doesn't make an offline probe falsely succeed. The
    // cache-bust `_=…` keeps the browser HTTP cache out of the way.
    const res = await fetch(`${PROBE_URL}?__probe=1&_=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
      signal: ctl.signal,
    })
    return res.ok || res.type === "opaque"
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

// Subscribes to network changes and returns the current snapshot.
// Mount once near the top of the tree (App.tsx).
//
// Flow:
//   * Browser flips to `online` → trust it, show online immediately.
//   * Browser flips to `offline` → run a probe; only flip the UI if
//     the probe also fails. This is what kills the WebKit
//     false-positive that triggered the banner today.
//   * While we think we're offline, re-probe every 30s — a recovered
//     network clears the banner even if no `online` event fires.
//
// Tauri's `@tauri-apps/plugin-os` exposes platform / OS info but
// doesn't (currently) include a network status helper. If we ever
// need richer info (connection type, metered status), the path is
// a small custom Tauri command wrapping Reachability on iOS +
// ConnectivityManager on Android.
export function useNetworkStatus(): NetworkSnapshot {
  const [snapshot, setSnapshot] = React.useState<NetworkSnapshot>(() => ({
    online: typeof navigator === "undefined" ? true : navigator.onLine,
    connectionType: null,
  }))

  React.useEffect(() => {
    let cancelled = false
    let reprobeTimer: ReturnType<typeof setInterval> | null = null

    const setOnline = (online: boolean) => {
      if (cancelled) return
      setSnapshot((prev) => (prev.online === online ? prev : { online, connectionType: null }))
    }

    const startReprobe = () => {
      if (reprobeTimer) return
      reprobeTimer = setInterval(async () => {
        const reachable = await probeReachable()
        if (reachable) {
          setOnline(true)
          stopReprobe()
        }
      }, REPROBE_WHILE_OFFLINE_MS)
    }

    const stopReprobe = () => {
      if (reprobeTimer) {
        clearInterval(reprobeTimer)
        reprobeTimer = null
      }
    }

    const handleOnline = () => {
      setOnline(true)
      stopReprobe()
    }

    const handleOffline = async () => {
      // Browser claims offline — verify before flipping the UI.
      const reachable = await probeReachable()
      if (reachable) return // false positive, ignore
      setOnline(false)
      startReprobe()
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // If we mounted while the browser already claims offline, run an
    // immediate verification so we don't flash the banner on load
    // when the page actually loaded fine.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      void handleOffline()
    }

    return () => {
      cancelled = true
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      stopReprobe()
    }
  }, [])

  return snapshot
}
