import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Plus, Search, TicketPercent } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { EmptyState } from "@/components/lists/empty-state"
import { SummaryStrip } from "@/components/lists/summary-strip"

type Row = {
  code: string
  type: "percent" | "flat"
  value: number
  uses: number
  cap?: number
  status: "active" | "scheduled" | "expired"
}

const rows: Row[] = [
  { code: "SUMMER20", type: "percent", value: 20, uses: 142, cap: 500, status: "active" },
  { code: "WELCOME10", type: "percent", value: 10, uses: 412, status: "active" },
  { code: "BLACKFRI", type: "percent", value: 30, uses: 0, cap: 1000, status: "scheduled" },
  { code: "VIP25", type: "flat", value: 25, uses: 84, cap: 200, status: "active" },
  { code: "WINTER15", type: "percent", value: 15, uses: 220, status: "expired" },
]

const tone: Record<Row["status"], StatusTone> = { active: "success", scheduled: "info", expired: "neutral" }

export default function Discounts() {
  const isMobile = useIsMobile()
  const [query, setQuery] = React.useState("")

  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.code.toLowerCase().includes(q))
  }, [query])

  const active = rows.filter((r) => r.status === "active").length
  const totalUses = rows.reduce((s, r) => s + r.uses, 0)
  const scheduled = rows.filter((r) => r.status === "scheduled").length

  return (
    <PageShell
      title="Discounts"
      withToolbar
      titleTooltip={
        <>
          Promo codes customers can type at checkout — percent off,
          flat amount, audience-restricted. Each row shows live
          redemption count and how much margin you're giving away so
          you can spot runaway promos.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Active codes", value: String(active), tone: "success", hint: "live now" },
            { label: "Total uses", value: totalUses.toLocaleString(), tone: "brand", hint: "redemptions" },
            { label: "Scheduled", value: String(scheduled), tone: "info", hint: "queued" },
            { label: "All codes", value: String(rows.length), tone: "warning", hint: "tracked" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by code…" className="pl-9" />
          </div>
          <Link to="/sales/discounts/new" className="hidden md:inline-flex">
            <Button><Plus className="h-4 w-4" /> New discount</Button>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={TicketPercent} title="No codes match" description="Try a different code prefix." />
          </CardContent></Card>
        ) : isMobile ? (
          <ul className="space-y-2">
            {filtered.map((r) => (
              <li key={r.code}>
                <Link to="/sales/discounts" className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                    <TicketPercent className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-mono font-semibold">{r.code}</p>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">
                        {r.type === "percent" ? `${r.value}%` : `$${r.value}`} off
                      </p>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span>{r.uses} uses{r.cap ? ` · cap ${r.cap}` : ""}</span>
                      <StatusBadge tone={tone[r.status]}>{r.status}</StatusBadge>
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
                  <th className="px-3 py-2.5 font-medium">Discount</th>
                  <th className="px-3 py-2.5 text-right font-medium">Uses</th>
                  <th className="px-3 py-2.5 text-right font-medium">Cap</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.code} className="transition-colors hover:bg-accent/30">
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{r.code}</td>
                    <td className="px-3 py-2.5 tabular-nums">{r.type === "percent" ? `${r.value}%` : `$${r.value}`}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{r.uses}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{r.cap ?? "—"}</td>
                    <td className="px-3 py-2.5"><StatusBadge tone={tone[r.status]} withDot>{r.status}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  )
}
