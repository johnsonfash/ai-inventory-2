import * as React from "react"
import { AlertTriangle, Boxes, DollarSign, PackageMinus, Warehouse } from "lucide-react"
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { ChartCard } from "@/components/reports/chart-card"
import { DataTable, type Column } from "@/components/reports/data-table"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { ChartTooltipContent } from "@/components/ui/chart"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency } from "@/contexts/currency"

type StockRow = {
  sku: string
  name: string
  category: string
  location: string
  stock: number
  reorder: number
  cost: number
  status: "ok" | "low" | "out" | "critical"
}

const rows: StockRow[] = [
  { sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", category: "Electronics", location: "WH-A", stock: 12, reorder: 25, cost: 18.0, status: "low" },
  { sku: "AP-4012", name: "Cotton Tee — Black", category: "Apparel", location: "WH-B", stock: 8, reorder: 20, cost: 5.5, status: "low" },
  { sku: "HM-2205", name: "Ceramic Mug 12oz", category: "Home", location: "WH-C", stock: 54, reorder: 40, cost: 3.2, status: "ok" },
  { sku: "BT-9091", name: "Hydrating Serum", category: "Beauty", location: "WH-A", stock: 5, reorder: 15, cost: 8.5, status: "critical" },
  { sku: "EL-1001", name: "Wireless Mouse", category: "Electronics", location: "WH-B", stock: 24, reorder: 30, cost: 12.0, status: "low" },
  { sku: "AP-4015", name: "Linen Shirt — Stone", category: "Apparel", location: "WH-B", stock: 0, reorder: 12, cost: 14.0, status: "out" },
  { sku: "HM-2240", name: "Tea Towel Set", category: "Home", location: "WH-C", stock: 36, reorder: 25, cost: 6.0, status: "ok" },
]

const statusTone: Record<StockRow["status"], StatusTone> = {
  ok: "success",
  low: "warning",
  critical: "danger",
  out: "danger",
}

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"] as const

export default function StockReport() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(
    React.useCallback(async () => {
      await new Promise((r) => setTimeout(r, 400))
    }, []),
  )

  const totalStock = rows.reduce((s, r) => s + r.stock, 0)
  const totalValue = rows.reduce((s, r) => s + r.stock * r.cost, 0)
  const lowCount = rows.filter((r) => r.status === "low" || r.status === "critical").length
  const oosCount = rows.filter((r) => r.status === "out").length

  // Value by category for the donut
  const valueByCategory = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const r of rows) m.set(r.category, (m.get(r.category) ?? 0) + r.stock * r.cost)
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }))
  }, [])

  const cols: Column<StockRow>[] = [
    { key: "name", header: "Item", primary: true },
    { key: "sku", header: "SKU", render: (_, v) => <span className="font-mono text-xs text-muted-foreground">{v as string}</span> },
    { key: "category", header: "Category", hideOnMobile: true },
    { key: "location", header: "Location", hideOnMobile: true },
    {
      key: "stock",
      header: "On-hand",
      align: "right",
      render: (r) => (
        <span className="tabular-nums">
          {r.stock}
          <span className="text-muted-foreground">/{r.reorder}</span>
        </span>
      ),
    },
    {
      key: "cost",
      header: "Value",
      align: "right",
      render: (r) => formatPrice(r.stock * r.cost),
    },
    {
      key: "status",
      header: "Status",
      render: (_, v) => (
        <StatusBadge tone={statusTone[v as StockRow["status"]]} withDot>
          {v as string}
        </StatusBadge>
      ),
    },
  ]

  const exportRows = rows.map((r) => ({
    SKU: r.sku,
    Name: r.name,
    Category: r.category,
    Location: r.location,
    "On-hand": r.stock,
    "Reorder point": r.reorder,
    "Unit cost": r.cost,
    "Stock value": Number((r.stock * r.cost).toFixed(2)),
    Status: r.status,
  }))

  return (
    <ReportShell
      title="Stock report"
      description="On-hand, value, and reorder health by SKU"
      titleTooltip={
        <>
          A row per SKU showing how many units you have, how much
          they're worth at cost, and whether the count is below the
          reorder threshold. The quickest answer to "what's running
          out and what should I order next?"
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-stock-${period}`}
      exportRows={exportRows}
    >
      <KpiBand
        items={[
          { title: "Total units", value: totalStock.toLocaleString(), Icon: Boxes, tone: "violet" },
          { title: "Stock value", value: formatPrice(Math.round(totalValue)), delta: "+1.1%", trend: "up", caption: "vs last period", Icon: DollarSign, tone: "emerald" },
          { title: "Low / critical", value: String(lowCount), delta: "−2", trend: "down", Icon: AlertTriangle, tone: "amber" },
          { title: "Out of stock", value: String(oosCount), Icon: PackageMinus, tone: "rose" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Value by category"
          description="Share of stock value"
          legend={valueByCategory.map((c, i) => ({ label: c.name, tone: PIE_COLORS[i % PIE_COLORS.length]! }))}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltipContent labelKey="name" />} />
              <Pie
                data={valueByCategory}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={92}
                paddingAngle={3}
                stroke="var(--background)"
                strokeWidth={2}
              >
                {valueByCategory.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              <Warehouse className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Warehouse spread</p>
              <p className="text-[11px] text-muted-foreground">Distribution of units across locations</p>
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {Array.from(new Set(rows.map((r) => r.location)))
              .sort()
              .map((loc) => {
                const units = rows.filter((r) => r.location === loc).reduce((s, r) => s + r.stock, 0)
                const pct = (units / totalStock) * 100
                return (
                  <li key={loc}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{loc}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {units} units · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-brand to-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">All items</p>
          <p className="text-[11px] text-muted-foreground">{rows.length} items in inventory</p>
        </div>
        <div className="p-3">
          <DataTable columns={cols} rows={rows} rowKey={(r) => r.sku} />
        </div>
      </div>
    </ReportShell>
  )
}
