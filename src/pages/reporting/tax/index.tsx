import * as React from "react"
import { Calculator, Coins, ReceiptText, Scale } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { ChartCard } from "@/components/reports/chart-card"
import { DataTable, type Column } from "@/components/reports/data-table"
import { StatusBadge } from "@/components/lists/status-badge"
import { ChartTooltipContent } from "@/components/ui/chart"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency } from "@/contexts/currency"

type Row = { period: string; collected: number; paid: number; balance: number }

const rows: Row[] = [
  { period: "Q1 2025", collected: 4120, paid: 2860, balance: 1260 },
  { period: "Q2 2025", collected: 4580, paid: 3100, balance: 1480 },
  { period: "Q3 2025", collected: 5210, paid: 3640, balance: 1570 },
  { period: "Q4 2025", collected: 5680, paid: 4020, balance: 1660 },
  { period: "Q1 2026", collected: 6120, paid: 4380, balance: 1740 },
]

const axisProps = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const

export default function TaxReport() {
  const [period, setPeriod] = React.useState<Period>("ytd")
  const { formatPrice, symbol } = useCurrency()
  useRegisterPageRefresh(
    React.useCallback(async () => {
      await new Promise((r) => setTimeout(r, 400))
    }, []),
  )

  const totalCollected = rows.reduce((s, r) => s + r.collected, 0)
  const totalPaid = rows.reduce((s, r) => s + r.paid, 0)
  const totalBalance = totalCollected - totalPaid
  const effectiveRatePct = 8.4

  const cols: Column<Row>[] = [
    { key: "period", header: "Period", primary: true },
    { key: "collected", header: "Collected", align: "right", render: (_, v) => formatPrice(v as number) },
    { key: "paid", header: "Paid", align: "right", render: (_, v) => formatPrice(v as number) },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      render: (r) => (
        <StatusBadge tone={r.balance > 0 ? "warning" : "success"}>
          {formatPrice(r.balance)}
        </StatusBadge>
      ),
    },
  ]

  return (
    <ReportShell
      title="Tax"
      description="VAT / GST collected vs paid by period"
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-tax-${period}`}
      exportRows={rows.map((r) => ({ Period: r.period, Collected: r.collected, Paid: r.paid, Balance: r.balance }))}
    >
      <KpiBand
        items={[
          { title: "Collected", value: formatPrice(totalCollected), delta: "+6%", trend: "up", caption: "year-to-date", Icon: Coins, tone: "emerald" },
          { title: "Paid", value: formatPrice(totalPaid), delta: "+8%", trend: "up", Icon: ReceiptText, tone: "violet" },
          { title: "Balance owed", value: formatPrice(totalBalance), caption: "due to authority", Icon: Scale, tone: "amber" },
          { title: "Effective rate", value: `${effectiveRatePct}%`, caption: "blended", Icon: Calculator, tone: "sky" },
        ]}
      />

      <ChartCard
        title="Collected vs paid"
        description="Quarter-over-quarter"
        legend={[
          { label: "Collected", tone: "var(--chart-2)" },
          { label: "Paid", tone: "var(--chart-1)" },
        ]}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis dataKey="period" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltipContent labelKey="period" />} cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }} />
            <Bar dataKey="collected" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="paid" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Periodic breakdown</p>
          <p className="text-[11px] text-muted-foreground">Per-quarter ledger entries</p>
        </div>
        <div className="p-3">
          <DataTable columns={cols} rows={rows} rowKey={(r) => r.period} />
        </div>
      </div>
    </ReportShell>
  )
}
