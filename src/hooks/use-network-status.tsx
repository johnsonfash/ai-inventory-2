import * as React from "react"
import { Network, type ConnectionStatus } from "@capacitor/network"
import { isNative } from "@/hooks/use-native"

// True when we have *some* path to the network (cell, Wi-Fi, ethernet,
// VPN). Doesn't guarantee the API is reachable — connectivity != reach
// — but it's what every native + web API will tell us, and it covers
// the common case (airplane mode, dead Wi-Fi).
export type NetworkSnapshot = {
  online: boolean
  /** Native only — "wifi" | "cellular" | "none" | "unknown". `null`
   *  on web because the Network Information API isn't supported in
   *  Safari and we don't want to ship a polyfill just for a hint. */
  connectionType: ConnectionStatus["connectionType"] | null
}

// Subscribes to network changes and returns the current snapshot.
// Mount this once near the top of the tree (App.tsx) — the listener
// fires on every status change so consumers don't need to poll.
//
// Native: uses `@capacitor/network` (which wraps NetworkInfo on iOS
//   and ConnectivityManager on Android). The plugin can also tell us
//   the connection type — used by NetworkBanner to say "back online
//   on Wi-Fi" vs the generic message.
//
// Web: uses `navigator.onLine` + window `online`/`offline` events.
//   That signal is famously imperfect — Chrome only flips it when the
//   adapter goes offline, not when the local network has no route to
//   the internet — but it's the only thing every browser ships and
//   the false negatives we'd care about (captive portal, dead AP)
//   are caught by the SW NetworkFirst handlers timing out anyway.
export function useNetworkStatus(): NetworkSnapshot {
  const [snapshot, setSnapshot] = React.useState<NetworkSnapshot>(() => ({
    online: typeof navigator === "undefined" ? true : navigator.onLine,
    connectionType: null,
  }))

  React.useEffect(() => {
    if (isNative) {
      let cleanup: (() => void) | null = null
      let cancelled = false

      Network.getStatus().then((s) => {
        if (!cancelled) setSnapshot({ online: s.connected, connectionType: s.connectionType })
      }).catch(() => { /* ignore */ })

      Network.addListener("networkStatusChange", (s) => {
        setSnapshot({ online: s.connected, connectionType: s.connectionType })
      }).then((sub) => {
        if (cancelled) sub.remove()
        else cleanup = () => sub.remove()
      }).catch(() => { /* ignore */ })

      return () => {
        cancelled = true
        cleanup?.()
      }
    }

    // Web fallback.
    const onChange = () => setSnapshot({ online: navigator.onLine, connectionType: null })
    window.addEventListener("online", onChange)
    window.addEventListener("offline", onChange)
    return () => {
      window.removeEventListener("online", onChange)
      window.removeEventListener("offline", onChange)
    }
  }, [])

  return snapshot
}
