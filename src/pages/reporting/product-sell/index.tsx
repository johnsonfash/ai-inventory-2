import * as React from "react"
import { DollarSign, Package, ShoppingCart, Trophy } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"

type Row = { sku: string; name: string; qty: number; amount: number; avgPrice: number }

const rows: Row[] = [
  { sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", qty: 320, amount: 8120, avgPrice: 25.4 },
  { sku: "AP-4012", name: "Cotton Tee — Black", qty: 280, amount: 3360, avgPrice: 12.0 },
  { sku: "HM-2205", name: "Ceramic Mug 12oz", qty: 190, amount: 1520, avgPrice: 8.0 },
  { sku: "BT-9091", name: "Hydrating Serum", qty: 120, amount: 2274, avgPrice: 18.95 },
  { sku: "EL-1001", name: "Wireless Mouse", qty: 96, amount: 2112, avgPrice: 22.0 },
]

const cols: Column<Row>[] = [
  { key: "sku", header: "SKU", render: (_, v) => <span className="font-mono text-xs">{v as string}</span> },
  { key: "name", header: "Product", primary: true },
  { key: "qty", header: "Units sold", align: "right" },
  { key: "avgPrice", header: "Avg price", align: "right", hideOnMobile: true, render: (_, v) => `$${(v as number).toFixed(2)}` },
  { key: "amount", header: "Revenue", align: "right", render: (_, v) => `$${(v as number).toLocaleString()}` },
]

export default function ProductSell() {
  const [period, setPeriod] = React.useState<Period>("30d")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const totalUnits = rows.reduce((s, r) => s + r.qty, 0)
  const totalRevenue = rows.reduce((s, r) => s + r.amount, 0)
  const winner = [...rows].sort((a, b) => b.amount - a.amount)[0]!

  return (
    <ReportShell
      title="Product sell"
      description="Per-product sales breakdown"
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-product-sell-${period}`}
      exportRows={rows.map((r) => ({ SKU: r.sku, Name: r.name, "Units sold": r.qty, "Avg price": r.avgPrice, Revenue: r.amount }))}
    >
      <KpiBand
        items={[
          { title: "Best seller", value: (winner.name.split(" ")[0] ?? winner.name), caption: winner.sku, Icon: Trophy, tone: "amber" },
          { title: "Units sold", value: totalUnits.toLocaleString(), Icon: ShoppingCart, tone: "violet" },
          { title: "Revenue", value: `$${totalRevenue.toLocaleString()}`, delta: "+22%", trend: "up", Icon: DollarSign, tone: "emerald" },
          { title: "SKUs sold", value: String(rows.length), Icon: Package, tone: "sky" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">All products</p>
        </div>
        <div className="p-3">
          <DataTable columns={cols} rows={rows} rowKey={(r) => r.sku} />
        </div>
      </div>
    </ReportShell>
  )
}
