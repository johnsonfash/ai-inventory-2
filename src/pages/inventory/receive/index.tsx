import * as React from "react"
import { ChevronRight, Package, Truck } from "lucide-react"
import { Link } from "react-router-dom"
import { PageShell } from "@/components/page-shell"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"

type Row = {
  po: string
  vendor: string
  items: number
  expected: string
  status: "pending" | "partial" | "today"
}

const rows: Row[] = [
  { po: "PO-1042", vendor: "Cobalt Distributors", items: 8, expected: "Today", status: "today" },
  { po: "PO-1041", vendor: "Glow Co", items: 4, expected: "Today", status: "partial" },
  { po: "PO-1040", vendor: "Acme Supplies", items: 6, expected: "May 22", status: "pending" },
  { po: "PO-1038", vendor: "Delta Apparel", items: 24, expected: "May 24", status: "pending" },
]

const statusTone: Record<Row["status"], StatusTone> = {
  today: "warning",
  partial: "info",
  pending: "neutral",
}

export default function ReceiveStock() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const today = rows.filter((r) => r.status === "today").length
  const partial = rows.filter((r) => r.status === "partial").length
  const totalItems = rows.reduce((s, r) => s + r.items, 0)

  return (
    <PageShell
      title="Receive stock"
      withToolbar
      titleTooltip={
        <>
          Pending arrivals — purchase orders that have shipped from
          your suppliers but haven't been signed for yet. Tap one when
          the boxes hit the dock and Pallio adds the units to your
          on-hand count.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Due today", value: String(today), tone: "warning", hint: "expected" },
            { label: "Partial", value: String(partial), tone: "info", hint: "in progress" },
            { label: "Open POs", value: String(rows.length), tone: "brand", hint: "to receive" },
            { label: "Units inbound", value: String(totalItems), tone: "success", hint: "across POs" },
          ]}
        />

        <p className="text-sm text-muted-foreground">
          Pick an open PO to begin scanning incoming items into stock.
        </p>

        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.po}>
              <Link
                to="/purchasing/pos"
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-brand/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                  <Truck className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{r.vendor}</p>
                    <StatusBadge tone={statusTone[r.status]} withDot>{r.status}</StatusBadge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    <span className="font-mono">{r.po}</span> · {r.items} items · expected {r.expected}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <Package className="h-4 w-4" />
          New stock without a matching PO? Use Inventory → Adjustments to record it.
        </div>
      </div>
    </PageShell>
  )
}
