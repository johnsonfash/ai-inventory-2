import { Link } from "react-router-dom"
import { AlertTriangle, ArrowRight, PackageX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type LowStockRow = {
  sku: string
  name: string
  category: string
  stock: number
  reorder: number
}

const rows: LowStockRow[] = [
  { sku: "BT-9091", name: "Hydrating Serum", category: "Beauty", stock: 5, reorder: 15 },
  { sku: "AP-4012", name: "Cotton Tee — Black", category: "Apparel", stock: 8, reorder: 20 },
  { sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", category: "Electronics", stock: 12, reorder: 25 },
  { sku: "EL-1001", name: "Wireless Mouse", category: "Electronics", stock: 24, reorder: 30 },
]

function severity(stock: number, reorder: number) {
  if (stock === 0) return "out"
  if (stock <= reorder * 0.4) return "critical"
  if (stock < reorder) return "low"
  return "ok"
}

const severityStyles = {
  out: "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-inset ring-rose-500/30",
  critical: "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-inset ring-rose-500/20",
  low: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/20",
  ok: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/20",
} as const

export function LowStockCard() {
  const lowCount = rows.filter((r) => r.stock < r.reorder).length

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">Low stock alerts</CardTitle>
            <CardDescription>
              <span className="font-medium text-foreground">{lowCount}</span> items at or below their reorder point
            </CardDescription>
          </div>
          <Link
            to="/inventory"
            className="hidden text-xs text-muted-foreground hover:text-foreground sm:inline-flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {rows.map((r) => {
            const sev = severity(r.stock, r.reorder)
            const pct = Math.min(100, (r.stock / r.reorder) * 100)
            return (
              <li key={r.sku}>
                <Link
                  to={`/inventory`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <PackageX className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{r.name}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                          severityStyles[sev],
                        )}
                      >
                        {sev === "out" ? "out" : sev === "critical" ? "critical" : sev === "low" ? "low" : "ok"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground tabular-nums">
                      <span className="truncate">
                        {r.sku} · {r.category}
                      </span>
                      <span>
                        {r.stock} / {r.reorder}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          sev === "out" && "bg-rose-500",
                          sev === "critical" && "bg-rose-500",
                          sev === "low" && "bg-amber-500",
                          sev === "ok" && "bg-emerald-500",
                        )}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
