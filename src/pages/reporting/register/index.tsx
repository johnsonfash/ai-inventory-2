import * as React from "react"
import { Banknote, Clock, DollarSign, Hash } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { StatusBadge } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"

type Row = { id: string; openedBy: string; openedAt: string; closedAt: string; opening: number; closing: number; sales: number; status: "open" | "closed" | "discrepancy" }

const rows: Row[] = [
  { id: "REG-1208", openedBy: "Mia Chen", openedAt: "08:00", closedAt: "17:30", opening: 200, closing: 1840, sales: 1640, status: "closed" },
  { id: "REG-1207", openedBy: "Alex Larson", openedAt: "08:00", closedAt: "16:50", opening: 200, closing: 1284, sales: 1098, status: "discrepancy" },
  { id: "REG-1206", openedBy: "Priya Patel", openedAt: "08:00", closedAt: "17:10", opening: 200, closing: 920, sales: 720, status: "closed" },
  { id: "REG-1205", openedBy: "Mia Chen", openedAt: "08:00", closedAt: "—", opening: 200, closing: 0, sales: 480, status: "open" },
]

const cols: Column<Row>[] = [
  { key: "id", header: "ID", render: (_, v) => <span className="font-mono text-xs">{v as string}</span> },
  { key: "openedBy", header: "Opened by", primary: true },
  { key: "openedAt", header: "Opened", hideOnMobile: true },
  { key: "closedAt", header: "Closed", hideOnMobile: true },
  { key: "sales", header: "Sales", align: "right", render: (_, v) => formatPriceFor(v as number) },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <StatusBadge tone={r.status === "closed" ? "success" : r.status === "open" ? "info" : "danger"} withDot>
        {r.status}
      </StatusBadge>
    ),
  },
]

export default function RegisterReport() {
  const [period, setPeriod] = React.useState<Period>("7d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const totalSales = rows.reduce((s, r) => s + r.sales, 0)
  const openCount = rows.filter((r) => r.status === "open").length
  const discrepancyCount = rows.filter((r) => r.status === "discrepancy").length

  return (
    <ReportShell
      title="Register"
      description="Cash register sessions and till variance"
      titleTooltip={
        <>
          Each shift that ran on the POS register. Shows the opening
          float, total sales, closing count, and any
          <strong> variance</strong> (closing - opening - sales).
          Non-zero variance means the till is short or over — common
          causes are mis-typed change, voided sales, or pocketed
          cash.
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-register-${period}`}
      exportRows={rows.map((r) => ({ ID: r.id, "Opened by": r.openedBy, "Opened at": r.openedAt, "Closed at": r.closedAt, Opening: r.opening, Closing: r.closing, Sales: r.sales, Status: r.status }))}
    >
      <KpiBand
        items={[
          { title: "Sessions", value: String(rows.length), Icon: Hash, tone: "violet" },
          { title: "Total sales", value: formatPrice(totalSales), Icon: DollarSign, tone: "emerald" },
          { title: "Open now", value: String(openCount), Icon: Clock, tone: "amber" },
          { title: "Discrepancies", value: String(discrepancyCount), Icon: Banknote, tone: discrepancyCount > 0 ? "rose" : "sky" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Register sessions</p></div>
        <div className="p-3"><DataTable columns={cols} rows={rows} rowKey={(r) => r.id} /></div>
      </div>
    </ReportShell>
  )
}
