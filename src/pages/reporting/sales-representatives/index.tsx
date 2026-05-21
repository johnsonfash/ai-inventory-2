import * as React from "react"
import { Award, DollarSign, ShoppingCart, Users } from "lucide-react"
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

type Rep = {
  rep: string
  region: string
  orders: number
  revenue: number
  avgOrder: number
  attainmentPct: number
}

const reps: Rep[] = [
  { rep: "Mia Chen", region: "West", orders: 42, revenue: 12400, avgOrder: 295.2, attainmentPct: 124 },
  { rep: "Alex Larson", region: "East", orders: 38, revenue: 11680, avgOrder: 307.4, attainmentPct: 116 },
  { rep: "Daniel Kim", region: "Central", orders: 31, revenue: 9420, avgOrder: 303.9, attainmentPct: 94 },
  { rep: "Priya Patel", region: "West", orders: 28, revenue: 8610, avgOrder: 307.5, attainmentPct: 86 },
  { rep: "Tomás Ruiz", region: "South", orders: 22, revenue: 5840, avgOrder: 265.5, attainmentPct: 58 },
]

const axisProps = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const

function initialsOf(name: string) {
  return name.split(/\s+/).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("")
}

function avatarTint(name: string) {
  const palette = [
    "bg-brand/15 text-brand dark:bg-primary/20 dark:text-primary",
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]!
}

export default function SalesRepresentatives() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice, symbol } = useCurrency()
  useRegisterPageRefresh(
    React.useCallback(async () => {
      await new Promise((r) => setTimeout(r, 400))
    }, []),
  )

  const totalOrders = reps.reduce((s, r) => s + r.orders, 0)
  const totalRevenue = reps.reduce((s, r) => s + r.revenue, 0)
  const avgAttainment = Math.round(reps.reduce((s, r) => s + r.attainmentPct, 0) / reps.length)

  const sorted = [...reps].sort((a, b) => b.revenue - a.revenue)
  const top = sorted[0]!

  const cols: Column<Rep>[] = [
    {
      key: "rep",
      header: "Rep",
      primary: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${avatarTint(r.rep)}`}>
            {initialsOf(r.rep)}
          </span>
          <span className="truncate">{r.rep}</span>
        </div>
      ),
    },
    { key: "region", header: "Region", hideOnMobile: true },
    { key: "orders", header: "Orders", align: "right" },
    {
      key: "revenue",
      header: "Revenue",
      align: "right",
      render: (_, v) => formatPrice(v as number),
    },
    {
      key: "avgOrder",
      header: "Avg order",
      align: "right",
      hideOnMobile: true,
      render: (_, v) => formatPrice(v as number),
    },
    {
      key: "attainmentPct",
      header: "Attainment",
      align: "right",
      render: (r) => (
        <StatusBadge tone={r.attainmentPct >= 100 ? "success" : r.attainmentPct >= 80 ? "warning" : "danger"}>
          {r.attainmentPct}%
        </StatusBadge>
      ),
    },
  ]

  const exportRows = reps.map((r) => ({
    Rep: r.rep,
    Region: r.region,
    Orders: r.orders,
    Revenue: r.revenue,
    "Avg order": Number(r.avgOrder.toFixed(2)),
    "Attainment %": r.attainmentPct,
  }))

  return (
    <ReportShell
      title="Sales representatives"
      description="Team performance ranked by revenue, orders, and attainment"
      titleTooltip={
        <>
          The official rep scorecard. Ranks each team member by total
          revenue rung up + their attainment vs target. The numbers
          here drive the commission calculation in
          <strong> Marketing → Commissions</strong>.
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-sales-reps-${period}`}
      exportRows={exportRows}
    >
      <KpiBand
        items={[
          { title: "Top rep", value: top.rep.split(" ")[0] ?? top.rep, delta: `${top.attainmentPct}% of goal`, trend: "up", Icon: Award, tone: "amber" },
          { title: "Total revenue", value: formatPrice(totalRevenue), delta: "+18%", trend: "up", caption: "vs last period", Icon: DollarSign, tone: "violet" },
          { title: "Orders", value: totalOrders.toLocaleString(), Icon: ShoppingCart, tone: "emerald" },
          { title: "Avg attainment", value: `${avgAttainment}%`, delta: avgAttainment >= 100 ? "Above goal" : "Below goal", trend: avgAttainment >= 100 ? "up" : "down", Icon: Users, tone: "sky" },
        ]}
      />

      <ChartCard
        title="Revenue by rep"
        description="Comparative performance"
        legend={[
          { label: "Revenue", tone: "var(--chart-1)" },
          { label: "Orders × 100", tone: "var(--chart-2)" },
        ]}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted.map((r) => ({ rep: r.rep.split(" ")[0], revenue: r.revenue, orders100: r.orders * 100 }))} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis dataKey="rep" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltipContent labelKey="rep" />} cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }} />
            <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="orders100" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Detailed leaderboard</p>
          <p className="text-[11px] text-muted-foreground">All reps for the selected period</p>
        </div>
        <div className="p-3">
          <DataTable columns={cols} rows={sorted} rowKey={(r) => r.rep} />
        </div>
      </div>
    </ReportShell>
  )
}
