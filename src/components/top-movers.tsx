import { Flame } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Mover = { name: string; sku: string; delta: number; units: number }

const movers: Mover[] = [
  { name: "USB‑C Hub 6‑in‑1", sku: "EL-2109", delta: 42, units: 320 },
  { name: "Cotton Tee — Black", sku: "AP-4012", delta: 31, units: 280 },
  { name: "Ceramic Mug 12oz", sku: "HM-2205", delta: 26, units: 190 },
  { name: "Hydrating Serum", sku: "BT-9091", delta: 18, units: 120 },
]

export function TopMovers() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
            <Flame className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">Top movers</CardTitle>
            <CardDescription>Fastest-selling SKUs this period</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {movers.map((m) => (
          <div key={m.sku}>
            <div className="flex items-center justify-between text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{m.name}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{m.sku}</div>
              </div>
              <div className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                +{m.delta}%
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-brand via-fuchsia-500 to-emerald-500"
                style={{ width: `${Math.min(100, m.delta * 2)}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] tabular-nums text-muted-foreground">{m.units} units sold</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
