import * as React from "react"
import { cn } from "@/lib/utils"

export type Period = "today" | "7d" | "30d" | "90d" | "ytd" | "all"

const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "ytd", label: "YTD" },
  { value: "all", label: "All time" },
]

type Props = {
  value: Period
  onChange: (next: Period) => void
  className?: string
}

// Horizontal scrolling pill row of preset periods. Snaps to active
// chip on mobile (so the selected one comes into view).
export function PeriodChips({ value, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:px-0",
        className,
      )}
    >
      {PERIODS.map((p) => {
        const active = value === p.value
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-transparent bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}

export function labelForPeriod(p: Period): string {
  return PERIODS.find((x) => x.value === p)?.label ?? p
}
