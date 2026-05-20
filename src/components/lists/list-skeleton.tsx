import { cn } from "@/lib/utils"

type Props = {
  rows?: number
  variant?: "card" | "row"
  className?: string
}

// Skeleton placeholder for list pages. `card` matches mobile rounded
// rows; `row` matches table rows for desktop tables in flight.
export function ListSkeleton({ rows = 6, variant = "card", className }: Props) {
  return (
    <div className={cn(variant === "card" ? "space-y-2" : "divide-y divide-border rounded-lg border border-border", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3",
            variant === "card" ? "rounded-xl border border-border bg-card p-3" : "px-4 py-3",
          )}
        >
          <div className="h-10 w-10 shrink-0 rounded-lg bg-muted animate-pulse" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3 w-2/5 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-3/5 rounded bg-muted/70 animate-pulse" />
          </div>
          <div className="h-3 w-12 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  )
}
