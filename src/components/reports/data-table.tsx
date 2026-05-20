import * as React from "react"
import { cn } from "@/lib/utils"

export type Column<Row> = {
  key: keyof Row & string
  header: string
  align?: "left" | "right" | "center"
  /** Optional custom cell renderer. */
  render?: (row: Row, value: Row[keyof Row]) => React.ReactNode
  /** Make this column the "primary" — bold + larger on mobile. */
  primary?: boolean
  /** Hidden on mobile (md+ only). Use for secondary columns. */
  hideOnMobile?: boolean
}

type Props<Row> = {
  columns: Column<Row>[]
  rows: Row[]
  /** Stable row key getter. */
  rowKey: (row: Row) => string
  className?: string
  /** Empty-state message when rows is empty. */
  emptyMessage?: string
}

// Generic data table for report tabular data. Auto-collapses on
// mobile to a card list using `primary` + `hideOnMobile` to decide
// which columns appear inline vs. in the card body.
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  className,
  emptyMessage = "No data for this period.",
}: Props<Row>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {/* Desktop / tablet */}
      <div className={cn("hidden overflow-hidden rounded-xl border border-border bg-card md:block", className)}>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-3 py-2.5 font-medium",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="transition-colors hover:bg-accent/30">
                {columns.map((c) => {
                  const v = row[c.key]
                  return (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3 py-2.5",
                        c.align === "right" && "text-right tabular-nums",
                        c.align === "center" && "text-center",
                      )}
                    >
                      {c.render ? c.render(row, v) : (v as React.ReactNode)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className={cn("space-y-2 md:hidden", className)}>
        {rows.map((row) => {
          const primary = columns.find((c) => c.primary)
          const value = columns.find((c) => c.align === "right")
          const others = columns.filter(
            (c) => c !== primary && c !== value && !c.hideOnMobile,
          )
          return (
            <li key={rowKey(row)} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {primary && (
                    <p className="truncate text-sm font-semibold">
                      {primary.render
                        ? primary.render(row, row[primary.key])
                        : (row[primary.key] as React.ReactNode)}
                    </p>
                  )}
                  {others.length > 0 && (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {others.map((c, idx) => (
                        <React.Fragment key={c.key}>
                          {idx > 0 && " · "}
                          <span>
                            {c.render ? c.render(row, row[c.key]) : (row[c.key] as React.ReactNode)}
                          </span>
                        </React.Fragment>
                      ))}
                    </p>
                  )}
                </div>
                {value && (
                  <p className="shrink-0 text-sm font-semibold tabular-nums">
                    {value.render ? value.render(row, row[value.key]) : (row[value.key] as React.ReactNode)}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
