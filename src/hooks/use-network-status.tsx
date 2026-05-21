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

// Subscribes to network changes and returns the current snapshot.
// Mount once near the top of the tree (App.tsx).
//
// All platforms (Tauri desktop + mobile + web) use `navigator.onLine`
// plus the window `online` / `offline` events. The browser webview
// signal is famously imperfect — Chrome only flips it when the
// adapter goes offline, not when the local network has no route to
// the internet — but it's the only thing every webview ships and the
// false negatives we'd care about (captive portal, dead AP) are
// caught by the SW NetworkFirst handlers timing out anyway.
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
