import * as React from "react"
import { Link } from "react-router-dom"
import { Boxes, ChevronRight, MapPin, Plus, Search, Warehouse } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { AddWarehouseDialog, type QuickWarehouse } from "@/components/dialogs/add-warehouse-dialog"
import { useAutoMarkStep } from "@/hooks/use-auto-mark-step"

type Row = {
  code: string
  name: string
  location: string
  manager: string
  utilizationPct: number
  skus: number
  status: "active" | "maintenance" | "archived"
}

const SEED_WAREHOUSES: Row[] = [
  { code: "WH-A", name: "Main Warehouse", location: "Austin, TX", manager: "Mia Chen", utilizationPct: 78, skus: 642, status: "active" },
  { code: "WH-B", name: "East DC", location: "Atlanta, GA", manager: "Alex Larson", utilizationPct: 64, skus: 412, status: "active" },
  { code: "WH-C", name: "West Hub", location: "Portland, OR", manager: "Priya Patel", utilizationPct: 92, skus: 218, status: "active" },
  { code: "WH-D", name: "Overflow", location: "Phoenix, AZ", manager: "Daniel Kim", utilizationPct: 12, skus: 56, status: "maintenance" },
]

const statusTone: Record<Row["status"], StatusTone> = {
  active: "success",
  maintenance: "warning",
  archived: "neutral",
}

export default function Warehouses() {
  useAutoMarkStep("warehouses")
  const isMobile = useIsMobile()
  const [query, setQuery] = React.useState("")

  const [rows, setRows] = React.useState<Row[]>(SEED_WAREHOUSES)
  const [addOpen, setAddOpen] = React.useState(false)

  const handleCreate = (w: QuickWarehouse) => {
    setRows((prev) => [{ ...w, utilizationPct: 0, skus: 0, status: "active" }, ...prev])
  }

  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q),
    )
  }, [query, rows])

  const totalSkus = rows.reduce((s, r) => s + r.skus, 0)
  const activeCount = rows.filter((r) => r.status === "active").length
  const avgUtil = Math.round(rows.reduce((s, r) => s + r.utilizationPct, 0) / rows.length)
  const overCapacity = rows.filter((r) => r.utilizationPct >= 90).length

  return (
    <PageShell
      title="Warehouses"
      withToolbar={false}
      titleTooltip={
        <>
          Every physical place you keep stock — flagship store, back-
          room, pop-up at a market, supplier warehouse. Pallio tracks
          stock per location so you can see exactly where each unit
          lives, transfer between them, and route POs to the right
          dock.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Locations", value: String(rows.length), tone: "brand", hint: "configured" },
            { label: "Active", value: String(activeCount), tone: "success", hint: "operating" },
            { label: "SKUs", value: totalSkus.toLocaleString(), tone: "info", hint: "across all" },
            { label: "Avg utilization", value: `${avgUtil}%`, tone: overCapacity > 0 ? "warning" : "success", hint: overCapacity > 0 ? `${overCapacity} near full` : "healthy" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by code, name, or city…" className="pl-9" />
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add warehouse</Button>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState
              Icon={Warehouse}
              title="No warehouses match"
              description="Try a different code or city name."
              action={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add warehouse</Button>}
            />
          </CardContent></Card>
        ) : isMobile ? (
          <ul className="space-y-2">
            {filtered.map((r) => (
              <li key={r.code}>
                <Link to={`/settings/warehouses/${r.code}/edit`} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                    <Warehouse className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <StatusBadge tone={statusTone[r.status]}>{r.status}</StatusBadge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      <span className="font-mono">{r.code}</span> · <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.location}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{r.skus} SKUs · {r.manager}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={
                            r.utilizationPct >= 90
                              ? "h-1.5 rounded-full bg-rose-500"
                              : r.utilizationPct >= 70
                                ? "h-1.5 rounded-full bg-amber-500"
                                : "h-1.5 rounded-full bg-emerald-500"
                          }
                          style={{ width: `${r.utilizationPct}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{r.utilizationPct}%</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Code</th>
                  <th className="px-3 py-2.5 font-medium">Name</th>
                  <th className="px-3 py-2.5 font-medium">Location</th>
                  <th className="px-3 py-2.5 font-medium">Manager</th>
                  <th className="px-3 py-2.5 text-right font-medium">SKUs</th>
                  <th className="px-3 py-2.5 font-medium">Utilization</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 text-right font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.code} className="transition-colors hover:bg-accent/30">
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{r.code}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
                        {r.name}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.location}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.manager}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{r.skus.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={
                              r.utilizationPct >= 90
                                ? "h-1.5 rounded-full bg-rose-500"
                                : r.utilizationPct >= 70
                                  ? "h-1.5 rounded-full bg-amber-500"
                                  : "h-1.5 rounded-full bg-emerald-500"
                            }
                            style={{ width: `${r.utilizationPct}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">{r.utilizationPct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge tone={statusTone[r.status]} withDot>{r.status}</StatusBadge></td>
                    <td className="px-3 py-2.5 text-right">
                      <Button size="sm" variant="ghost" asChild><Link to={`/settings/warehouses/${r.code}/edit`}>Edit</Link></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddWarehouseDialog open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreate} />
    </PageShell>
  )
}
