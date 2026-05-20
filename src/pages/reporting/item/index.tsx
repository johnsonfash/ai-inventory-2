import * as React from "react"
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"

type Row = { sku: string; name: string; category: string; sold: number; purchased: number; onHand: number; revenue: number }

const rows: Row[] = [
  { sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", category: "Electronics", sold: 320, purchased: 380, onHand: 12, revenue: 8120 },
  { sku: "AP-4012", name: "Cotton Tee — Black", category: "Apparel", sold: 280, purchased: 320, onHand: 8, revenue: 3360 },
  { sku: "HM-2205", name: "Ceramic Mug 12oz", category: "Home", sold: 190, purchased: 250, onHand: 54, revenue: 1520 },
  { sku: "BT-9091", name: "Hydrating Serum", category: "Beauty", sold: 120, purchased: 130, onHand: 5, revenue: 2274 },
  { sku: "EL-1001", name: "Wireless Mouse", category: "Electronics", sold: 96, purchased: 124, onHand: 24, revenue: 2112 },
]

const cols: Column<Row>[] = [
  { key: "sku", header: "SKU", render: (_, v) => <span className="font-mono text-xs">{v as string}</span> },
  { key: "name", header: "Item", primary: true },
  { key: "category", header: "Category", hideOnMobile: true },
  { key: "sold", header: "Sold", align: "right" },
  { key: "purchased", header: "Purchased", align: "right", hideOnMobile: true },
  { key: "onHand", header: "On hand", align: "right" },
  { key: "revenue", header: "Revenue", align: "right", render: (_, v) => formatPriceFor(v as number) },
]

export default function ItemReport() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const totalSold = rows.reduce((s, r) => s + r.sold, 0)
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
  const totalOnHand = rows.reduce((s, r) => s + r.onHand, 0)
  const topByRev = [...rows].sort((a, b) => b.revenue - a.revenue)[0]!

  return (
    <ReportShell
      title="Items"
      description="Per-item full statistics across the period"
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-items-${period}`}
      exportRows={rows.map((r) => ({ SKU: r.sku, Name: r.name, Category: r.category, Sold: r.sold, Purchased: r.purchased, "On hand": r.onHand, Revenue: r.revenue }))}
    >
      <KpiBand
        items={[
          { title: "Items tracked", value: String(rows.length), Icon: Package, tone: "violet" },
          { title: "Units sold", value: totalSold.toLocaleString(), Icon: ShoppingCart, tone: "emerald" },
          { title: "Revenue", value: formatPrice(totalRevenue), Icon: DollarSign, tone: "amber" },
          { title: "Top item", value: topByRev.name.split(" ")[0] ?? topByRev.name, caption: formatPrice(topByRev.revenue), Icon: TrendingUp, tone: "fuchsia" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Item ledger ({totalOnHand} on hand)</p></div>
        <div className="p-3"><DataTable columns={cols} rows={rows} rowKey={(r) => r.sku} /></div>
      </div>
    </ReportShell>
  )
}
