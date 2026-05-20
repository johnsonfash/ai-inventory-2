import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, WifiOff } from "lucide-react"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { cn } from "@/lib/utils"

// Three-state banner at the top of the viewport:
//   * offline      → persistent rose pill with "No connection · cached data"
//   * reconnected  → brief emerald pill ("Back online") for 2.5 s after we
//                    transition offline → online, then auto-hides
//   * online       → null
//
// Positioned below the iOS status bar via `pwa-top`. Z-index sits
// above the desktop header (z-30) but below toasts (z-50).
export function NetworkBanner() {
  const { online, connectionType } = useNetworkStatus()
  const [showReconnected, setShowReconnected] = React.useState(false)
  const prevOnlineRef = React.useRef(online)

  React.useEffect(() => {
    if (prevOnlineRef.current === false && online === true) {
      setShowReconnected(true)
      const t = setTimeout(() => setShowReconnected(false), 2500)
      return () => clearTimeout(t)
    }
    prevOnlineRef.current = online
  }, [online])

  // Decide which (if any) variant to render.
  const state = !online ? "offline" : showReconnected ? "reconnected" : "hidden"
  if (state === "hidden") return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center pwa-top px-3 pt-2"
    >
      <AnimatePresence>
        <motion.div
          key={state}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className={cn(
            "pointer-events-auto inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur",
            state === "offline"
              ? "bg-rose-600/95 text-white"
              : "bg-emerald-600/95 text-white",
          )}
        >
          {state === "offline" ? (
            <>
              <WifiOff className="h-3.5 w-3.5" />
              <span>Offline · using cached data</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Back online{connectionType && connectionType !== "unknown" ? ` · ${connectionType}` : ""}</span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
