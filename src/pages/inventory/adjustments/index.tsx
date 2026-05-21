import * as React from "react"
import { ArrowDownRight, ArrowUpRight, ClipboardCheck, Package, Search } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"

type Row = { id: string; sku: string; qty: number; reason: string; user: string; date: string; location: string }

const rows: Row[] = [
  { id: "ADJ-2104", sku: "EL-2109", qty: -8, reason: "Damaged in transit", user: "Alex Larson", date: "2026-05-19", location: "WH-A" },
  { id: "ADJ-2103", sku: "AP-4012", qty: -3, reason: "Theft (camera review)", user: "Mia Chen", date: "2026-05-17", location: "Downtown" },
  { id: "ADJ-2102", sku: "HM-2205", qty: 12, reason: "Found in transit", user: "Priya Patel", date: "2026-05-15", location: "WH-C" },
  { id: "ADJ-2101", sku: "BT-9091", qty: -5, reason: "Expired", user: "system", date: "2026-05-12", location: "WH-A" },
  { id: "ADJ-2100", sku: "EL-1001", qty: 24, reason: "Manual recount", user: "Daniel Kim", date: "2026-05-10", location: "WH-B" },
]

export default function Adjustments() {
  const [query, setQuery] = React.useState("")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      r.id.toLowerCase().includes(q) ||
      r.sku.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q),
    )
  }, [query])

  const positives = rows.filter((r) => r.qty > 0).reduce((s, r) => s + r.qty, 0)
  const negatives = rows.filter((r) => r.qty < 0).reduce((s, r) => s + r.qty, 0)
  const net = positives + negatives

  return (
    <PageShell
      title="Stock adjustments"
      withToolbar
      titleTooltip={
        <>
          Manual changes to your on-hand count — for shrinkage,
          spoilage, breakage, theft, or just a recount that didn't
          match the system. Logged separately so your auditor can see
          why the count moved without a sale or PO.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Net change", value: `${net > 0 ? "+" : ""}${net}`, tone: net >= 0 ? "success" : "danger", hint: "units" },
            { label: "Write-ons", value: `+${positives}`, tone: "success", hint: "added" },
            { label: "Write-offs", value: String(negatives), tone: "danger", hint: "removed" },
            { label: "Entries", value: String(rows.length), tone: "brand", hint: "logged" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by SKU, reason, or ID…" className="pl-9" />
          </div>
          <Button className="hidden md:inline-flex"><Package className="h-4 w-4" /> New adjustment</Button>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={ClipboardCheck} title="No adjustments match" description="Try a different SKU or reason." />
          </CardContent></Card>
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                <span className={
                  r.qty < 0
                    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                }>
                  {r.qty < 0 ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold"><span className="font-mono">{r.sku}</span></p>
                    <p className={
                      r.qty < 0
                        ? "shrink-0 text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400"
                        : "shrink-0 text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400"
                    }>
                      {r.qty > 0 ? `+${r.qty}` : r.qty}
                    </p>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{r.reason}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                    <StatusBadge tone="neutral">{r.location}</StatusBadge>
                    <span><span className="font-mono">{r.id}</span> · by {r.user} · {r.date}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
