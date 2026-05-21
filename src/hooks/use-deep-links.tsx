import * as React from "react"
import { useNavigate } from "react-router-dom"
import { onOpenUrl, getCurrent } from "@tauri-apps/plugin-deep-link"
import { isNative } from "@/hooks/use-native"

// Routes a Pallio deep link to a React Router path.
// Supports two URL forms:
//   * https://pallio.app/<path>?<qs>   — universal links (iOS Associated
//     Domains + Android intent-filter with autoVerify=true)
//   * app.pallio://<path>?<qs> or pallio://<path>?<qs>
//                                       — custom scheme (app-icon shortcuts)
export function parseDeepLink(rawUrl: string): { to: string } | null {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }

  const isHttps = url.protocol === "https:" && url.hostname.toLowerCase() === "pallio.app"
  const isCustom = url.protocol === "app.pallio:" || url.protocol === "pallio:"
  if (!isHttps && !isCustom) return null

  let path = url.pathname || "/"
  if (isCustom && (path === "" || path === "/")) {
    if (url.hostname) path = "/" + url.hostname
  }
  if (!path.startsWith("/")) path = "/" + path
  const search = url.search || ""

  const firstSeg = path.split("/")[1] ?? ""
  if (firstSeg && !KNOWN_ROOTS.has(firstSeg)) return null

  return { to: path + search }
}

// Mount once inside the Router (uses useNavigate). Listens for the
// Tauri deep-link plugin events: `onOpenUrl` fires when the OS hands
// a new URL to a running app; `getCurrent()` returns any URL the app
// was launched WITH (cold launch from a shortcut / universal link).
export function useDeepLinks(): void {
  const navigate = useNavigate()
  const navRef = React.useRef(navigate)
  React.useEffect(() => { navRef.current = navigate }, [navigate])

  React.useEffect(() => {
    if (!isNative) return
    let unlisten: (() => void) | undefined

    // Live event — fires every time the app receives a new URL.
    onOpenUrl((urls) => {
      // Tauri delivers one or more URLs (multi-URL launch from some
      // platforms); take the first valid one.
      for (const u of urls) {
        const parsed = parseDeepLink(u)
        if (parsed) {
          navRef.current(parsed.to)
          break
        }
      }
    }).then((u) => { unlisten = u }).catch(() => {})

    // Cold-launch URL — process once on mount.
    getCurrent().then((urls) => {
      if (!urls || urls.length === 0) return
      for (const u of urls) {
        const parsed = parseDeepLink(u)
        if (parsed) {
          navRef.current(parsed.to)
          break
        }
      }
    }).catch(() => {})

    return () => unlisten?.()
  }, [])
}

// Known root segments — sanity guard so malformed URLs can't drop us
// somewhere unexpected. Keep in sync with src/routes.ts.
const KNOWN_ROOTS = new Set<string>([
  "",
  "pos",
  "inventory",
  "sales",
  "purchasing",
  "reporting",
  "accounting",
  "marketing",
  "settings",
  "ai",
  "appointments",
  "expenses",
  "notifications",
  "integrations",
])
