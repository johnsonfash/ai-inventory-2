import * as React from "react"
import { AlertTriangle, CalendarClock, Hourglass, PackageMinus } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"

type Row = { sku: string; batch: string; name: string; expires: string; daysLeft: number; stock: number }

const rows: Row[] = [
  { sku: "BT-9091", batch: "B-1223", name: "Hydrating Serum", expires: "2026-06-10", daysLeft: 21, stock: 48 },
  { sku: "BT-9092", batch: "B-1224", name: "Vitamin C Toner", expires: "2026-05-25", daysLeft: 5, stock: 24 },
  { sku: "HM-2299", batch: "B-1118", name: "Scented Candle", expires: "2026-08-20", daysLeft: 92, stock: 80 },
  { sku: "BT-9095", batch: "B-1117", name: "Retinol Cream", expires: "2026-05-22", daysLeft: 2, stock: 8 },
  { sku: "HM-2310", batch: "B-1102", name: "Bamboo Tea", expires: "2026-12-30", daysLeft: 224, stock: 144 },
]

function tone(days: number): StatusTone {
  if (days <= 7) return "danger"
  if (days <= 30) return "warning"
  return "success"
}

const cols: Column<Row>[] = [
  { key: "sku", header: "SKU", render: (_, v) => <span className="font-mono text-xs">{v as string}</span> },
  { key: "name", header: "Item", primary: true },
  { key: "batch", header: "Batch", hideOnMobile: true, render: (_, v) => <span className="font-mono text-xs">{v as string}</span> },
  { key: "expires", header: "Expires" },
  { key: "stock", header: "Stock", align: "right" },
  {
    key: "daysLeft",
    header: "Days left",
    align: "right",
    render: (r) => <StatusBadge tone={tone(r.daysLeft)} withDot>{r.daysLeft}d</StatusBadge>,
  },
]

export default function StockExpiry() {
  const [period, setPeriod] = React.useState<Period>("30d")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const expiringSoon = rows.filter((r) => r.daysLeft <= 30).length
  const critical = rows.filter((r) => r.daysLeft <= 7).length
  const atRiskStock = rows.filter((r) => r.daysLeft <= 30).reduce((s, r) => s + r.stock, 0)

  return (
    <ReportShell
      title="Stock expiry"
      description="Batches approaching their expiry date"
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-stock-expiry-${period}`}
      exportRows={rows.map((r) => ({ SKU: r.sku, Batch: r.batch, Name: r.name, Expires: r.expires, "Days left": r.daysLeft, Stock: r.stock }))}
    >
      <KpiBand
        items={[
          { title: "Tracked batches", value: String(rows.length), Icon: PackageMinus, tone: "violet" },
          { title: "Expiring 30d", value: String(expiringSoon), delta: "−3 vs last week", trend: "down", Icon: Hourglass, tone: "amber" },
          { title: "Critical (≤7d)", value: String(critical), Icon: AlertTriangle, tone: "rose" },
          { title: "At-risk stock", value: `${atRiskStock} units`, Icon: CalendarClock, tone: "sky" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Expiring batches</p></div>
        <div className="p-3"><DataTable columns={cols} rows={rows} rowKey={(r) => r.batch} /></div>
      </div>
    </ReportShell>
  )
}
