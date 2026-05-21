import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { listen } from "@tauri-apps/api/event"
import { isNative } from "@/hooks/use-native"

// Android hardware back-button handler. Mount once inside the Router.
// iOS doesn't fire this event; the listener attaches anyway and goes
// unused there. Desktop + web are no-ops.
//
// Tauri 2 mobile bridges Android back via the
// `tauri://back-button-pressed` event. We override default close-app
// behaviour by checking the current route: root routes prompt
// double-tap-to-exit (Android convention), every other route pops
// React Router history.

const ROOT_ROUTES = new Set<string>([
  "/", "/dashboard", "/pos", "/inventory", "/sales", "/purchasing",
])

export function useBackButton(): void {
  const navigate = useNavigate()
  const location = useLocation()
  const lastTap = React.useRef<number>(0)

  React.useEffect(() => {
    if (!isNative) return
    let unlisten: (() => void) | undefined

    listen<void>("tauri://back-button-pressed", () => {
      const path = location.pathname
      if (ROOT_ROUTES.has(path)) {
        const now = Date.now()
        if (now - lastTap.current < 2000) {
          // Second tap within 2s → exit. Use process plugin to quit
          // cleanly.
          import("@tauri-apps/plugin-process").then((m) => m.exit(0)).catch(() => {})
          return
        }
        lastTap.current = now
        return
      }
      navigate(-1)
    }).then((u) => { unlisten = u }).catch(() => {})

    return () => unlisten?.()
  }, [navigate, location.pathname])
}
