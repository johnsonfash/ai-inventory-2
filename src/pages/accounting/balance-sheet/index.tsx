import * as React from "react"
import { Banknote, Building2, ClipboardList, CreditCard, Scale, TrendingUp, Wallet } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"

const assets: { name: string; amount: number; sub: string }[] = [
  { name: "Cash", amount: 120000, sub: "Operating + savings" },
  { name: "Accounts receivable", amount: 48200, sub: "Open invoices to customers" },
  { name: "Inventory (at cost)", amount: 182000, sub: "Stock value across warehouses" },
  { name: "Prepaid expenses", amount: 6400, sub: "Rent + insurance" },
  { name: "Equipment (net)", amount: 32000, sub: "POS hardware + delivery vans" },
]

const liabilities: { name: string; amount: number; sub: string }[] = [
  { name: "Accounts payable", amount: 28400, sub: "Open bills to vendors" },
  { name: "Accrued payroll", amount: 14200, sub: "Pending payroll runs" },
  { name: "Sales tax payable", amount: 8420, sub: "Collected, not yet remitted" },
  { name: "Loans (current portion)", amount: 18000, sub: "Bank loan + LoC draws" },
]

const equity: { name: string; amount: number; sub: string }[] = [
  { name: "Owner's equity", amount: 220000, sub: "Initial capital + retained" },
  { name: "Retained earnings", amount: 99580, sub: "Year-to-date profit" },
]

const sum = (xs: { amount: number }[]) => xs.reduce((s, x) => s + x.amount, 0)

export default function BalanceSheet() {
  const [period, setPeriod] = React.useState<Period>("ytd")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const totalAssets = sum(assets)
  const totalLiab = sum(liabilities)
  const totalEquity = sum(equity)
  const totalLE = totalLiab + totalEquity
  const balanced = Math.abs(totalAssets - totalLE) < 1
  const ratio = (totalAssets / Math.max(1, totalLiab)).toFixed(2)

  const exportRows = [
    ...assets.map((a) => ({ Section: "Assets", Account: a.name, Amount: a.amount })),
    ...liabilities.map((a) => ({ Section: "Liabilities", Account: a.name, Amount: a.amount })),
    ...equity.map((a) => ({ Section: "Equity", Account: a.name, Amount: a.amount })),
  ]

  return (
    <ReportShell
      title="Balance sheet"
      description="Snapshot of assets, liabilities, and equity"
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-balance-sheet-${period}`}
      exportRows={exportRows}
    >
      <KpiBand
        items={[
          { title: "Total assets", value: `$${totalAssets.toLocaleString()}`, Icon: Wallet, tone: "violet" },
          { title: "Total liabilities", value: `$${totalLiab.toLocaleString()}`, Icon: CreditCard, tone: "rose" },
          { title: "Total equity", value: `$${totalEquity.toLocaleString()}`, Icon: TrendingUp, tone: "emerald" },
          { title: "Assets ÷ liab.", value: `${ratio}×`, caption: balanced ? "balanced" : "off by 1+", Icon: Scale, tone: balanced ? "emerald" : "amber" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Assets" Icon={Banknote} rows={assets} total={totalAssets} accent="emerald" />
        <Block title="Liabilities" Icon={ClipboardList} rows={liabilities} total={totalLiab} accent="rose" />
        <Block title="Equity" Icon={Building2} rows={equity} total={totalEquity} accent="violet" />

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 lg:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Check</p>
          <Row label="Total assets" value={totalAssets} bold />
          <Row label="Total liabilities + equity" value={totalLE} bold />
          <div className="mt-1 rounded-xl border border-dashed border-border p-3 text-center text-sm">
            {balanced ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Balanced ✓</span>
            ) : (
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                Difference of ${(totalAssets - totalLE).toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Assets = Liabilities + Equity. Any drift indicates an unposted journal entry.
          </p>
        </div>
      </div>
    </ReportShell>
  )
}

function Block({
  title,
  Icon,
  rows,
  total,
  accent,
}: {
  title: string
  Icon: React.ElementType
  rows: { name: string; amount: number; sub: string }[]
  total: number
  accent: "emerald" | "rose" | "violet"
}) {
  const cls = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    violet: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
  }[accent]
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border px-4 py-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${cls}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold md:text-base">{title}</p>
          <p className="text-[11px] text-muted-foreground">{rows.length} accounts</p>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.name} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm">{r.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{r.sub}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">${r.amount.toLocaleString()}</p>
          </li>
        ))}
        <li className="flex items-center justify-between gap-3 bg-muted/40 px-4 py-3">
          <p className="text-sm font-bold">Total</p>
          <p className="text-base font-bold tabular-nums">${total.toLocaleString()}</p>
        </li>
      </ul>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "text-sm font-semibold" : "text-xs text-muted-foreground"}>{label}</span>
      <span className={bold ? "text-base font-bold tabular-nums" : "text-sm tabular-nums"}>${value.toLocaleString()}</span>
    </div>
  )
}
