import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Mover = { name: string; sku: string; delta: number; units: number }

const movers: Mover[] = [
  { name: "USB‑C Hub 6‑in‑1", sku: "EL-2109", delta: 42, units: 320 },
  { name: "Cotton Tee - Black", sku: "AP-4012", delta: 31, units: 280 },
  { name: "Ceramic Mug 12oz", sku: "HM-2205", delta: 26, units: 190 },
  { name: "Hydrating Serum", sku: "BT-9091", delta: 18, units: 120 },
]

export function TopMovers() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Top Movers</CardTitle>
        <CardDescription>Fastest selling SKUs this period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {movers.map((m) => (
          <div key={m.sku}>
            <div className="flex items-center justify-between text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.sku}</div>
              </div>
              <div className="text-xs tabular-nums text-emerald-600">+{m.delta}%</div>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-emerald-600"
                style={{ width: `${Math.min(100, m.delta)}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">{m.units} units</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
