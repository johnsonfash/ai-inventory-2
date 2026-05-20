import * as React from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { kv } from "@/lib/storage/kv"

const WA_NUMBER = "2349036723177"
const WA_TEXT = "Hi Pallio, I'd like to learn more."
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`
const DISMISSED_KEY = "pallio:whatsapp-dismissed"

// Brand-green WhatsApp mark — pure SVG, no lucide dep (lucide doesn't
// ship the official logo). Exported so the contact page + other
// surfaces can reuse the same glyph.
export function WhatsAppMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.05 4.91a10.06 10.06 0 0 0-7.12-2.96C6.4 1.95 1.9 6.45 1.9 11.98c0 1.77.47 3.5 1.36 5.02L1.83 22l5.13-1.4a10.04 10.04 0 0 0 4.97 1.27h.01c5.53 0 10.03-4.5 10.03-10.03 0-2.68-1.04-5.2-2.92-7.09zM11.94 20.18h-.01a8.32 8.32 0 0 1-4.24-1.16l-.3-.18-3.04.83.81-2.96-.2-.31a8.34 8.34 0 0 1-1.28-4.42c0-4.6 3.75-8.35 8.36-8.35 2.23 0 4.33.87 5.9 2.45a8.3 8.3 0 0 1 2.45 5.91c0 4.6-3.75 8.35-8.35 8.35zm4.58-6.27c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.13-.56.13-.16.25-.65.81-.79.97-.15.16-.29.18-.54.06-.25-.13-1.06-.39-2.02-1.24-.74-.66-1.25-1.48-1.4-1.73-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.43.13-.15.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.42l-.48-.01c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.06s.88 2.39 1.01 2.55c.13.16 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.48-.6 1.69-1.19.21-.59.21-1.09.15-1.19-.07-.1-.23-.16-.48-.29z" />
    </svg>
  )
}

// Floating WhatsApp + small "Chat with us" popover.
//
// Designed for the Nigerian marketing audience — WhatsApp is the
// dominant business-comms channel, and a tap-to-chat affordance on
// every marketing page lowers the contact barrier significantly.
//
// UX
//   * Sits bottom-right, above the safe-area inset.
//   * On first scroll the bubble pops a little "Need help? Chat now."
//     tooltip for 6 seconds (auto-dismissed after, or any tap).
//   * Dismissed state persisted in kv so it doesn't keep popping.
//
// Mounted in MarketingFrame so it's only ever visible on public
// pages (landing / pricing / about / etc.). Hidden inside the app.
export function WhatsAppButton() {
  const [showTip, setShowTip] = React.useState(false)
  const dismissedRef = React.useRef<boolean>(kv.get(DISMISSED_KEY) === "1")

  React.useEffect(() => {
    if (dismissedRef.current) return
    const t = window.setTimeout(() => setShowTip(true), 2200)
    const hide = window.setTimeout(() => setShowTip(false), 9500)
    return () => {
      clearTimeout(t)
      clearTimeout(hide)
    }
  }, [])

  const dismissTip = () => {
    setShowTip(false)
    dismissedRef.current = true
    void kv.set(DISMISSED_KEY, "1")
  }

  return (
    <div
      className="fixed right-3 z-40 flex flex-col items-end gap-2 sm:right-5"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
    >
      {showTip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="relative max-w-[16rem] rounded-2xl border border-border bg-card px-3 py-2 text-xs shadow-xl shadow-black/15 dark:shadow-black/40"
        >
          <button
            type="button"
            onClick={dismissTip}
            aria-label="Dismiss"
            className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
          <p className="font-semibold">Need help? Chat with us.</p>
          <p className="mt-0.5 text-muted-foreground">+234 903 672 3177 — replies in minutes during business hours.</p>
        </motion.div>
      )}
      <motion.a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismissTip}
        whileTap={{ scale: 0.92 }}
        whileHover={{ y: -2 }}
        aria-label="Chat with Pallio on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/40 ring-4 ring-[#25D366]/15 transition-shadow hover:shadow-[#25D366]/60"
      >
        <WhatsAppMark className="h-7 w-7" />
      </motion.a>
    </div>
  )
}
