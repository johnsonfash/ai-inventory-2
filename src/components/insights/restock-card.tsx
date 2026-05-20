import { Link } from "react-router-dom"
import { AlertTriangle, ArrowRight, Boxes, ChevronRight } from "lucide-react"
import { InfoTooltip } from "@/components/info-tooltip"
import { Button } from "@/components/ui/button"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { cn } from "@/lib/utils"

type Item = {
  sku: string
  name: string
  stock: number
  reorderPoint: number
  /** "AI" suggested reorder quantity. */
  suggested: number
  /** Estimated days of stock left at the current sales pace. */
  daysLeft: number
}

// Dummy data — when a real backend lands, swap for an
// `api.get('/insights/restock')` call.
const ITEMS: Item[] = [
  { sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", stock: 18, reorderPoint: 20, suggested: 60, daysLeft: 4 },
  { sku: "AP-4012", name: "Cotton Tee — Black", stock: 9, reorderPoint: 12, suggested: 48, daysLeft: 3 },
  { sku: "HM-2205", name: "Ceramic Mug 12oz", stock: 4, reorderPoint: 10, suggested: 36, daysLeft: 2 },
  { sku: "BT-9091", name: "Hydrating Serum", stock: 0, reorderPoint: 8, suggested: 24, daysLeft: 0 },
  { sku: "EL-1001", name: "Wireless Mouse", stock: 14, reorderPoint: 15, suggested: 30, daysLeft: 6 },
]

function severityFromDays(days: number, stock: number): { tone: StatusTone; label: string } {
  if (stock === 0) return { tone: "danger", label: "Out" }
  if (days <= 2) return { tone: "danger", label: "Critical" }
  if (days <= 5) return { tone: "warning", label: "Low" }
  return { tone: "info", label: "Watch" }
}

// "Suggested restock" card. Pallio looks at days-of-stock-left
// (mock) and surfaces the top 5 SKUs the user should reorder, with
// a one-tap "Create PO" CTA per item. The "AI" framing is honest —
// it's rule-based now; a real ML model can replace the data source
// later without touching the UI.
export function RestockCard({ className }: { className?: string }) {
  const totalUnits = ITEMS.reduce((s, i) => s + i.suggested, 0)

  return (
    <section className={cn("flex flex-col gap-3 rounded-2xl border border-border bg-card p-4", className)}>
      <header className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <Boxes className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-sm font-semibold md:text-base">Suggested restock</h3>
            <InfoTooltip label="Suggested restock" size="xs">
              Items running low based on current stock + the rolling
              28‑day sales pace. The "Suggested" quantity targets a
              30‑day buffer above each item's reorder point. Hit
              "Create PO" to draft a purchase order pre-filled with
              all 5.
            </InfoTooltip>
          </div>
          <p className="text-[11px] text-muted-foreground">{ITEMS.length} items · suggested total {totalUnits} units</p>
        </div>
        <Link to="/purchasing/pos/new">
          <Button size="sm">
            Create PO
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </header>

      <ul className="divide-y divide-border">
        {ITEMS.map((it) => {
          const sev = severityFromDays(it.daysLeft, it.stock)
          return (
            <li key={it.sku}>
              <Link
                to="/inventory"
                className="flex items-center gap-3 py-2.5 transition-colors hover:bg-accent/30 -mx-2 rounded-md px-2"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {it.stock === 0 ? (
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <Boxes className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{it.name}</p>
                    <StatusBadge tone={sev.tone} withDot>{sev.label}</StatusBadge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    <span className="font-mono">{it.sku}</span> · stock <span className="font-bold tabular-nums text-foreground">{it.stock}</span>
                    {it.stock > 0 && <> · ~<span className="tabular-nums">{it.daysLeft}d</span> left</>}
                    {" · suggest "}
                    <span className="font-bold tabular-nums text-brand dark:text-primary">+{it.suggested}</span>
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
