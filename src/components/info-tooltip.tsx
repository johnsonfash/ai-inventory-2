import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Info, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type InfoTooltipProps = {
  /** Headline shown in the popover. Kept short ("Forecast confidence",
   *  "ROAS", "What is this?"). Also the aria-label of the trigger. */
  label?: string
  /** Body content. Plain string for the common case; ReactNode for
   *  formatted explanations (lists, code, links). */
  children: React.ReactNode
  /** Visual size of the trigger icon. */
  size?: "xs" | "sm" | "md"
  /** Override the trigger icon's container class. */
  className?: string
}

// Inline-help button — small "i" circle that opens a popover with an
// explanation. One implementation for both desktop and mobile so the
// behaviour is identical:
//   - tap / click toggles open
//   - hover on desktop opens; mouseleave closes
//   - tap outside, Escape, or scrolling the page closes
//   - portal-rendered so it escapes overflow contexts
//
// Why not a BottomSheet on mobile? Sheets felt like overkill for a
// 2-line definition, and tap-outside-to-close was flaky across pages
// where the parent layout interfered with `position: fixed`. A
// portal popover anchored to the trigger works reliably everywhere.
export function InfoTooltip({ label, children, size = "sm", className }: InfoTooltipProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)
  const hoverTimerRef = React.useRef<number | null>(null)

  const iconSize = size === "xs" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"
  const buttonSize = "inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"

  const openTip = React.useCallback(() => {
    if (triggerRef.current) setAnchorRect(triggerRef.current.getBoundingClientRect())
    setOpen(true)
  }, [])

  const closeTip = React.useCallback(() => setOpen(false), [])

  const cancelClose = () => {
    if (hoverTimerRef.current != null) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    hoverTimerRef.current = window.setTimeout(closeTip, 120)
  }
  React.useEffect(() => () => cancelClose(), [])

  // While open: close on outside tap, scroll, or window resize. Use
  // `pointerdown` instead of `click` so it fires on first touch + works
  // before any default click handler. Capture phase so a child
  // element can't stopPropagation us into staying open.
  React.useEffect(() => {
    if (!open) return
    const onOutside = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (triggerRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      closeTip()
    }
    const onScroll = () => closeTip()
    const onResize = () => closeTip()
    document.addEventListener("pointerdown", onOutside, true)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onResize)
    return () => {
      document.removeEventListener("pointerdown", onOutside, true)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onResize)
    }
  }, [open, closeTip])

  // Escape key.
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTip()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, closeTip])

  // Compute popover placement: below the trigger if there's room,
  // otherwise above. Clamp horizontally to keep it inside the viewport.
  const placement = React.useMemo(() => {
    if (!anchorRect || typeof window === "undefined") return null
    const POP_W = isMobile ? Math.min(320, window.innerWidth - 24) : 320
    const POP_MAX_H = 360
    const margin = 8
    const below = window.innerHeight - anchorRect.bottom
    const above = anchorRect.top
    const placeAbove = below < 160 && above > below
    const top = placeAbove
      ? Math.max(margin, anchorRect.top - POP_MAX_H - 6)
      : anchorRect.bottom + 6
    const rawLeft = anchorRect.left + anchorRect.width / 2 - POP_W / 2
    const left = Math.max(margin, Math.min(window.innerWidth - POP_W - margin, rawLeft))
    return { top, left, width: POP_W, placeAbove }
  }, [anchorRect, isMobile])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label ? `What is ${label}?` : "More info"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (open) closeTip()
          else openTip()
        }}
        onMouseEnter={isMobile ? undefined : openTip}
        onMouseLeave={isMobile ? undefined : scheduleClose}
        onFocus={isMobile ? undefined : openTip}
        onBlur={isMobile ? undefined : scheduleClose}
        className={cn(buttonSize, "align-middle", className)}
      >
        <Info className={iconSize} />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && placement && (
              <motion.div
                ref={popoverRef}
                role="dialog"
                aria-label={label ?? "Info"}
                initial={{ opacity: 0, y: placement.placeAbove ? 4 : -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: placement.placeAbove ? 4 : -4 }}
                transition={{ duration: 0.12 }}
                onMouseEnter={isMobile ? undefined : cancelClose}
                onMouseLeave={isMobile ? undefined : closeTip}
                style={{
                  position: "fixed",
                  top: placement.top,
                  left: placement.left,
                  width: placement.width,
                  maxHeight: 360,
                  zIndex: 100,
                }}
                className="overflow-y-auto rounded-xl border border-border bg-popover text-sm leading-relaxed text-popover-foreground shadow-xl shadow-black/15 dark:shadow-black/40"
              >
                <div className="flex items-start gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    {label && (
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                    )}
                    {children}
                  </div>
                  {/* Mobile close button — desktop closes on mouseleave */}
                  {isMobile && (
                    <button
                      type="button"
                      onClick={closeTip}
                      aria-label="Close"
                      className="-mr-1 -mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
