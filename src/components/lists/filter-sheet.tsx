import * as React from "react"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onClose: () => void
  /** Apply handler — called when user taps the primary footer button.
      Use this to commit the staged filter state to the URL/list. */
  onApply?: () => void
  /** Reset handler — called when user taps "Reset". */
  onReset?: () => void
  /** Optional "applied count" shown on the apply button. */
  appliedCount?: number
  title?: string
  description?: string
  children: React.ReactNode
}

export function FilterSheet({
  open,
  onClose,
  onApply,
  onReset,
  appliedCount,
  title = "Filters",
  description,
  children,
}: Props) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <div className="flex gap-2 pb-3">
          {onReset && (
            <Button variant="outline" className="flex-1" onClick={onReset}>
              Reset
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={() => {
              onApply?.()
              onClose()
            }}
          >
            Apply{appliedCount ? ` (${appliedCount})` : ""}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">{children}</div>
    </BottomSheet>
  )
}

// ----- Filter sections (compose inside FilterSheet) -----

export function FilterSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

// A flex-wrap row of toggleable pill options. Works for both
// single-select and multi-select.
type Option<T extends string> = { value: T; label: string }
export function FilterPillGroup<T extends string>({
  options,
  value,
  onChange,
  multi = false,
}: {
  options: Option<T>[]
  value: T | T[] | null
  onChange: (next: T | T[] | null) => void
  multi?: boolean
}) {
  const selected = new Set<T>(value == null ? [] : Array.isArray(value) ? value : [value])
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = selected.has(o.value)
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              if (multi) {
                const next = new Set(selected)
                if (active) next.delete(o.value)
                else next.add(o.value)
                onChange(Array.from(next) as T[])
              } else {
                onChange(active ? null : o.value)
              }
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                : "border border-border bg-card text-foreground hover:bg-accent",
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
