import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"

const topSelling = [
  { sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", units: 320, revenue: 4000 },
  { sku: "AP-4012", name: "Cotton Tee - Black", units: 280, revenue: 3360 },
  { sku: "HM-2205", name: "Ceramic Mug 12oz", units: 190, revenue: 1520 },
]

export function TopSelling() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Top Selling Items</CardTitle>
        <CardDescription>Highest units sold this period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {topSelling.map((i) => (
          <div key={i.sku} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{i.name}</div>
              <div className="text-xs font-mono text-muted-foreground">{i.sku}</div>
            </div>
            <div className="text-right">
              <div className="text-sm tabular-nums">{i.units} units</div>
              <div className="text-xs text-muted-foreground tabular-nums">${i.revenue.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
