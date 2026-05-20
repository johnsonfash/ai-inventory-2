import * as React from "react"
import { Flame, ShoppingCart, Sparkles, TrendingUp } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { ChartCard } from "@/components/reports/chart-card"
import { RankedList } from "@/components/reports/ranked-list"
import { StatusBadge } from "@/components/lists/status-badge"
import { ChartTooltipContent } from "@/components/ui/chart"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"

type Trending = {
  sku: string
  name: string
  category: string
  units: number
  revenue: number
  deltaPct: number
  series: number[]
}

const trending: Trending[] = [
  { sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", category: "Electronics", units: 320, revenue: 8120, deltaPct: 42, series: [180, 200, 220, 240, 260, 280, 320] },
  { sku: "AP-4012", name: "Cotton Tee — Black", category: "Apparel", units: 280, revenue: 3360, deltaPct: 31, series: [180, 190, 210, 220, 240, 260, 280] },
  { sku: "HM-2205", name: "Ceramic Mug 12oz", category: "Home", units: 190, revenue: 1520, deltaPct: 26, series: [120, 130, 140, 150, 160, 180, 190] },
  { sku: "BT-9091", name: "Hydrating Serum", category: "Beauty", units: 120, revenue: 2274, deltaPct: 18, series: [88, 95, 102, 108, 110, 116, 120] },
  { sku: "EL-1001", name: "Wireless Mouse", category: "Electronics", units: 96, revenue: 2112, deltaPct: 12, series: [70, 76, 80, 84, 88, 92, 96] },
]

const aggregateSeries = (() => {
  const len = trending[0]!.series.length
  const out: { day: string; units: number }[] = []
  for (let i = 0; i < len; i++) {
    let total = 0
    for (const t of trending) total += t.series[i] ?? 0
    out.push({ day: `D${i + 1}`, units: total })
  }
  return out
})()

const axisProps = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const

export default function TrendingProduct() {
  const [period, setPeriod] = React.useState<Period>("30d")
  useRegisterPageRefresh(
    React.useCallback(async () => {
      await new Promise((r) => setTimeout(r, 400))
    }, []),
  )

  const totalUnits = trending.reduce((s, t) => s + t.units, 0)
  const totalRevenue = trending.reduce((s, t) => s + t.revenue, 0)
  const winner = trending[0]!
  const maxUnits = Math.max(...trending.map((t) => t.units))

  const exportRows = trending.map((t) => ({
    SKU: t.sku,
    Name: t.name,
    Category: t.category,
    "Units sold": t.units,
    Revenue: t.revenue,
    "Delta vs last period (%)": t.deltaPct,
  }))

  return (
    <ReportShell
      title="Trending products"
      description="Top sellers and growth leaders for the period"
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-trending-${period}`}
      exportRows={exportRows}
    >
      <KpiBand
        items={[
          { title: "Top SKU", value: winner.name.split(" ")[0] ?? winner.name, delta: `+${winner.deltaPct}%`, trend: "up", caption: winner.sku, Icon: Flame, tone: "amber", data: winner.series.map((y, i) => ({ x: i, y })) },
          { title: "Units sold", value: totalUnits.toLocaleString(), delta: "+18%", trend: "up", Icon: ShoppingCart, tone: "violet", data: aggregateSeries.map((d, i) => ({ x: i, y: d.units })) },
          { title: "Revenue", value: `$${totalRevenue.toLocaleString()}`, delta: "+22%", trend: "up", Icon: TrendingUp, tone: "emerald" },
          { title: "Avg uplift", value: `+${Math.round(trending.reduce((s, t) => s + t.deltaPct, 0) / trending.length)}%`, caption: "across top 5", Icon: Sparkles, tone: "fuchsia" },
        ]}
      />

      <ChartCard
        title="Combined trend"
        description="Aggregated units sold across the trending set"
        legend={[{ label: "Units", tone: "var(--chart-2)" }]}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={aggregateSeries} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="tr-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis dataKey="day" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<ChartTooltipContent labelKey="day" />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
            <Area type="monotone" dataKey="units" stroke="var(--chart-2)" strokeWidth={2.4} fill="url(#tr-grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankedList
          title="Top sellers by units"
          description="Most units moved this period"
          rows={trending.map((t) => ({
            id: t.sku,
            primary: t.name,
            secondary: `${t.sku} · ${t.category}`,
            value: (
              <span className="flex items-center gap-2">
                <span className="tabular-nums">{t.units}</span>
                <StatusBadge tone="success">+{t.deltaPct}%</StatusBadge>
              </span>
            ),
            fraction: t.units / maxUnits,
          }))}
        />
        <RankedList
          title="Top sellers by revenue"
          description="Largest revenue contributors"
          rows={[...trending]
            .sort((a, b) => b.revenue - a.revenue)
            .map((t) => ({
              id: t.sku,
              primary: t.name,
              secondary: `${t.sku} · ${t.category}`,
              value: `$${t.revenue.toLocaleString()}`,
              fraction: t.revenue / Math.max(...trending.map((x) => x.revenue)),
            }))}
        />
      </div>
    </ReportShell>
  )
}
