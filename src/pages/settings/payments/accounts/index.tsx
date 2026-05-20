import * as React from "react"
import { Link } from "react-router-dom"
import { Banknote, Building2, Edit3, Plus, Search, Trash2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"

type Row = {
  id: string
  bank: string
  accountNumber: string
  accountName: string
  location: string
  cashier: string
  status: "verified" | "pending" | "disabled"
}

const rows: Row[] = [
  { id: "VA-001", bank: "Mercury Bank", accountNumber: "0321 4482 1023", accountName: "Pallio Ops — Austin", location: "Downtown Austin", cashier: "Mia Chen", status: "verified" },
  { id: "VA-002", bank: "Mercury Bank", accountNumber: "0321 4482 5581", accountName: "Pallio Ops — Austin 2", location: "Downtown Austin", cashier: "Alex Larson", status: "verified" },
  { id: "VA-003", bank: "Wise", accountNumber: "9011 2255 0042", accountName: "Pallio Atlanta", location: "East DC", cashier: "Priya Patel", status: "pending" },
  { id: "VA-004", bank: "Mercury Bank", accountNumber: "0321 9201 4421", accountName: "Pallio West Hub", location: "West Hub", cashier: "Daniel Kim", status: "disabled" },
]

const statusTone: Record<Row["status"], StatusTone> = {
  verified: "success",
  pending: "warning",
  disabled: "neutral",
}

export default function PaymentAccounts() {
  const [query, setQuery] = React.useState("")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) => r.bank.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.cashier.toLowerCase().includes(q),
    )
  }, [query])

  const verified = rows.filter((r) => r.status === "verified").length
  const banks = new Set(rows.map((r) => r.bank)).size

  return (
    <PageShell title="Withdrawal accounts" withToolbar={false}>
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Accounts", value: String(rows.length), tone: "brand", hint: "configured" },
            { label: "Verified", value: String(verified), tone: "success", hint: "live" },
            { label: "Banks", value: String(banks), tone: "info", hint: "distinct" },
            { label: "Locations", value: String(new Set(rows.map((r) => r.location)).size), tone: "warning", hint: "covered" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by bank, location, or cashier…" className="pl-9" />
          </div>
          <Link to="/settings/payments/accounts/new" className="inline-flex">
            <Button><Plus className="h-4 w-4" /> Add account</Button>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={Banknote} title="No accounts match" description="Try a different filter or add a new account." />
          </CardContent></Card>
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Building2 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{r.bank}</p>
                    <StatusBadge tone={statusTone[r.status]} withDot>{r.status}</StatusBadge>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{r.accountNumber}</p>
                  <p className="text-[11px] text-muted-foreground">{r.accountName}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                    <StatusBadge tone="info">{r.location}</StatusBadge>
                    <span>· {r.cashier}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="sm" variant="ghost" aria-label="Edit"><Edit3 className="h-3.5 w-3.5" aria-hidden="true" /></Button>
                  <Button size="sm" variant="ghost" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
