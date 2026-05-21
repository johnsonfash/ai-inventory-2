import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

type DropdownProps = {
  button: React.ReactNode
  children: React.ReactNode
  className?: string
  align?: "start" | "end"
}

const DropdownCtx = React.createContext<{ close: () => void }>({ close: () => {} })

// Lightweight dropdown menu. The button is rendered in-place; the
// menu itself is portalled to body and positioned with `position:
// fixed` against the trigger's bounding rect. This makes it
// immune to ancestor `transform` / `filter` / `overflow-hidden`
// rules that would otherwise clip or misposition an `absolute`
// menu — which was the cause of the "menu items show up at the
// top of the page on mobile" bug.
export function Dropdown({ button, children, className, align = "end" }: DropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [rect, setRect] = React.useState<DOMRect | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const menuRef = React.useRef<HTMLDivElement | null>(null)

  const close = React.useCallback(() => setOpen(false), [])

  const openMenu = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect())
    setOpen(true)
  }

  // Outside pointerdown, scroll, resize, Escape — all close.
  React.useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node | null
      if (!t) return
      if (triggerRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      close()
    }
    const onScroll = () => close()
    const onResize = () => close()
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    document.addEventListener("pointerdown", onPointer, true)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onResize)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer, true)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, close])

  // Compute menu position from trigger rect.
  const placement = React.useMemo(() => {
    if (!rect || typeof window === "undefined") return null
    const MENU_W = 192 // matches `w-48`
    const margin = 8
    const top = rect.bottom + 4
    const rawLeft = align === "end"
      ? rect.right - MENU_W
      : rect.left
    const left = Math.max(margin, Math.min(window.innerWidth - MENU_W - margin, rawLeft))
    return { top, left, width: MENU_W }
  }, [rect, align])

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close() : openMenu())}
        style={{ touchAction: "manipulation" }}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
      >
        {button}
      </button>
      {open && placement && typeof document !== "undefined" && createPortal(
        <DropdownCtx.Provider value={{ close }}>
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: placement.top,
              left: placement.left,
              width: placement.width,
              zIndex: 100,
            }}
            className={cn(
              "overflow-hidden rounded-lg border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg",
              "origin-top animate-in fade-in zoom-in-95 duration-100",
            )}
          >
            {children}
          </div>
        </DropdownCtx.Provider>,
        document.body,
      )}
    </div>
  )
}

export function DropdownItem({
  children,
  onSelect,
  className,
  role = "menuitem",
}: {
  children: React.ReactNode
  onSelect?: () => void
  className?: string
  role?: React.AriaRole
}) {
  const { close } = React.useContext(DropdownCtx)
  return (
    <button
      type="button"
      role={role}
      style={{ touchAction: "manipulation" }}
      onClick={() => {
        onSelect?.()
        close()
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      {children}
    </button>
  )
}
