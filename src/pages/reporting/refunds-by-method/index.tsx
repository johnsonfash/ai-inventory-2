import * as React from "react"
import { Banknote, CreditCard, Hash, RotateCcw } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"
import { listReturns } from "@/lib/pos/storage"

type Row = { method: string; count: number; refund: number }

const METHOD_LABEL: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  paypal: "PayPal",
  stripe: "Stripe",
  other: "Other",
}

export default function RefundsByMethodReport() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 250)) }, []))

  const rows: Row[] = React.useMemo(() => {
    const map = new Map<string, Row>()
    for (const ret of listReturns()) {
      const m = ret.method
      const rec = map.get(m) || { method: METHOD_LABEL[m] ?? m, count: 0, refund: 0 }
      rec.count += 1
      rec.refund = Math.round((rec.refund + ret.totalRefund) * 100) / 100
      map.set(m, rec)
    }
    return Array.from(map.values()).sort((a, b) => b.refund - a.refund)
  }, [])

  const totalRefund = rows.reduce((s, r) => s + r.refund, 0)
  const totalCount = rows.reduce((s, r) => s + r.count, 0)
  const cashRefund = rows.find((r) => r.method === "Cash")?.refund ?? 0

  const cols: Column<Row>[] = [
    { key: "method", header: "Method", primary: true },
    { key: "count", header: "Refunds", align: "right" },
    { key: "refund", header: "Amount", align: "right", render: (_, v) => formatPriceFor(v as number) },
    {
      key: "method",
      header: "Share",
      align: "right",
      hideOnMobile: true,
      render: (r) => `${totalRefund ? Math.round((r.refund / totalRefund) * 100) : 0}%`,
    },
  ]

  return (
    <ReportShell
      title="Refunds by method"
      description="How refunds were paid back"
      titleTooltip={
        <>
          Refunds grouped by where the money went back — cash out of the drawer, back to a
          card, transfer, etc. Helps reconcile the drawer (cash refunds) and spot any method
          that's refunded unusually often.
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-refunds-by-method-${period}`}
      exportRows={rows.map((r) => ({ Method: r.method, Refunds: r.count, Amount: r.refund }))}
    >
      <KpiBand
        items={[
          { title: "Refunds", value: String(totalCount), Icon: RotateCcw, tone: "violet" },
          { title: "Total refunded", value: formatPrice(totalRefund), Icon: Hash, tone: "rose" },
          { title: "Cash refunds", value: formatPrice(cashRefund), Icon: Banknote, tone: "amber" },
          { title: "Methods used", value: String(rows.length), Icon: CreditCard, tone: "sky" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Breakdown by method</p></div>
        <div className="p-3"><DataTable columns={cols} rows={rows} rowKey={(r) => r.method} /></div>
      </div>
    </ReportShell>
  )
}
