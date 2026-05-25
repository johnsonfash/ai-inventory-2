import * as React from "react"
import { Banknote, Hash, Scale, Wallet } from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { DataTable, type Column } from "@/components/reports/data-table"
import { StatusBadge } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { useCurrency, formatPriceFor } from "@/contexts/currency"
import { GlossaryLink } from "@/components/help/glossary-link"
import { buildShiftReport, listShifts } from "@/lib/pos/shifts"

type Row = {
  id: string
  cashier: string
  location: string
  opened: string
  sales: number
  expected: number
  counted: number | null
  variance: number | null
  status: "open" | "closed"
}

export default function CashDrawerReport() {
  const [period, setPeriod] = React.useState<Period>("7d")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 250)) }, []))

  const rows: Row[] = React.useMemo(
    () =>
      listShifts().map((s) => {
        const r = buildShiftReport(s)
        return {
          id: s.id,
          cashier: s.cashier,
          location: s.location,
          opened: new Date(s.openedAt).toLocaleString(),
          sales: r.grossSales,
          expected: r.expectedCash,
          counted: s.declaredClose ?? null,
          variance: r.variance ?? null,
          status: s.status,
        }
      }),
    [],
  )

  const totalVariance = rows.reduce((s, r) => s + (r.variance ?? 0), 0)
  const shortCount = rows.filter((r) => (r.variance ?? 0) < -0.009).length

  const cols: Column<Row>[] = [
    { key: "cashier", header: "Cashier", primary: true },
    { key: "location", header: "Location", hideOnMobile: true },
    { key: "opened", header: "Opened", hideOnMobile: true },
    { key: "sales", header: "Sales", align: "right", render: (_, v) => formatPriceFor(v as number) },
    { key: "expected", header: "Expected", align: "right", hideOnMobile: true, render: (_, v) => formatPriceFor(v as number) },
    { key: "counted", header: "Counted", align: "right", render: (_, v) => (v == null ? "—" : formatPriceFor(v as number)) },
    {
      key: "variance",
      header: "Variance",
      align: "right",
      render: (r) =>
        r.variance == null ? (
          <StatusBadge tone="info">Open</StatusBadge>
        ) : Math.abs(r.variance) < 0.01 ? (
          <StatusBadge tone="success">Balanced</StatusBadge>
        ) : (
          <StatusBadge tone={r.variance < 0 ? "danger" : "warning"} withDot>
            {r.variance < 0 ? "−" : "+"}{formatPriceFor(Math.abs(r.variance))}
          </StatusBadge>
        ),
    },
  ]

  return (
    <ReportShell
      title="Cash drawer"
      description="Till sessions, expected vs counted cash, and variance"
      titleTooltip={
        <>
          Every cashier shift with its opening float, sales, expected cash, and what was
          actually counted at close. A negative{" "}
          <GlossaryLink termId="register-variance">variance</GlossaryLink> means the drawer was
          <strong> short</strong>; positive means <strong>over</strong>. Persistent shorts on one
          cashier are worth a look.
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-cash-drawer-${period}`}
      exportRows={rows.map((r) => ({
        Cashier: r.cashier, Location: r.location, Opened: r.opened, Sales: r.sales,
        Expected: r.expected, Counted: r.counted ?? "", Variance: r.variance ?? "", Status: r.status,
      }))}
    >
      <KpiBand
        items={[
          { title: "Sessions", value: String(rows.length), Icon: Hash, tone: "violet" },
          { title: "Total sales", value: formatPrice(rows.reduce((s, r) => s + r.sales, 0)), Icon: Wallet, tone: "emerald" },
          { title: "Net variance", value: formatPrice(totalVariance), Icon: Scale, tone: Math.abs(totalVariance) < 0.01 ? "sky" : "amber" },
          { title: "Short drawers", value: String(shortCount), Icon: Banknote, tone: shortCount > 0 ? "rose" : "sky" },
        ]}
      />
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Shift sessions</p></div>
        <div className="p-3"><DataTable columns={cols} rows={rows} rowKey={(r) => r.id} /></div>
      </div>
    </ReportShell>
  )
}
