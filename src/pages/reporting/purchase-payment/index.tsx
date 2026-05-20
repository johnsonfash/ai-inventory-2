import * as React from "react"
import { Clock, CreditCard, DollarSign, FileWarning } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"

type Status = "paid" | "partial" | "pending" | "overdue"
type Row = { id: string; vendor: string; amount: number; date: string; status: Status }

const rows: Row[] = [
  { id: "PAY-9001", vendor: "Cobalt Distributors", amount: 4820, date: "2026-05-19", status: "paid" },
  { id: "PAY-9000", vendor: "Glow Co", amount: 1240, date: "2026-05-18", status: "partial" },
  { id: "PAY-8999", vendor: "Acme Supplies", amount: 920, date: "2026-05-15", status: "pending" },
  { id: "PAY-8998", vendor: "Porcel Ceramics", amount: 2110, date: "2026-05-10", status: "overdue" },
  { id: "PAY-8997", vendor: "Delta Apparel", amount: 5800, date: "2026-05-09", status: "paid" },
]

const tone: Record<Status, StatusTone> = { paid: "success", partial: "info", pending: "warning", overdue: "danger" }

const cols: Column<Row>[] = [
  { key: "id", header: "ID", render: (_, v) => <span className="font-mono text-xs">{v as string}</span> },
  { key: "vendor", header: "Vendor", primary: true },
  { key: "date", header: "Date", hideOnMobile: true },
  { key: "amount", header: "Amount", align: "right", render: (_, v) => formatPriceFor(v as number) },
  { key: "status", header: "Status", render: (r) => <StatusBadge tone={tone[r.status]} withDot>{r.status}</StatusBadge> },
]

export default function PurchasePaymentReport() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const paid = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0)
  const pending = rows.filter((r) => r.status === "pending" || r.status === "partial").reduce((s, r) => s + r.amount, 0)
  const overdue = rows.filter((r) => r.status === "overdue").reduce((s, r) => s + r.amount, 0)

  return (
    <ReportShell
      title="Purchase payment"
      description="Status of payments out to vendors"
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-purchase-payment-${period}`}
      exportRows={rows.map((r) => ({ ID: r.id, Vendor: r.vendor, Amount: r.amount, Date: r.date, Status: r.status }))}
    >
      <KpiBand
        items={[
          { title: "Total settled", value: formatPrice(paid), Icon: CreditCard, tone: "emerald" },
          { title: "Pending", value: formatPrice(pending), Icon: Clock, tone: "amber" },
          { title: "Overdue", value: formatPrice(overdue), Icon: FileWarning, tone: "rose" },
          { title: "Total", value: formatPrice(rows.reduce((s, r) => s + r.amount, 0)), Icon: DollarSign, tone: "violet" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Payment entries</p></div>
        <div className="p-3"><DataTable columns={cols} rows={rows} rowKey={(r) => r.id} /></div>
      </div>
    </ReportShell>
  )
}
