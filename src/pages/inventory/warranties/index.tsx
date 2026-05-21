import * as React from "react"
import { Link } from "react-router-dom"
import { Plus, Search, ShieldCheck } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"

type Row = { code: string; name: string; durationMonths: number; coverage: string; skus: number; status: "active" | "draft" }

const rows: Row[] = [
  { code: "W12", name: "12-month standard", durationMonths: 12, coverage: "Manufacturer defects only", skus: 142, status: "active" },
  { code: "W24", name: "2-year extended", durationMonths: 24, coverage: "Defects + accidental damage", skus: 86, status: "active" },
  { code: "W6", name: "6-month basic", durationMonths: 6, coverage: "Defects only", skus: 320, status: "active" },
  { code: "WLT", name: "Lifetime", durationMonths: 9999, coverage: "All defects, for life of product", skus: 12, status: "active" },
  { code: "W3", name: "Holiday 90-day", durationMonths: 3, coverage: "Defects only, promo-only", skus: 0, status: "draft" },
]

const statusTone: Record<Row["status"], StatusTone> = { active: "success", draft: "neutral" }

export default function Warranties() {
  const [query, setQuery] = React.useState("")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
  }, [query])

  const totalSkus = rows.reduce((s, r) => s + r.skus, 0)
  const active = rows.filter((r) => r.status === "active").length
  const avgLength = Math.round(
    rows.filter((r) => r.durationMonths < 1000).reduce((s, r) => s + r.durationMonths, 0) /
      rows.filter((r) => r.durationMonths < 1000).length,
  )

  return (
    <PageShell
      title="Warranties"
      withToolbar
      titleTooltip={
        <>
          Manufacturer or store guarantees on items — e.g. "12-month
          replacement on electronics." Pallio prints the warranty on
          the customer's receipt and flags returns of covered items so
          you can reclaim against the supplier.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Plans", value: String(rows.length), tone: "brand", hint: "defined" },
            { label: "Active", value: String(active), tone: "success", hint: "live" },
            { label: "Items covered", value: totalSkus.toLocaleString(), tone: "info", hint: "all plans" },
            { label: "Avg length", value: `${avgLength}mo`, tone: "warning", hint: "excl. lifetime" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search plans…" className="pl-9" />
          </div>
          <Link to="/inventory/warranties/new" className="hidden md:inline-flex">
            <Button><Plus className="h-4 w-4" /> Add plan</Button>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={ShieldCheck} title="No plans match" description="Try a different name or code." />
          </CardContent></Card>
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => (
              <li key={r.code} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{r.name} <span className="text-muted-foreground font-mono">({r.code})</span></p>
                    <StatusBadge tone={statusTone[r.status]} withDot>{r.status}</StatusBadge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{r.coverage}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                    {r.durationMonths >= 1000 ? "Lifetime" : `${r.durationMonths} months`} · {r.skus.toLocaleString()} items
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
