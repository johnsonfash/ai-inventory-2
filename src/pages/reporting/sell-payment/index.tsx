import * as React from "react"
import { Clock, CreditCard, DollarSign, HandCoins } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"

type Status = "settled" | "partial" | "pending" | "refunded"
type Row = { id: string; customer: string; amount: number; date: string; method: "card" | "cash" | "transfer"; status: Status }

const rows: Row[] = [
  { id: "PAY-5001", customer: "NovaApps", amount: 420, date: "2026-05-19", method: "card", status: "settled" },
  { id: "PAY-5002", customer: "BrightLane", amount: 120, date: "2026-05-19", method: "transfer", status: "pending" },
  { id: "PAY-5003", customer: "Walk-in", amount: 64.2, date: "2026-05-19", method: "cash", status: "settled" },
  { id: "PAY-5004", customer: "Acme Co", amount: 3210, date: "2026-05-18", method: "transfer", status: "partial" },
  { id: "PAY-5005", customer: "Linda M.", amount: 92.15, date: "2026-05-17", method: "card", status: "refunded" },
]

const tone: Record<Status, StatusTone> = { settled: "success", partial: "info", pending: "warning", refunded: "danger" }

const cols: Column<Row>[] = [
  { key: "id", header: "ID", render: (_, v) => <span className="font-mono text-xs">{v as string}</span> },
  { key: "customer", header: "Customer", primary: true },
  { key: "method", header: "Method", hideOnMobile: true, render: (_, v) => <span className="capitalize">{v as string}</span> },
  { key: "date", header: "Date", hideOnMobile: true },
  { key: "amount", header: "Amount", align: "right", render: (_, v) => formatPriceFor(v as number) },
  { key: "status", header: "Status", render: (r) => <StatusBadge tone={tone[r.status]} withDot>{r.status}</StatusBadge> },
]

export default function SellPaymentReport() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const settled = rows.filter((r) => r.status === "settled").reduce((s, r) => s + r.amount, 0)
  const pending = rows.filter((r) => r.status === "pending" || r.status === "partial").reduce((s, r) => s + r.amount, 0)
  const refunded = rows.filter((r) => r.status === "refunded").reduce((s, r) => s + r.amount, 0)

  return (
    <ReportShell
      title="Sell payment"
      description="Customer payment collection status"
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-sell-payment-${period}`}
      exportRows={rows.map((r) => ({ ID: r.id, Customer: r.customer, Method: r.method, Date: r.date, Amount: r.amount, Status: r.status }))}
    >
      <KpiBand
        items={[
          { title: "Settled", value: formatPrice(settled), Icon: HandCoins, tone: "emerald" },
          { title: "Pending", value: formatPrice(pending), Icon: Clock, tone: "amber" },
          { title: "Refunded", value: formatPrice(refunded), Icon: CreditCard, tone: "rose" },
          { title: "Total volume", value: formatPrice(rows.reduce((s, r) => s + r.amount, 0)), Icon: DollarSign, tone: "violet" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Payment entries</p></div>
        <div className="p-3"><DataTable columns={cols} rows={rows} rowKey={(r) => r.id} /></div>
      </div>
    </ReportShell>
  )
}
