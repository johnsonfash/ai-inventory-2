import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Mail, Receipt as ReceiptIcon, Search } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { EmptyState } from "@/components/lists/empty-state"
import { InfoTooltip } from "@/components/info-tooltip"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { RECEIPTS } from "@/lib/sales/data"
import { useCurrency } from "@/contexts/currency"

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function ReceiptsList() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 300)) }, []))
  const [query, setQuery] = React.useState("")
  const { formatPrice, formatCompact } = useCurrency()

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return RECEIPTS
    return RECEIPTS.filter(
      (r) =>
        r.number.toLowerCase().includes(q) ||
        r.customer.name.toLowerCase().includes(q) ||
        r.customer.email.toLowerCase().includes(q),
    )
  }, [query])

  const totalIssued = RECEIPTS.reduce((s, r) => s + r.amountUsd, 0)

  return (
    <PageShell title="Receipts" withToolbar>
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Receipts (30d)", value: String(RECEIPTS.length), tone: "brand", hint: "issued" },
            { label: "Total",         value: formatCompact(totalIssued), tone: "success", hint: "across all" },
            { label: "Emailed",       value: String(RECEIPTS.filter((r) => r.emailedAt).length), tone: "info", hint: "delivered" },
            { label: "Manual print",  value: String(RECEIPTS.filter((r) => !r.emailedAt).length), tone: "warning", hint: "no email yet" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search number, customer, email…" className="pl-9" />
          </div>
          <InfoTooltip label="Receipts" size="xs">
            Receipts are auto-issued when an invoice is fully paid. You can email or print them later from the detail page. Refunded payments leave the original receipt in place + add a credit line.
          </InfoTooltip>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            Icon={ReceiptIcon}
            title="No receipts match"
            description={query ? "Try a different search." : "Receipts will appear here once invoices get paid."}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((r) => (
              <li key={r.id}>
                <Link to={`/sales/receipts/${r.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-brand/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <ReceiptIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{r.customer.name}</p>
                      <p className="shrink-0 text-sm font-bold tabular-nums">{formatPrice(r.amountUsd)}</p>
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground">{r.number}</p>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span>{fmtDate(r.issuedAt)} · {r.paymentMethodSummary}</span>
                      {r.emailedAt ? (
                        <StatusBadge tone="success" withDot><Mail className="h-2.5 w-2.5" /> emailed</StatusBadge>
                      ) : (
                        <StatusBadge tone="warning">not emailed</StatusBadge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
