import { SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  onClick: () => void
  /** Number of applied filters — renders a small badge dot if > 0. */
  count?: number
  className?: string
}

// Compact icon button (designed for mobile top-bar trailing slot or a
// desktop list-page header). Shows a small numeric badge when filters
// are applied.
export function FilterButton({ onClick, count = 0, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Filters${count ? ` (${count} applied)` : ""}`}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-accent active:bg-accent/70 transition-colors",
        className,
      )}
    >
      <SlidersHorizontal className="h-4.5 w-4.5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-brand-foreground ring-2 ring-background dark:bg-primary dark:text-primary-foreground">
          {count}
        </span>
      )}
    </button>
  )
}
