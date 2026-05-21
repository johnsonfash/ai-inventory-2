import * as React from "react"
import { DollarSign, Package, Receipt, Truck } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"

type Row = { sku: string; name: string; vendor: string; qty: number; amount: number; lastReceived: string }

const rows: Row[] = [
  { sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", vendor: "Cobalt", qty: 120, amount: 2160, lastReceived: "2026-05-18" },
  { sku: "AP-4012", name: "Cotton Tee — Black", vendor: "Delta", qty: 200, amount: 1100, lastReceived: "2026-05-15" },
  { sku: "HM-2205", name: "Ceramic Mug 12oz", vendor: "Porcel", qty: 80, amount: 256, lastReceived: "2026-05-12" },
  { sku: "BT-9091", name: "Hydrating Serum", vendor: "Glow Co", qty: 60, amount: 510, lastReceived: "2026-05-10" },
  { sku: "EL-1001", name: "Wireless Mouse", vendor: "Acme", qty: 40, amount: 480, lastReceived: "2026-05-08" },
]

const cols: Column<Row>[] = [
  { key: "sku", header: "SKU", render: (_, v) => <span className="font-mono text-xs">{v as string}</span> },
  { key: "name", header: "Item", primary: true },
  { key: "vendor", header: "Vendor" },
  { key: "qty", header: "Qty", align: "right" },
  { key: "amount", header: "Amount", align: "right", render: (_, v) => formatPriceFor(v as number) },
  { key: "lastReceived", header: "Last received", hideOnMobile: true },
]

export default function ProductPurchase() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const totalQty = rows.reduce((s, r) => s + r.qty, 0)
  const totalAmount = rows.reduce((s, r) => s + r.amount, 0)
  const vendors = new Set(rows.map((r) => r.vendor)).size

  return (
    <ReportShell
      title="Product purchase"
      description="Item-level inbound history"
      titleTooltip={
        <>
          What you've bought, per SKU. Mirror of "Product sell" but on
          the buy side — useful for negotiating price breaks with
          vendors on high-volume items, or spotting over-stocking
          patterns.
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-product-purchase-${period}`}
      exportRows={rows.map((r) => ({ SKU: r.sku, Name: r.name, Vendor: r.vendor, Qty: r.qty, Amount: r.amount, "Last received": r.lastReceived }))}
    >
      <KpiBand
        items={[
          { title: "Total spend", value: formatPrice(totalAmount), delta: "+8%", trend: "up", caption: "vs last period", Icon: DollarSign, tone: "violet" },
          { title: "Units received", value: totalQty.toLocaleString(), Icon: Package, tone: "emerald" },
          { title: "Distinct vendors", value: String(vendors), Icon: Truck, tone: "amber" },
          { title: "Line items", value: String(rows.length), Icon: Receipt, tone: "sky" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Item-level inbound</p></div>
        <div className="p-3"><DataTable columns={cols} rows={rows} rowKey={(r) => r.sku} /></div>
      </div>
    </ReportShell>
  )
}
