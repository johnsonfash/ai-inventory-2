
import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

type DialogCtx = { open: boolean; onOpenChange?: (v: boolean) => void }
const Ctx = React.createContext<DialogCtx | null>(null)

// Centred modal — same shape on every viewport (phone, tablet, desktop).
//
// This is the "stop and decide" primitive: confirmations, destructive
// prompts, PIN entry, short focused forms. When the choice is a focused
// decision (not an action surface tied to the page underneath), a centred
// modal reads better than a bottom drawer even on mobile — it says "handle
// this, then continue" and can't be half-dismissed by a stray swipe.
//
// For action surfaces that belong to the page context (cart, checkout,
// filters, pickers, venue tables) use `BottomSheet` instead — that one is
// a drawer on mobile and a centred modal on desktop.
export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange?: (v: boolean) => void
  children: React.ReactNode
}) {
  return <Ctx.Provider value={{ open, onOpenChange }}>{children}</Ctx.Provider>
}

type TriggerChild = React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>

export function DialogTrigger({ asChild: _asChild = false, children }: { asChild?: boolean; children: TriggerChild }) {
  const ctx = React.useContext(Ctx)!
  const child = React.Children.only(children) as TriggerChild
  const onClick = (e: React.MouseEvent) => {
    child.props.onClick?.(e)
    ctx.onOpenChange?.(true)
  }
  return React.cloneElement(child, { onClick })
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-muted-foreground", className)} {...props} />
}

export function DialogContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(Ctx)!

  // Lock the body + close on Escape while open. Kept here (not on the
  // consumer) so every Dialog gets the same dismissal behaviour for free.
  React.useEffect(() => {
    if (!ctx.open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.onOpenChange?.(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.open])

  // Portal to body so the modal is never trapped inside a transformed /
  // filtered / overflow-hidden ancestor (a recurring z-index footgun).
  if (typeof document === "undefined") return null
  return createPortal(
    <AnimatePresence>
      {ctx.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => ctx.onOpenChange?.(false)}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className={cn(
              // `max-h-[90dvh] overflow-y-auto` keeps a tall form usable on a
              // short phone screen instead of overflowing off the bottom.
              "relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-border bg-background p-4 shadow-2xl shadow-black/30",
              className,
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-2", className)} {...props} />
}
export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold", className)} {...props} />
}
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-3 flex justify-end gap-2", className)} {...props} />
}
