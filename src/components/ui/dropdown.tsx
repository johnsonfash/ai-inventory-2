"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type DropdownProps = {
  button: React.ReactNode
  children: React.ReactNode
  className?: string
  align?: "start" | "end"
}

export function Dropdown({ button, children, className, align = "end" }: DropdownProps) {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [])

  return (
    <div ref={rootRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-2 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {button}
      </button>
      <div
        role="menu"
        className={cn(
          "absolute z-50 mt-1 w-44 overflow-hidden rounded-md border bg-white p-1 text-sm shadow-lg dark:bg-neutral-900",
          align === "end" ? "right-0" : "left-0",
          "transition origin-top scale-95 opacity-0",
          open && "scale-100 opacity-100",
        )}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        {children}
      </div>
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
  return (
    <button
      type="button"
      role={role}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800",
        className,
      )}
    >
      {children}
    </button>
  )
}
