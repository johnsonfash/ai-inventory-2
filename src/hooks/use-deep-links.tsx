import * as React from "react"
import { useNavigate } from "react-router-dom"
import { App as CapApp } from "@capacitor/app"
import { isNative } from "@/hooks/use-native"

// Routes a Pallio deep link to a React Router path.
// Supports two URL forms:
//   * https://pallio.app/<path>?<qs>   — universal links (iOS Associated
//     Domains + Android intent-filter with autoVerify=true)
//   * app.pallio://<path>?<qs>          — custom scheme (used by app-icon
//     shortcuts in Wave 21.2)
//
// Returns the path + search string that should be passed to
// router.navigate. Returns null if the URL doesn't look like ours
// (e.g. universal link for a marketing page we don't have a route
// for, or someone pasted us a foreign deep link).
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

  // For both schemes, treat the path-after-host as the in-app path.
  // For the custom scheme `app.pallio://pos`, URL parses hostname=
  // "pos" and pathname="/" — handle by treating hostname as the first
  // segment when pathname is empty/"/".
  let path = url.pathname || "/"
  if (isCustom && (path === "" || path === "/")) {
    if (url.hostname) path = "/" + url.hostname
  }
  if (!path.startsWith("/")) path = "/" + path
  const search = url.search || ""

  // Soft allow-list: don't navigate into routes that don't exist. We
  // can't import the route table here without a circular dep, so just
  // sanity-check against a known set of root prefixes.
  const firstSeg = path.split("/")[1] ?? ""
  if (firstSeg && !KNOWN_ROOTS.has(firstSeg)) return null

  return { to: path + search }
}

// Mount once inside the Router (uses useNavigate). Listens for
// appUrlOpen (Capacitor fires it when the OS hands a deep link to
// the app — universal link, custom scheme, or app-icon shortcut
// converted to one). Also processes a launch URL set by AppDelegate
// when a shortcut launched a cold app.
export function useDeepLinks(): void {
  const navigate = useNavigate()
  const navRef = React.useRef(navigate)
  React.useEffect(() => { navRef.current = navigate }, [navigate])

  React.useEffect(() => {
    if (!isNative) return
    let cancelled = false
    let cleanup: (() => void) | null = null

    // 1) Live event — fired every time the app receives a new URL.
    CapApp.addListener("appUrlOpen", ({ url }) => {
      const parsed = parseDeepLink(url)
      if (parsed) navRef.current(parsed.to)
    }).then((sub) => {
      if (cancelled) sub.remove()
      else cleanup = () => sub.remove()
    }).catch(() => { /* ignore */ })

    // 2) Launch URL — if a deep link / shortcut launched a cold app,
    //    Capacitor stashes the URL here. We process it once on mount
    //    so cold-launch from a shortcut routes correctly.
    CapApp.getLaunchUrl().then((res) => {
      if (!res?.url) return
      const parsed = parseDeepLink(res.url)
      if (parsed) navRef.current(parsed.to)
    }).catch(() => { /* ignore */ })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])
}

// Known root segments — keep in sync with src/routes.ts. Used purely
// as a sanity guard so a malformed / hostile URL can't navigate us
// somewhere unexpected. A 404-able route is fine to pass through;
// what we want to block is `https://pallio.app/../../foo`-style
// path-traversal attempts and links targeting marketing-site paths.
const KNOWN_ROOTS = new Set<string>([
  "",            // /
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
