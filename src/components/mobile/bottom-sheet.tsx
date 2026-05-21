import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion"
import { haptic } from "@/hooks/use-native"
import { cn } from "@/lib/utils"

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  /** Title rendered in the sticky header. Optional — pass null to omit. */
  title?: React.ReactNode
  /** Subtitle below the title. Optional. */
  description?: React.ReactNode
  /** Right-aligned header slot (e.g. a "Done" button). */
  headerRight?: React.ReactNode
  /** Sheet content. Scrolls internally. */
  children: React.ReactNode
  /** Optional bottom action bar (sticky above home indicator). */
  footer?: React.ReactNode
  /** Constrain max height; default 92vh. */
  maxHeightVh?: number
  /** Pin a minimum height so the sheet doesn't bob when its content
   *  changes (e.g. swapping between a 4-item list and a 12-item
   *  list inside a drill-down). */
  minHeightVh?: number
  /** Lock the sheet to an exact viewport-fraction height — overrides
   *  min/max. Use when you want a stable bottom edge across content
   *  swaps (More drawer drilling between sections, settings sheets
   *  with a fixed footer, etc). */
  heightVh?: number
  className?: string
}

// Spring-animated bottom sheet. Drag down to dismiss; tap the backdrop
// to close. Locks body scroll while open.
export function BottomSheet({
  open,
  onClose,
  title,
  description,
  headerRight,
  children,
  footer,
  maxHeightVh = 92,
  minHeightVh,
  heightVh,
  className,
}: BottomSheetProps) {
  // Lock the body when open so the page underneath doesn't scroll with
  // the drag gesture on iOS Safari.
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Close on Escape.
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Close on a meaningful downward fling or pull.
    if (info.offset.y > 120 || info.velocity.y > 600) {
      haptic.light()
      onClose()
    }
  }

  // Drive the drag from the handle + header only — `dragListener: false`
  // means the sheet itself doesn't intercept pointer events, so the
  // body's overflow-y-auto can scroll without fighting the drag-to-
  // dismiss gesture. The drag handle calls `controls.start(event)`
  // on pointerdown to opt that region in.
  const dragControls = useDragControls()

  // Portal to body so `position: fixed` is always relative to the
  // viewport, never trapped inside a transformed / filtered ancestor.
  if (typeof document === "undefined") return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden
          />
          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "relative z-10 w-full max-w-xl rounded-t-2xl border-t border-border bg-card text-card-foreground shadow-2xl",
              "flex flex-col overflow-hidden",
              className,
            )}
            style={
              heightVh
                ? { height: `${heightVh}dvh` }
                : {
                    maxHeight: `${maxHeightVh}dvh`,
                    ...(minHeightVh ? { minHeight: `${minHeightVh}dvh` } : {}),
                  }
            }
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320, mass: 0.6 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle + header are the only drag-eligible region.
                Calling `dragControls.start(e)` on pointerdown forwards
                that gesture to the motion.div. Inside the body, drag
                stays disabled so the inner scroll is rock-solid. */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex shrink-0 cursor-grab justify-center pt-2.5 pb-1.5 active:cursor-grabbing"
              style={{ touchAction: "none" }}
              aria-label="Drag to dismiss"
              role="presentation"
            >
              <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            {(title || description || headerRight) && (
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex shrink-0 cursor-grab items-start gap-3 px-5 pb-3 active:cursor-grabbing"
                style={{ touchAction: "none" }}
              >
                <div className="min-w-0 flex-1">
                  {title && <div className="text-base font-semibold leading-tight">{title}</div>}
                  {description && (
                    <div className="mt-0.5 text-sm text-muted-foreground">{description}</div>
                  )}
                </div>
                {headerRight}
              </div>
            )}

            {/* Body — `pwa-bottom` adds the iOS home-indicator inset
                so the last form field can't sit under the safe area.
                When there's a footer, that footer carries the inset
                instead and the body just gets normal bottom padding.
                Bumped to pb-10 (40px) so the last item in any sheet
                (cart sheet, scan sheet, settings, filters, etc.) has
                generous breathing room before the sheet's bottom
                edge — covers every consumer in one place. */}
            <div
              className={cn(
                "flex-1 overflow-y-auto px-5",
                footer ? "pb-8" : "pb-10 pwa-bottom",
              )}
            >
              {children}
            </div>

            {/* Footer (sticky, safe-area aware) */}
            {footer && (
              <div className="border-t border-border bg-card/95 px-5 py-3 pwa-bottom backdrop-blur">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
