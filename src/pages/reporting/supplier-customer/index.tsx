import * as React from "react"
import { Building2, HandshakeIcon, TrendingUp, Wallet } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { StatusBadge } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"

type Side = "supplier" | "customer"
type Row = { side: Side; party: string; outstanding: number; settled: number; transactions: number }

const rows: Row[] = [
  { side: "supplier", party: "Cobalt Distributors", outstanding: 4820, settled: 18400, transactions: 14 },
  { side: "supplier", party: "Glow Co", outstanding: 1240, settled: 6240, transactions: 6 },
  { side: "supplier", party: "Acme Supplies", outstanding: 920, settled: 8120, transactions: 9 },
  { side: "customer", party: "NovaApps", outstanding: 0, settled: 12180, transactions: 58 },
  { side: "customer", party: "BrightLane", outstanding: 320, settled: 4910, transactions: 24 },
  { side: "customer", party: "Acme Co", outstanding: 1480, settled: 16940, transactions: 86 },
]

const cols: Column<Row>[] = [
  {
    key: "side",
    header: "Side",
    render: (_, v) => (
      <StatusBadge tone={v === "supplier" ? "info" : "brand"}>{v as string}</StatusBadge>
    ),
  },
  { key: "party", header: "Party", primary: true },
  { key: "transactions", header: "Txns", align: "right", hideOnMobile: true },
  { key: "settled", header: "Settled", align: "right", render: (_, v) => formatPriceFor(v as number) },
  {
    key: "outstanding",
    header: "Outstanding",
    align: "right",
    render: (r) => (
      <span className={r.outstanding > 0 ? "font-semibold text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>
        {formatPriceFor(r.outstanding)}
      </span>
    ),
  },
]

export default function SupplierCustomer() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const suppOutstanding = rows.filter((r) => r.side === "supplier").reduce((s, r) => s + r.outstanding, 0)
  const custOutstanding = rows.filter((r) => r.side === "customer").reduce((s, r) => s + r.outstanding, 0)
  const totalSettled = rows.reduce((s, r) => s + r.settled, 0)

  return (
    <ReportShell
      title="Supplier & customer"
      description="Two-sided ledger of receivables and payables"
      titleTooltip={
        <>
          Who owes whom right now. On the customer side, the
          outstanding column is your <strong>receivables</strong>{" "}
          (money to collect); on the supplier side, it's your
          <strong> payables</strong> (money to pay). The two big
          numbers at the top tell you net cash position.
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-supplier-customer-${period}`}
      exportRows={rows.map((r) => ({ Side: r.side, Party: r.party, Transactions: r.transactions, Settled: r.settled, Outstanding: r.outstanding }))}
    >
      <KpiBand
        items={[
          { title: "AR outstanding", value: formatPrice(custOutstanding), caption: "owed by customers", Icon: HandshakeIcon, tone: "amber" },
          { title: "AP outstanding", value: formatPrice(suppOutstanding), caption: "owed to suppliers", Icon: Building2, tone: "rose" },
          { title: "Settled", value: formatPrice(totalSettled), delta: "+12%", trend: "up", Icon: Wallet, tone: "emerald" },
          { title: "Parties", value: String(rows.length), Icon: TrendingUp, tone: "violet" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Counter-parties</p></div>
        <div className="p-3"><DataTable columns={cols} rows={rows} rowKey={(r) => `${r.side}-${r.party}`} /></div>
      </div>
    </ReportShell>
  )
}
