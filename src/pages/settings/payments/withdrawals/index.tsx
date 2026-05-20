import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowDownToLine, Building2, Plus, Search } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { useCurrency } from "@/contexts/currency"

type Status = "settled" | "in-progress" | "failed"
type Row = { id: string; amount: number; bank: string; reference: string; date: string; status: Status }

const rows: Row[] = [
  { id: "WD-2104", amount: 12400, bank: "Mercury Bank · 1023", reference: "Weekly payout", date: "2026-05-19", status: "settled" },
  { id: "WD-2103", amount: 8420, bank: "Mercury Bank · 5581", reference: "Stripe payout", date: "2026-05-19", status: "in-progress" },
  { id: "WD-2102", amount: 3210, bank: "Wise · 0042", reference: "Atlanta cash drop", date: "2026-05-17", status: "settled" },
  { id: "WD-2101", amount: 920, bank: "Mercury Bank · 1023", reference: "Daily POS cash", date: "2026-05-15", status: "settled" },
  { id: "WD-2100", amount: 580, bank: "Mercury Bank · 4421", reference: "Stripe payout", date: "2026-05-13", status: "failed" },
]

const statusTone: Record<Status, StatusTone> = {
  settled: "success",
  "in-progress": "info",
  failed: "danger",
}

export default function Withdrawals() {
  const [query, setQuery] = React.useState("")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) => r.id.toLowerCase().includes(q) || r.bank.toLowerCase().includes(q) || r.reference.toLowerCase().includes(q),
    )
  }, [query])

  const settled = rows.filter((r) => r.status === "settled").reduce((s, r) => s + r.amount, 0)
  const inProgress = rows.filter((r) => r.status === "in-progress").reduce((s, r) => s + r.amount, 0)
  const failed = rows.filter((r) => r.status === "failed").length

  return (
    <PageShell title="Withdrawals" withToolbar={false}>
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Settled (30d)", value: formatPrice(settled), tone: "success", hint: "landed" },
            { label: "In progress", value: formatPrice(inProgress), tone: "info", hint: "pending" },
            { label: "Failed", value: String(failed), tone: "danger", hint: failed > 0 ? "investigate" : "all good" },
            { label: "Payouts", value: String(rows.length), tone: "brand", hint: "this period" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by reference or bank…" className="pl-9" />
          </div>
          <Link to="/settings/payments/withdrawals/new" className="inline-flex">
            <Button><Plus className="h-4 w-4" /> New withdrawal</Button>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={ArrowDownToLine} title="No withdrawals match" description="Try a different filter." />
          </CardContent></Card>
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                  <ArrowDownToLine className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{r.reference}</p>
                    <p className="shrink-0 text-sm font-bold tabular-nums">{formatPrice(r.amount)}</p>
                  </div>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Building2 className="h-3 w-3" /> {r.bank}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span><span className="font-mono">{r.id}</span> · {r.date}</span>
                    <StatusBadge tone={statusTone[r.status]} withDot>{r.status}</StatusBadge>
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
