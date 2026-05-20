import * as React from "react"
import { DollarSign, Percent, Receipt, TrendingUp } from "lucide-react"
import {
  Area,
  AreaChart,
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
import { useCurrency } from "@/contexts/currency"

type MonthlyRow = { month: string; revenue: number; cogs: number; expenses: number; profit: number }

const monthly: MonthlyRow[] = [
  { month: "Dec", revenue: 28200, cogs: 14800, expenses: 6900, profit: 6500 },
  { month: "Jan", revenue: 31200, cogs: 16100, expenses: 7100, profit: 8000 },
  { month: "Feb", revenue: 29800, cogs: 15200, expenses: 7400, profit: 7200 },
  { month: "Mar", revenue: 34500, cogs: 17100, expenses: 7800, profit: 9600 },
  { month: "Apr", revenue: 38100, cogs: 18400, expenses: 8100, profit: 11600 },
  { month: "May", revenue: 42300, cogs: 19800, expenses: 8400, profit: 14100 },
]

const expenseBreakdown = [
  { category: "Rent", amount: 4200 },
  { category: "Payroll", amount: 18400 },
  { category: "Marketing", amount: 3600 },
  { category: "Logistics", amount: 5200 },
  { category: "Utilities", amount: 1800 },
  { category: "Other", amount: 2200 },
]

const axisProps = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const

export default function ProfitLoss() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice, symbol } = useCurrency()
  useRegisterPageRefresh(
    React.useCallback(async () => {
      await new Promise((r) => setTimeout(r, 400))
    }, []),
  )

  const totalRevenue = monthly.reduce((s, r) => s + r.revenue, 0)
  const totalCogs = monthly.reduce((s, r) => s + r.cogs, 0)
  const totalExpenses = monthly.reduce((s, r) => s + r.expenses, 0)
  const totalProfit = totalRevenue - totalCogs - totalExpenses
  const grossMarginPct = ((totalRevenue - totalCogs) / totalRevenue) * 100
  const netMarginPct = (totalProfit / totalRevenue) * 100

  const exportRows = monthly.map((m) => ({
    Month: m.month,
    Revenue: m.revenue,
    COGS: m.cogs,
    Expenses: m.expenses,
    "Net profit": m.profit,
  }))

  const breakdownCols: Column<(typeof expenseBreakdown)[number]>[] = [
    { key: "category", header: "Category", primary: true },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (_, v) => formatPrice(v as number),
    },
  ]

  return (
    <ReportShell
      title="Profit & Loss"
      description="Net profit, gross margin, and expense composition"
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-profit-loss-${period}`}
      exportRows={exportRows}
    >
      <KpiBand
        items={[
          {
            title: "Revenue",
            value: formatPrice(Math.round(totalRevenue)),
            delta: "+12.3%",
            trend: "up",
            caption: "vs prior period",
            Icon: DollarSign,
            tone: "violet",
            data: monthly.map((m, i) => ({ x: i, y: m.revenue })),
          },
          {
            title: "Net profit",
            value: formatPrice(Math.round(totalProfit)),
            delta: "+18.6%",
            trend: "up",
            caption: "after COGS + opex",
            Icon: TrendingUp,
            tone: "emerald",
            data: monthly.map((m, i) => ({ x: i, y: m.profit })),
          },
          {
            title: "Gross margin",
            value: `${grossMarginPct.toFixed(1)}%`,
            delta: "+1.4 pp",
            trend: "up",
            Icon: Percent,
            tone: "amber",
            data: monthly.map((m, i) => ({
              x: i,
              y: ((m.revenue - m.cogs) / m.revenue) * 100,
            })),
          },
          {
            title: "Net margin",
            value: `${netMarginPct.toFixed(1)}%`,
            delta: "+2.1 pp",
            trend: "up",
            Icon: Receipt,
            tone: "fuchsia",
            data: monthly.map((m, i) => ({ x: i, y: (m.profit / m.revenue) * 100 })),
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Net profit trend"
          description="Monthly net profit after COGS and expenses"
          legend={[{ label: "Net profit", tone: "var(--chart-1)" }]}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                content={<ChartTooltipContent labelKey="month" />}
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="profit" stroke="var(--chart-1)" strokeWidth={2.4} fill="url(#pl-grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Composition"
          description="Revenue vs cost stack"
          legend={[
            { label: "Revenue", tone: "var(--chart-2)" },
            { label: "COGS", tone: "var(--chart-4)" },
            { label: "Expenses", tone: "var(--chart-3)" },
          ]}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }} />
              <Bar dataKey="revenue" fill="var(--chart-2)" radius={[4, 4, 0, 0]} stackId="x" />
              <Bar dataKey="cogs" fill="var(--chart-4)" radius={[0, 0, 0, 0]} stackId="y" />
              <Bar dataKey="expenses" fill="var(--chart-3)" radius={[4, 4, 0, 0]} stackId="y" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Expense breakdown" description="Largest cost categories" height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expenseBreakdown} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis type="number" {...axisProps} tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="category" width={80} {...axisProps} />
              <Tooltip
                content={<ChartTooltipContent labelKey="category" />}
                cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }}
              />
              <Bar dataKey="amount" fill="var(--chart-3)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Expense table</p>
            <p className="text-[11px] text-muted-foreground">All categories included in the period</p>
          </div>
          <div className="p-3">
            <DataTable columns={breakdownCols} rows={expenseBreakdown} rowKey={(r) => r.category} />
          </div>
        </div>
      </div>
    </ReportShell>
  )
}
