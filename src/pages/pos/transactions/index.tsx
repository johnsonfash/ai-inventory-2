import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Receipt, RotateCcw, Search } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { listInvoices, listReturns } from "@/lib/pos/storage"
import { cn } from "@/lib/utils"

type Row = {
  type: "invoice" | "return"
  date: number
  id: string
  number: string
  total: number
  customerName: string
}

function relTime(ms: number) {
  const diff = Date.now() - ms
  const m = Math.floor(diff / 60_000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function TransactionsPage() {
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<"all" | "invoice" | "return">("all")
  const [rows, setRows] = React.useState<Row[]>(() => loadRows())

  useRegisterPageRefresh(
    React.useCallback(async () => {
      setRows(loadRows())
      await new Promise((r) => setTimeout(r, 200))
    }, []),
  )

  const filtered = React.useMemo(() => {
    let list = rows
    if (filter !== "all") list = list.filter((r) => r.type === filter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) => r.number.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q),
      )
    }
    return list
  }, [rows, query, filter])

  const sales = rows.filter((r) => r.type === "invoice").reduce((s, r) => s + r.total, 0)
  const refunds = rows.filter((r) => r.type === "return").reduce((s, r) => s + Math.abs(r.total), 0)
  const net = sales - refunds

  return (
    <PageShell title="POS transactions" withToolbar={false}>
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Gross sales", value: `$${sales.toFixed(0)}`, tone: "success", hint: "this period" },
            { label: "Refunds", value: `$${refunds.toFixed(0)}`, tone: "danger", hint: "this period" },
            { label: "Net", value: `$${net.toFixed(0)}`, tone: "brand", hint: "after returns" },
            { label: "Transactions", value: String(rows.length), tone: "info", hint: "total" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by number or customer…" className="pl-9" />
          </div>
        </div>

        {/* Filter pills */}
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:px-0">
          {(["all", "invoice", "return"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                filter === f
                  ? "border-transparent bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {f === "invoice" ? "Sales" : f === "return" ? "Refunds" : "All"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            Icon={Receipt}
            title={rows.length === 0 ? "No transactions yet" : "No transactions match"}
            description={rows.length === 0 ? "Make a sale at the POS to see transactions here." : "Try a different search or filter."}
          />
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => {
              const isInvoice = r.type === "invoice"
              return (
                <li key={`${r.type}-${r.id}`}>
                  <Link
                    to={isInvoice ? `/pos/invoices/${r.id}` : `/pos/returns/${r.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-brand/40"
                  >
                    <span
                      className={
                        isInvoice
                          ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                      }
                    >
                      {isInvoice ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{r.customerName}</p>
                        <p className={cn(
                          "shrink-0 text-sm font-bold tabular-nums",
                          isInvoice ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
                        )}>
                          {isInvoice ? "+" : "−"}${Math.abs(r.total).toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span className="truncate">
                          <span className="font-mono">{r.number}</span> · {relTime(r.date)}
                        </span>
                        <StatusBadge tone={isInvoice ? "success" : "danger"}>
                          {isInvoice ? <Receipt className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                          {isInvoice ? "sale" : "refund"}
                        </StatusBadge>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </PageShell>
  )
}

function loadRows(): Row[] {
  const invoices = listInvoices()
  const returns = listReturns()
  return [
    ...invoices.map((i) => ({
      type: "invoice" as const,
      date: i.createdAt,
      id: i.id,
      number: i.number,
      total: i.total,
      customerName: i.customer?.name || "Walk-in",
    })),
    ...returns.map((r) => ({
      type: "return" as const,
      date: r.createdAt,
      id: r.id,
      number: r.number,
      total: -r.totalRefund,
      customerName: r.customer?.name || "Walk-in",
    })),
  ].sort((a, b) => b.date - a.date)
}
