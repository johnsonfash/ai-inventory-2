import * as React from "react"
import { Hash, PieChart, RotateCcw, TriangleAlert } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"
import { listReturns, RETURN_REASONS, type ReturnReason } from "@/lib/pos/storage"

type Row = { reason: string; key: ReturnReason | "unspecified"; count: number; units: number; refund: number }

const LABEL: Record<string, string> = {
  ...Object.fromEntries(RETURN_REASONS.map((r) => [r.value, r.label])),
  unspecified: "Not specified",
}

export default function ReturnsByReasonReport() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 250)) }, []))

  const rows: Row[] = React.useMemo(() => {
    const map = new Map<string, Row>()
    for (const ret of listReturns()) {
      const key = (ret.reason ?? "unspecified") as Row["key"]
      const rec = map.get(key) || { reason: LABEL[key] ?? key, key, count: 0, units: 0, refund: 0 }
      rec.count += 1
      rec.units += ret.items.reduce((s, i) => s + i.qty, 0)
      rec.refund = Math.round((rec.refund + ret.totalRefund) * 100) / 100
      map.set(key, rec)
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [])

  const totalCount = rows.reduce((s, r) => s + r.count, 0)
  const totalRefund = rows.reduce((s, r) => s + r.refund, 0)
  const topReason = rows[0]?.reason ?? "—"

  const cols: Column<Row>[] = [
    { key: "reason", header: "Reason", primary: true },
    { key: "count", header: "Returns", align: "right" },
    { key: "units", header: "Units", align: "right", hideOnMobile: true },
    { key: "refund", header: "Refunded", align: "right", render: (_, v) => formatPriceFor(v as number) },
    {
      key: "key",
      header: "Share",
      align: "right",
      hideOnMobile: true,
      render: (r) => `${totalCount ? Math.round((r.count / totalCount) * 100) : 0}%`,
    },
  ]

  return (
    <ReportShell
      title="Returns by reason"
      description="Why customers bring items back"
      titleTooltip={
        <>
          Returns grouped by the reason captured at the till. A spike in
          "faulty / defective" points at a bad batch; lots of "size / fit" might mean a
          sizing guide would cut returns. Industry-agnostic reasons cover any business.
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-returns-by-reason-${period}`}
      exportRows={rows.map((r) => ({ Reason: r.reason, Returns: r.count, Units: r.units, Refunded: r.refund }))}
    >
      <KpiBand
        items={[
          { title: "Returns", value: String(totalCount), Icon: RotateCcw, tone: "violet" },
          { title: "Refunded", value: formatPrice(totalRefund), Icon: Hash, tone: "rose" },
          { title: "Top reason", value: topReason, Icon: TriangleAlert, tone: "amber" },
          { title: "Reason types", value: String(rows.length), Icon: PieChart, tone: "sky" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Breakdown by reason</p></div>
        <div className="p-3"><DataTable columns={cols} rows={rows} rowKey={(r) => r.key} /></div>
      </div>
    </ReportShell>
  )
}
