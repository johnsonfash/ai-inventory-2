import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Row = {
  /** Unique key. */
  id: string
  /** Primary line (e.g. product name). */
  primary: string
  /** Subtitle line under primary (SKU, category, etc). */
  secondary?: string
  /** Rendered on the right. */
  value: React.ReactNode
  /** Optional fraction (0-1) used to render an inline progress bar. */
  fraction?: number
}

type Props = {
  title: string
  description?: string
  rows: Row[]
  /** Optional gradient class for the progress bar. */
  barClassName?: string
  className?: string
}

// Card with a ranked list of items (1, 2, 3, …) + value + optional
// progress bar based on a fraction. Used for top-N reports.
export function RankedList({ title, description, rows, barClassName, className }: Props) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {rows.map((r, i) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-bold tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.primary}</p>
                {r.secondary && (
                  <p className="truncate text-[11px] text-muted-foreground">{r.secondary}</p>
                )}
              </div>
              <div className="shrink-0 text-sm font-semibold tabular-nums">{r.value}</div>
            </div>
            {typeof r.fraction === "number" && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-1.5 rounded-full",
                    barClassName ?? "bg-gradient-to-r from-brand via-fuchsia-500 to-emerald-500",
                  )}
                  style={{ width: `${Math.max(4, Math.min(100, r.fraction * 100))}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
