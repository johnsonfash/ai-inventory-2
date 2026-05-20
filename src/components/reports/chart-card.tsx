import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type LegendItem = { label: string; tone: string }

type Props = {
  title: string
  description?: string
  /** Right-aligned action node (period selector, segmented control, etc). */
  action?: React.ReactNode
  /** Inline legend dots under the title. */
  legend?: LegendItem[]
  /** Chart height in px. Defaults to 280. */
  height?: number
  children: React.ReactNode
  className?: string
}

// Card wrapper for charts. Standardises spacing, legend rendering and
// fixed height so every report chart looks the same.
export function ChartCard({ title, description, action, legend, height = 280, children, className }: Props) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
            {legend && legend.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                {legend.map((l) => (
                  <span key={l.label} className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: l.tone }} />
                    {l.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div style={{ height }}>{children}</div>
      </CardContent>
    </Card>
  )
}
