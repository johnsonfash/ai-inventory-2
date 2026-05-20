import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Info } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { cn } from "@/lib/utils"

type InfoTooltipProps = {
  /** Headline shown in the panel/sheet — kept short ("Forecast confidence",
   *  "ROAS", "What is this?"). The same text is the aria-label of the
   *  trigger button. */
  label?: string
  /** Body content. Plain string for the common case; ReactNode for
   *  formatted explanations (lists, code, links). */
  children: React.ReactNode
  /** Visual size. */
  size?: "xs" | "sm" | "md"
  /** Override the trigger icon's container class. */
  className?: string
}

// Reusable inline-help button — a small info-i circle next to a
// label that explains the thing. Dual-face:
//   - Desktop: hover / focus opens a small tooltip popover beside
//     the trigger (portaled so it escapes overflow contexts).
//   - Mobile: tap opens a BottomSheet with the same content, sized
//     for one-finger reach. Tap target is 28×28 even when the icon
//     is small, satisfying WCAG 2.5.5.
//
// Use anywhere a chart, KPI, or form field has a non-obvious meaning:
//
//   <h3>
//     ROAS
//     <InfoTooltip label="ROAS">
//       Return on ad spend. Revenue attributed to this campaign
//       divided by what you paid for it. 3× is healthy; under 1×
//       the campaign is losing money.
//     </InfoTooltip>
//   </h3>
export function InfoTooltip({ label, children, size = "sm", className }: InfoTooltipProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
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
          openTip()
        }}
        onMouseEnter={isMobile ? undefined : openTip}
        onMouseLeave={isMobile ? undefined : scheduleClose}
        onFocus={isMobile ? undefined : openTip}
        onBlur={isMobile ? undefined : scheduleClose}
        className={cn(buttonSize, "align-middle", className)}
      >
        <Info className={iconSize} />
      </button>

      {isMobile ? (
        <BottomSheet open={open} onClose={closeTip} title={label ?? "Info"}>
          <div className="px-4 pb-6 pt-2 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </BottomSheet>
      ) : (
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && anchorRect && (
              <motion.div
                role="dialog"
                aria-label={label ?? "Info"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.12 }}
                onMouseEnter={cancelClose}
                onMouseLeave={closeTip}
                style={{
                  position: "fixed",
                  // Place the bubble below the trigger, nudged right
                  // 12px so the visual arrow lines up with the icon
                  // centre. If we'd flip off-screen on the right, we
                  // shift left.
                  top: anchorRect.bottom + 6,
                  left: clampLeft(anchorRect.left - 12),
                  zIndex: 80,
                  maxWidth: 320,
                }}
                className="w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-3 text-sm leading-relaxed text-popover-foreground shadow-xl shadow-black/15 dark:shadow-black/40"
              >
                {label && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                )}
                {children}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )
      )}
    </>
  )
}

function clampLeft(left: number): number {
  const max = typeof window === "undefined" ? 1000 : window.innerWidth - 332
  return Math.max(8, Math.min(left, max))
}
