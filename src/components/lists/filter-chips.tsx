import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type FilterChip = {
  /** Stable key (e.g. `status:paid`). */
  key: string
  /** Human label rendered in the pill. */
  label: string
  /** Called when user taps the X. Omit to make the pill non-removable. */
  onRemove?: () => void
}

type Props = {
  chips: FilterChip[]
  /** Render a "Clear all" trailing button when there are chips. */
  onClearAll?: () => void
  className?: string
}

// Horizontal scroll row of active-filter pills. Bleeds to the viewport
// edges on mobile so the rightmost chip can be peeked-at.
export function FilterChips({ chips, onClearAll, className }: Props) {
  if (chips.length === 0) return null
  return (
    <div
      className={cn(
        "-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 pt-0.5 scrollbar-hide md:mx-0 md:px-0",
        className,
      )}
    >
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft py-1 pl-2.5 pr-1 text-xs font-medium text-brand dark:bg-primary/15 dark:text-primary"
        >
          {c.label}
          {c.onRemove && (
            <button
              type="button"
              aria-label={`Remove ${c.label}`}
              onClick={c.onRemove}
              className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-brand/15 dark:hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-1 shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
