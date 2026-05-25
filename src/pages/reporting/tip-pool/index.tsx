import * as React from "react"
import { Coins, HandCoins, Hash, Percent } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"
import { listInvoices } from "@/lib/pos/storage"

type Row = { name: string; tips: number; sales: number; count: number }

export default function TipPoolReport() {
  const [period, setPeriod] = React.useState<Period>("7d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 250)) }, []))

  const rows: Row[] = React.useMemo(() => {
    const map = new Map<string, Row>()
    for (const inv of listInvoices()) {
      if (!inv.tip) continue
      const name = inv.meta?.salesperson || "Unassigned"
      const rec = map.get(name) || { name, tips: 0, sales: 0, count: 0 }
      rec.tips = Math.round((rec.tips + (inv.tip || 0)) * 100) / 100
      rec.sales = Math.round((rec.sales + inv.total) * 100) / 100
      rec.count += 1
      map.set(name, rec)
    }
    return Array.from(map.values()).sort((a, b) => b.tips - a.tips)
  }, [])

  const totalTips = rows.reduce((s, r) => s + r.tips, 0)
  const totalSales = rows.reduce((s, r) => s + r.sales, 0)
  const avgPct = totalSales > 0 ? (totalTips / totalSales) * 100 : 0

  const cols: Column<Row>[] = [
    { key: "name", header: "Team member", primary: true },
    { key: "count", header: "Tipped sales", align: "right", hideOnMobile: true },
    { key: "sales", header: "Sales", align: "right", hideOnMobile: true, render: (_, v) => formatPriceFor(v as number) },
    { key: "tips", header: "Tips", align: "right", render: (_, v) => formatPriceFor(v as number) },
  ]

  return (
    <ReportShell
      title="Tip pool"
      description="Gratuities collected, by team member"
      titleTooltip={
        <>
          Tips taken at checkout, grouped by who rang the sale. Use it to split a shared
          pool fairly or pay out individual tips. Tips are stored separately from revenue so
          they never inflate your sales figures.
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-tip-pool-${period}`}
      exportRows={rows.map((r) => ({ "Team member": r.name, "Tipped sales": r.count, Sales: r.sales, Tips: r.tips }))}
    >
      <KpiBand
        items={[
          { title: "Total tips", value: formatPrice(totalTips), Icon: HandCoins, tone: "emerald" },
          { title: "Tipped sales", value: String(rows.reduce((s, r) => s + r.count, 0)), Icon: Hash, tone: "violet" },
          { title: "Team members", value: String(rows.length), Icon: Coins, tone: "amber" },
          { title: "Avg tip rate", value: `${avgPct.toFixed(1)}%`, Icon: Percent, tone: "sky" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Tips by team member</p></div>
        <div className="p-3"><DataTable columns={cols} rows={rows} rowKey={(r) => r.name} /></div>
      </div>
    </ReportShell>
  )
}
