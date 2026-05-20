import * as React from "react"
import { ArrowDownRight, ArrowUpRight, ClipboardCheck, Package } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { StatusBadge } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"

type Row = { id: string; sku: string; qty: number; reason: string; date: string; user: string }

const rows: Row[] = [
  { id: "ADJ-104", sku: "EL-2109", qty: -8, reason: "Damaged", date: "2026-05-18", user: "A. Larson" },
  { id: "ADJ-103", sku: "AP-4012", qty: -3, reason: "Theft", date: "2026-05-16", user: "M. Chen" },
  { id: "ADJ-102", sku: "HM-2205", qty: 12, reason: "Found in transit", date: "2026-05-14", user: "P. Patel" },
  { id: "ADJ-101", sku: "BT-9091", qty: -5, reason: "Expired", date: "2026-05-12", user: "system" },
]

const cols: Column<Row>[] = [
  { key: "id", header: "ID", render: (_, v) => <span className="font-mono text-xs">{v as string}</span> },
  { key: "sku", header: "SKU", primary: true, render: (_, v) => <span className="font-mono text-xs">{v as string}</span> },
  {
    key: "qty",
    header: "Qty",
    align: "right",
    render: (r) => (
      <span className={`inline-flex items-center gap-1 tabular-nums font-medium ${r.qty < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
        {r.qty < 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
        {r.qty > 0 ? `+${r.qty}` : r.qty}
      </span>
    ),
  },
  { key: "reason", header: "Reason", render: (_, v) => <StatusBadge tone="neutral">{v as string}</StatusBadge> },
  { key: "date", header: "Date", hideOnMobile: true },
  { key: "user", header: "By", hideOnMobile: true },
]

export default function StockAdjustmentReport() {
  const [period, setPeriod] = React.useState<Period>("30d")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const positives = rows.filter((r) => r.qty > 0)
  const negatives = rows.filter((r) => r.qty < 0)
  const netUnits = rows.reduce((s, r) => s + r.qty, 0)

  return (
    <ReportShell
      title="Stock adjustments"
      description="Manual reconciliations and write-offs"
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-stock-adjustments-${period}`}
      exportRows={rows.map((r) => ({ ID: r.id, SKU: r.sku, Qty: r.qty, Reason: r.reason, Date: r.date, "By": r.user }))}
    >
      <KpiBand
        items={[
          { title: "Net change", value: `${netUnits > 0 ? "+" : ""}${netUnits}`, caption: "units", Icon: Package, tone: netUnits >= 0 ? "emerald" : "rose" },
          { title: "Write-ons", value: String(positives.reduce((s, r) => s + r.qty, 0)), Icon: ArrowUpRight, tone: "emerald" },
          { title: "Write-offs", value: String(negatives.reduce((s, r) => s + r.qty, 0)), Icon: ArrowDownRight, tone: "rose" },
          { title: "Entries", value: String(rows.length), Icon: ClipboardCheck, tone: "violet" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Adjustment entries</p>
        </div>
        <div className="p-3">
          <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
        </div>
      </div>
    </ReportShell>
  )
}
