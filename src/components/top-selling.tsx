import { Trophy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrency } from "@/contexts/currency"

const topSelling = [
  { sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", units: 320, revenue: 4000 },
  { sku: "AP-4012", name: "Cotton Tee — Black", units: 280, revenue: 3360 },
  { sku: "HM-2205", name: "Ceramic Mug 12oz", units: 190, revenue: 1520 },
  { sku: "BT-9091", name: "Hydrating Serum", units: 120, revenue: 1820 },
]

const rankClasses = [
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  "bg-muted text-muted-foreground",
]

export function TopSelling() {
  const { formatCompact } = useCurrency()
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Trophy className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">Top selling</CardTitle>
            <CardDescription>Most units sold this period</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {topSelling.map((i, idx) => (
          <div
            key={i.sku}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums ${
                rankClasses[idx] ?? rankClasses[3]!
              }`}
            >
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{i.name}</div>
              <div className="truncate font-mono text-[11px] text-muted-foreground">{i.sku}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-sm font-semibold tabular-nums">{i.units}</div>
              <div className="text-[11px] tabular-nums text-muted-foreground">
                {formatCompact(i.revenue)}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
