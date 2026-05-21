import * as React from "react"
import { PiggyBank, Receipt, TrendingDown, Wallet } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"

type Row = { id: string; date: string; category: string; vendor: string; amount: number }

const rows: Row[] = [
  { id: "EXP-1042", date: "2026-05-19", category: "Logistics", vendor: "DHL", amount: 482 },
  { id: "EXP-1041", date: "2026-05-18", category: "Marketing", vendor: "Meta Ads", amount: 1240 },
  { id: "EXP-1040", date: "2026-05-17", category: "Rent", vendor: "WeWork", amount: 4200 },
  { id: "EXP-1039", date: "2026-05-16", category: "Utilities", vendor: "ConEd", amount: 312 },
  { id: "EXP-1038", date: "2026-05-15", category: "Payroll", vendor: "ADP", amount: 18400 },
]

const cols: Column<Row>[] = [
  { key: "id", header: "ID", render: (_, v) => <span className="font-mono text-xs">{v as string}</span> },
  { key: "date", header: "Date", hideOnMobile: true },
  { key: "category", header: "Category", primary: true },
  { key: "vendor", header: "Vendor" },
  { key: "amount", header: "Amount", align: "right", render: (_, v) => formatPriceFor(v as number) },
]

export default function ExpenseReport() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const total = rows.reduce((s, r) => s + r.amount, 0)
  const largest = rows.reduce((a, b) => (a.amount > b.amount ? a : b))

  return (
    <ReportShell
      title="Expenses"
      description="Operating cost ledger for the period"
      titleTooltip={
        <>
          Drill-down view of every expense entry — rent, logistics,
          utilities, marketing spend — bucketed by category. Use the
          category breakdown to find the line you could cut to push
          your profit margin up.
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-expenses-${period}`}
      exportRows={rows.map((r) => ({ ID: r.id, Date: r.date, Category: r.category, Vendor: r.vendor, Amount: r.amount }))}
    >
      <KpiBand
        items={[
          { title: "Total spend", value: formatPrice(total), delta: "−4%", trend: "down", caption: "vs last period", Icon: Wallet, tone: "rose" },
          { title: "Largest", value: formatPrice(largest.amount), caption: largest.category, Icon: TrendingDown, tone: "amber" },
          { title: "Entries", value: String(rows.length), Icon: Receipt, tone: "violet" },
          { title: "Avg per entry", value: formatPrice(Math.round(total / rows.length)), Icon: PiggyBank, tone: "emerald" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Expense entries</p>
          <p className="text-[11px] text-muted-foreground">All entries for the selected period</p>
        </div>
        <div className="p-3">
          <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
        </div>
      </div>
    </ReportShell>
  )
}
