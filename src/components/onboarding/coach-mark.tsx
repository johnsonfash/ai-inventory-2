import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { kvJson } from "@/lib/storage/kv"
import { cn } from "@/lib/utils"

// CoachMark — a one-time pulsing-ring tooltip pointing at a specific
// element. Useful for "tap here to start a sale" type hints on the
// first visit to a page. Persisted per `id` in
// `pallio:coach-marks-seen` so it never shows again.
//
// Usage:
//   <CoachMark
//     id="pos-new-sale"
//     anchorRef={btnRef}
//     title="Start your first sale"
//     body="Tap here to open the register."
//   />

const SEEN_KEY = "pallio:coach-marks-seen"

function readSeen(): Record<string, boolean> {
  return kvJson.get<Record<string, boolean>>(SEEN_KEY) ?? {}
}

export async function resetCoachMarks(): Promise<void> {
  await kvJson.remove(SEEN_KEY)
  window.dispatchEvent(new CustomEvent("pallio:coach-marks-changed"))
}

type Props = {
  id: string
  anchorRef: React.RefObject<HTMLElement | null>
  title: string
  body: string
  /** Direction the popover points from. Default 'bottom'. */
  placement?: "top" | "bottom" | "left" | "right"
  /** Skip showing (e.g. parent decides timing). */
  enabled?: boolean
}

export function CoachMark({ id, anchorRef, title, body, placement = "bottom", enabled = true }: Props) {
  const [open, setOpen] = React.useState(false)
  const [rect, setRect] = React.useState<DOMRect | null>(null)

  // Mount logic — only show if unseen + anchor present.
  React.useEffect(() => {
    if (!enabled) return
    const seen = readSeen()
    if (seen[id]) return

    // Wait a tick so the anchor is laid out.
    const t = window.setTimeout(() => {
      if (anchorRef.current) {
        setRect(anchorRef.current.getBoundingClientRect())
        setOpen(true)
      }
    }, 400)
    return () => window.clearTimeout(t)
  }, [id, enabled, anchorRef])

  // Recompute rect on resize / scroll while open.
  React.useEffect(() => {
    if (!open) return
    const update = () => {
      if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect())
    }
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [open, anchorRef])

  const dismiss = React.useCallback(() => {
    setOpen(false)
    const seen = readSeen()
    void kvJson.set(SEEN_KEY, { ...seen, [id]: true })
  }, [id])

  if (!open || !rect || typeof document === "undefined") return null

  // Pulse ring sits centred over the anchor.
  const ringSize = Math.max(48, Math.max(rect.width, rect.height) + 16)
  const ringTop = rect.top + rect.height / 2 - ringSize / 2
  const ringLeft = rect.left + rect.width / 2 - ringSize / 2

  // Popover placement
  const POP_W = 280
  const margin = 12
  let popTop = 0
  let popLeft = 0
  if (placement === "bottom") {
    popTop = rect.bottom + margin
    popLeft = rect.left + rect.width / 2 - POP_W / 2
  } else if (placement === "top") {
    popTop = rect.top - margin - 120
    popLeft = rect.left + rect.width / 2 - POP_W / 2
  } else if (placement === "right") {
    popTop = rect.top + rect.height / 2 - 60
    popLeft = rect.right + margin
  } else {
    popTop = rect.top + rect.height / 2 - 60
    popLeft = rect.left - POP_W - margin
  }
  popLeft = Math.max(8, Math.min(window.innerWidth - POP_W - 8, popLeft))
  popTop  = Math.max(8, Math.min(window.innerHeight - 160, popTop))

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Pulsing ring — pure CSS animation, NO interaction blocked
              (passes pointer events through to the underlying button). */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              top: ringTop,
              left: ringLeft,
              width: ringSize,
              height: ringSize,
              pointerEvents: "none",
              zIndex: 90,
            }}
            aria-hidden
          >
            <span
              className="absolute inset-0 rounded-full border-2 border-brand opacity-80 dark:border-primary"
              style={{ boxShadow: "0 0 0 4px rgba(124, 58, 237, 0.18)" }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-brand dark:border-primary"
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.7, 0, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>

          {/* Popover */}
          <motion.div
            role="dialog"
            aria-label={title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              top: popTop,
              left: popLeft,
              width: POP_W,
              zIndex: 95,
            }}
            className="rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-xl shadow-black/20 dark:shadow-black/50"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss coach mark"
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand dark:bg-primary/15 dark:text-primary">
              Tip · first visit
            </span>
            <p className="mt-2 text-sm font-semibold">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
            <button
              type="button"
              onClick={dismiss}
              className={cn(
                "mt-3 inline-flex w-full items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                "bg-brand text-brand-foreground hover:bg-brand/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
              )}
            >
              Got it
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
