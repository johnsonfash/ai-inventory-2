import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion"
import { haptic } from "@/hooks/use-native"
import { useIsMobile } from "@/hooks/use-mobile"
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
  /** Desktop modal width cap. Defaults to `max-w-xl`. Pass any Tailwind
   *  max-w-* class when a sheet needs a wider/narrower centred dialog. */
  desktopMaxWidth?: string
  /** Viewport width (px) below which this renders as a bottom drawer and
   *  at/above which it becomes a centred modal. Defaults to 768. POS
   *  passes 1024 so the cart/checkout stay drawers right up to the point
   *  the layout swaps in the side-panel — keeping the "overlay = drawer"
   *  intent consistent on tablets. */
  drawerBreakpoint?: number
  className?: string
}

// Dual-face overlay primitive.
//
// • Mobile (< 768px): a spring-animated bottom sheet — drag down to
//   dismiss, tap the backdrop to close, drag handle on top.
// • Desktop (≥ 768px): a centred modal — fade + scale in, no drag handle
//   (dragging a sheet up from the bottom edge makes no sense with a mouse).
//
// One component, one prop API, so every caller (cart, checkout, filters,
// venue tables, …) gets the right shape on each device without per-caller
// branching. Mirrors the desktop-modal/mobile-drawer split already used by
// RecordPaymentModal / ConnectModal / CommandPalette.
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
  desktopMaxWidth = "max-w-xl",
  drawerBreakpoint = 768,
  className,
}: BottomSheetProps) {
  const isMobile = useIsMobile(drawerBreakpoint)

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
  // on pointerdown to opt that region in. Hook is called unconditionally
  // (rules of hooks); it's only wired to the sheet on mobile.
  const dragControls = useDragControls()

  // On desktop the header isn't a drag surface — only forward pointer
  // events to the drag controls when we're in mobile/drawer mode.
  const startDrag = isMobile ? (e: React.PointerEvent) => dragControls.start(e) : undefined

  // Portal to body so `position: fixed` is always relative to the
  // viewport, never trapped inside a transformed / filtered ancestor.
  if (typeof document === "undefined") return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex justify-center",
            isMobile ? "items-end" : "items-center p-4",
          )}
        >
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
          {/* Sheet (mobile) / Modal (desktop) */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "relative z-10 w-full bg-card text-card-foreground shadow-2xl",
              "flex flex-col overflow-hidden",
              isMobile
                ? "max-w-xl rounded-t-2xl border-t border-border"
                : cn(desktopMaxWidth, "rounded-2xl border border-border"),
              className,
            )}
            style={
              heightVh
                ? { height: `${heightVh}dvh` }
                : {
                    // Desktop modals are roomy but never full-bleed; clamp a
                    // touch tighter than the mobile sheet so the backdrop
                    // padding reads as a real dialog.
                    maxHeight: isMobile ? `${maxHeightVh}dvh` : `min(${maxHeightVh}vh, 85vh)`,
                    ...(minHeightVh && isMobile ? { minHeight: `${minHeightVh}dvh` } : {}),
                  }
            }
            initial={isMobile ? { y: "100%" } : { y: 16, opacity: 0, scale: 0.97 }}
            animate={isMobile ? { y: 0 } : { y: 0, opacity: 1, scale: 1 }}
            exit={isMobile ? { y: "100%" } : { y: 16, opacity: 0, scale: 0.97 }}
            transition={
              isMobile
                ? { type: "spring", damping: 32, stiffness: 320, mass: 0.6 }
                : { type: "spring", damping: 28, stiffness: 320 }
            }
            drag={isMobile ? "y" : false}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={isMobile ? handleDragEnd : undefined}
          >
            {/* Drag handle — mobile only. On desktop a grab handle is
                meaningless (no touch fling), so we drop it and let the
                header sit flush. */}
            {isMobile && (
              <div
                onPointerDown={startDrag}
                className="flex shrink-0 cursor-grab justify-center pt-2.5 pb-1.5 active:cursor-grabbing"
                style={{ touchAction: "none" }}
                aria-label="Drag to dismiss"
                role="presentation"
              >
                <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
              </div>
            )}

            {/* Header */}
            {(title || description || headerRight) && (
              <div
                onPointerDown={startDrag}
                className={cn(
                  "flex shrink-0 items-start gap-3 px-5 pb-3",
                  isMobile ? "cursor-grab active:cursor-grabbing" : "pt-5",
                )}
                style={isMobile ? { touchAction: "none" } : undefined}
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
                instead and the body just gets a normal pb-4. Per-
                consumer overrides (e.g. extra mb-X / pb-X on inner
                content) handle their own breathing room. */}
            <div
              className={cn(
                "flex-1 overflow-y-auto px-5",
                footer ? "pb-4" : "pb-4 pwa-bottom",
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
