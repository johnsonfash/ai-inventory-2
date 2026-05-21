
import * as React from "react"
import { cn } from "@/lib/utils"

type Ctx = {
  open: boolean
  setOpen: (v: boolean) => void
  value?: string
  setValue: (v?: string) => void
  label?: string
  setLabel: (l?: string) => void
  onValueChange?: (v: string) => void
}
const SelectCtx = React.createContext<Ctx | null>(null)

type SelectRootProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  children: React.ReactNode
}
export function Select({ value, defaultValue, onValueChange, children }: SelectRootProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue)
  const [open, setOpen] = React.useState(false)
  const [label, setLabel] = React.useState<string | undefined>(undefined)
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const current = isControlled ? value : internal

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onEsc)
    }
  }, [])

  const setValue = (v?: string) => {
    if (!isControlled) setInternal(v)
    if (v != null) onValueChange?.(v)
    setOpen(false)
  }

  return (
    <SelectCtx.Provider value={{ open, setOpen, value: current, setValue, label, setLabel, onValueChange }}>
      <div ref={rootRef} className="relative">
        {children}
      </div>
    </SelectCtx.Provider>
  )
}

export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SelectCtx)!
  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm text-foreground shadow-sm outline-none transition-colors",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1 truncate">{children}</div>
      <svg className="ml-2 h-4 w-4 shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export function SelectValue({
  placeholder,
  children,
}: {
  placeholder?: string
  /** Override the rendered label — useful when SelectItems use rich
   *  layouts (icon + sub-text) and `String(children)` wouldn't yield
   *  a clean trigger label. */
  children?: React.ReactNode
}) {
  const ctx = React.useContext(SelectCtx)!
  if (children !== undefined && children !== null && children !== "") {
    return <span className="truncate">{children}</span>
  }
  return (
    <span className={cn("truncate", !ctx.value && "text-muted-foreground")}>
      {ctx.label ?? ctx.value ?? placeholder ?? "Select"}
    </span>
  )
}

export function SelectContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SelectCtx)!
  return (
    <div
      role="listbox"
      className={cn(
        "absolute z-50 mt-1 max-h-60 min-w-full w-max max-w-[min(90vw,420px)] overflow-auto rounded-md border bg-background p-1 text-sm shadow-md focus:outline-none",
        "transition origin-top scale-95 opacity-0",
        ctx.open && "scale-100 opacity-100",
        className,
      )}
      style={{ pointerEvents: ctx.open ? "auto" : "none" }}
    >
      {children}
    </div>
  )
}

export function SelectItem({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const ctx = React.useContext(SelectCtx)!
  const selected = ctx.value === value

  React.useEffect(() => {
    // Only auto-set the trigger label when children is a plain string.
    // Rich children (icon + sub-text layouts) should pass an explicit
    // label via `<SelectValue>{label}</SelectValue>` instead.
    if (selected && typeof children === "string") ctx.setLabel(children)
  }, [selected]) // set label after selection

  return (
    <div
      role="option"
      aria-selected={selected}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "flex w-full cursor-pointer items-center whitespace-nowrap rounded-sm px-2 py-1.5 hover:bg-accent",
        selected && "bg-accent",
        className,
      )}
    >
      {children}
    </div>
  )
}
