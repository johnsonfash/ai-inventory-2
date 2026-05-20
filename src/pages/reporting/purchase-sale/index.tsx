import * as React from "react"
import { ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, Wallet } from "lucide-react"
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
import { ChartTooltipContent } from "@/components/ui/chart"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"

type Row = { month: string; purchases: number; sales: number; net: number }

const rows: Row[] = [
  { month: "Dec", purchases: 18400, sales: 28200, net: 9800 },
  { month: "Jan", purchases: 19800, sales: 31200, net: 11400 },
  { month: "Feb", purchases: 21200, sales: 29800, net: 8600 },
  { month: "Mar", purchases: 22600, sales: 34500, net: 11900 },
  { month: "Apr", purchases: 24100, sales: 38100, net: 14000 },
  { month: "May", purchases: 25800, sales: 42300, net: 16500 },
]

const axisProps = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const

const cols: Column<Row>[] = [
  { key: "month", header: "Month", primary: true },
  { key: "sales", header: "Sales", align: "right", render: (_, v) => `$${(v as number).toLocaleString()}` },
  { key: "purchases", header: "Purchases", align: "right", render: (_, v) => `$${(v as number).toLocaleString()}` },
  { key: "net", header: "Net", align: "right", render: (_, v) => `$${(v as number).toLocaleString()}` },
]

export default function PurchaseSale() {
  const [period, setPeriod] = React.useState<Period>("30d")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const totalSales = rows.reduce((s, r) => s + r.sales, 0)
  const totalPurchases = rows.reduce((s, r) => s + r.purchases, 0)
  const totalNet = totalSales - totalPurchases

  return (
    <ReportShell
      title="Purchase & sale"
      description="Inflow vs outflow comparison"
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-purchase-sale-${period}`}
      exportRows={rows.map((r) => ({ Month: r.month, Sales: r.sales, Purchases: r.purchases, Net: r.net }))}
    >
      <KpiBand
        items={[
          { title: "Sales", value: `$${totalSales.toLocaleString()}`, delta: "+18%", trend: "up", Icon: ArrowUpFromLine, tone: "emerald" },
          { title: "Purchases", value: `$${totalPurchases.toLocaleString()}`, delta: "+8%", trend: "up", Icon: ArrowDownToLine, tone: "violet" },
          { title: "Net", value: `$${totalNet.toLocaleString()}`, Icon: Wallet, tone: "amber" },
          { title: "Ratio", value: `${(totalSales / totalPurchases).toFixed(2)}×`, caption: "sales / purchases", Icon: ArrowLeftRight, tone: "sky" },
        ]}
      />
      <ChartCard
        title="Monthly comparison"
        description="Sales bars vs purchase bars"
        legend={[
          { label: "Sales", tone: "var(--chart-2)" },
          { label: "Purchases", tone: "var(--chart-1)" },
        ]}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltipContent labelKey="month" />} cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }} />
            <Bar dataKey="sales" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="purchases" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Monthly ledger</p></div>
        <div className="p-3">
          <DataTable columns={cols} rows={rows} rowKey={(r) => r.month} />
        </div>
      </div>
    </ReportShell>
  )
}
