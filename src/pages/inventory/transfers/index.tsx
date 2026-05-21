import * as React from "react"
import { ArrowLeftRight, MoveRight, Plus, Search } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"

type Status = "draft" | "in-transit" | "received" | "cancelled"
type Row = { id: string; from: string; to: string; items: number; status: Status; createdAt: string }

const rows: Row[] = [
  { id: "TR-104", from: "WH-A", to: "Downtown Austin", items: 24, status: "in-transit", createdAt: "2026-05-19" },
  { id: "TR-103", from: "WH-B", to: "WH-A", items: 60, status: "received", createdAt: "2026-05-17" },
  { id: "TR-102", from: "WH-A", to: "WH-C", items: 12, status: "received", createdAt: "2026-05-15" },
  { id: "TR-101", from: "WH-C", to: "Café Atlanta", items: 8, status: "draft", createdAt: "2026-05-13" },
  { id: "TR-100", from: "WH-A", to: "SXSW Popup", items: 40, status: "cancelled", createdAt: "2026-05-10" },
]

const statusTone: Record<Status, StatusTone> = {
  draft: "neutral",
  "in-transit": "info",
  received: "success",
  cancelled: "danger",
}

export default function Transfers() {
  const [query, setQuery] = React.useState("")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) => r.id.toLowerCase().includes(q) || r.from.toLowerCase().includes(q) || r.to.toLowerCase().includes(q),
    )
  }, [query])

  const inTransit = rows.filter((r) => r.status === "in-transit").length
  const received = rows.filter((r) => r.status === "received").length

  return (
    <PageShell
      title="Stock transfers"
      withToolbar
      titleTooltip={
        <>
          Moving units between your own locations — e.g. shifting a
          pallet from your Ikeja warehouse to the Lekki shop. Doesn't
          change your total on-hand, just where it sits. Use this
          instead of POs (which order from suppliers).
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Transfers", value: String(rows.length), tone: "brand", hint: "all time" },
            { label: "In transit", value: String(inTransit), tone: "info", hint: "moving" },
            { label: "Received", value: String(received), tone: "success", hint: "closed" },
            { label: "Drafts", value: String(rows.filter((r) => r.status === "draft").length), tone: "warning", hint: "queued" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by ID or location…" className="pl-9" />
          </div>
          <Button className="hidden md:inline-flex"><Plus className="h-4 w-4" /> New transfer</Button>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={ArrowLeftRight} title="No transfers match" description="Try a different ID or location." />
          </CardContent></Card>
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                  <ArrowLeftRight className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {r.from} <MoveRight className="inline h-3 w-3 text-muted-foreground" /> {r.to}
                    </p>
                    <StatusBadge tone={statusTone[r.status]} withDot>{r.status}</StatusBadge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    <span className="font-mono">{r.id}</span> · {r.items} items · {r.createdAt}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
