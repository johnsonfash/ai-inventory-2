import * as React from "react"
import { DollarSign, Layers, Trophy, Users } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { StatusBadge } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"

type Row = { group: string; customers: number; revenue: number; avgOrder: number; tier: "VIP" | "Regular" | "New" | "Lapsed" }

const rows: Row[] = [
  { group: "Wholesale", customers: 28, revenue: 84600, avgOrder: 612, tier: "VIP" },
  { group: "Retail — Lagos", customers: 142, revenue: 38400, avgOrder: 124, tier: "Regular" },
  { group: "Retail — Accra", customers: 96, revenue: 21800, avgOrder: 98, tier: "Regular" },
  { group: "Online subscribers", customers: 312, revenue: 18420, avgOrder: 48, tier: "New" },
  { group: "Pop-up events", customers: 84, revenue: 6240, avgOrder: 32, tier: "Lapsed" },
]

const tierTone = { VIP: "brand", Regular: "info", New: "success", Lapsed: "warning" } as const

const cols: Column<Row>[] = [
  { key: "group", header: "Group", primary: true },
  { key: "customers", header: "Customers", align: "right" },
  { key: "revenue", header: "Revenue", align: "right", render: (_, v) => formatPriceFor(v as number) },
  { key: "avgOrder", header: "Avg order", align: "right", hideOnMobile: true, render: (_, v) => formatPriceFor(v as number) },
  { key: "tier", header: "Tier", render: (r) => <StatusBadge tone={tierTone[r.tier]}>{r.tier}</StatusBadge> },
]

export default function CustomerGroup() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
  const totalCustomers = rows.reduce((s, r) => s + r.customers, 0)
  const top = [...rows].sort((a, b) => b.revenue - a.revenue)[0]!

  return (
    <ReportShell
      title="Customer groups"
      description="Aggregated buyer segments and their performance"
      titleTooltip={
        <>
          Buckets your customers by tier (VIP / Regular / New / Lapsed
          / Wholesale) and shows total revenue + average order size
          per group. Use this to spot where to focus retention
          marketing — e.g. small "Lapsed" group with high LTV is gold
          for a "we miss you" campaign.
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-customer-groups-${period}`}
      exportRows={rows.map((r) => ({ Group: r.group, Customers: r.customers, Revenue: r.revenue, "Avg order": r.avgOrder, Tier: r.tier }))}
    >
      <KpiBand
        items={[
          { title: "Groups", value: String(rows.length), Icon: Layers, tone: "violet" },
          { title: "Total customers", value: totalCustomers.toLocaleString(), Icon: Users, tone: "sky" },
          { title: "Revenue", value: formatPrice(totalRevenue), Icon: DollarSign, tone: "emerald" },
          { title: "Top group", value: top.group, caption: formatPrice(top.revenue), Icon: Trophy, tone: "amber" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Group breakdown</p>
        </div>
        <div className="p-3">
          <DataTable columns={cols} rows={rows} rowKey={(r) => r.group} />
        </div>
      </div>
    </ReportShell>
  )
}
