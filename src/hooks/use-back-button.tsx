import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { App as CapApp } from "@capacitor/app"
import { isNative } from "@/hooks/use-native"

// Android hardware back-button handler. Mount once inside the Router
// (so useNavigate is available). iOS doesn't fire this event; the
// listener attaches anyway and goes unused there. Web is a no-op.
//
// Behaviour:
//   * If the React Router history has a previous entry, go back one.
//   * If we're at a root route (/, /pos, /inventory, /sales,
//     /purchasing — same set the mobile bottom nav exposes), prompt
//     to exit. Tapping the back button twice within 2 s exits without
//     a prompt — the Android convention.
//   * Otherwise navigate to "/" (gives the user a way out of orphan
//     stacks where router history is somehow empty).
//
// NOTE: We deliberately don't use `canGoBack`/history-length checks
// from the bridge — they're inconsistent across WebView versions.
// React Router's own history is what users actually moved through.
export function useBackButton(): void {
  const navigate = useNavigate()
  const location = useLocation()
  const locationRef = React.useRef(location)
  React.useEffect(() => { locationRef.current = location }, [location])

  // "Press back again to exit" timestamp.
  const lastExitTryRef = React.useRef(0)

  React.useEffect(() => {
    if (!isNative) return
    let removed = false
    let cleanup: (() => void) | null = null

    CapApp.addListener("backButton", ({ canGoBack }) => {
      const path = locationRef.current.pathname
      const isRoot = ROOTS.has(path) || path === "/"

      if (!isRoot && canGoBack) {
        navigate(-1)
        return
      }

      // At a root route — confirm exit. Two-tap pattern: first tap
      // shows a transient toast-style hint; second tap within 2 s
      // exits the app. We rely on the browser's native confirm() on
      // web (unused, but cheap), and Android's exitApp() on native.
      const now = Date.now()
      if (now - lastExitTryRef.current < 2000) {
        CapApp.exitApp().catch(() => { /* ignore — exit not always allowed */ })
        return
      }
      lastExitTryRef.current = now

      // We don't have toast access at this layer (the Sonner Toaster
      // lives elsewhere in the tree). Fall back to a lightweight
      // window-level event consumers can listen to; the App component
      // wires it to sonner. See App.tsx for the listener.
      window.dispatchEvent(new CustomEvent("pallio:back-exit-hint"))
    }).then((sub) => {
      if (removed) sub.remove()
      else cleanup = () => sub.remove()
    }).catch(() => { /* ignore */ })

    return () => {
      removed = true
      cleanup?.()
    }
  }, [navigate])
}

// Routes the bottom nav surfaces — at these paths, hardware back
// should ask to exit instead of trying to pop history (which on
// Android typically lands on a deep-link from another app).
const ROOTS = new Set<string>([
  "/",            // public landing
  "/dashboard",   // app home (root inside the AppFrame)
  "/pos",
  "/inventory",
  "/sales",
  "/purchasing",
  "/reporting",
  "/settings",
])
