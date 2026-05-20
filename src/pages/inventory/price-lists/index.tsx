import * as React from "react"
import { Link } from "react-router-dom"
import { DollarSign, Plus, Search, TagsIcon } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"

type Row = {
  id: string
  name: string
  audience: "Retail" | "Wholesale" | "VIP" | "Staff"
  basis: "cost+" | "msrp-" | "fixed"
  rule: string
  items: number
  status: "active" | "draft" | "archived"
}

const rows: Row[] = [
  { id: "PL-1", name: "Retail (default)", audience: "Retail", basis: "msrp-", rule: "MSRP − 0%", items: 1284, status: "active" },
  { id: "PL-2", name: "Wholesale", audience: "Wholesale", basis: "msrp-", rule: "MSRP − 35%", items: 1180, status: "active" },
  { id: "PL-3", name: "VIP loyalty", audience: "VIP", basis: "msrp-", rule: "MSRP − 12%", items: 1284, status: "active" },
  { id: "PL-4", name: "Staff", audience: "Staff", basis: "cost+", rule: "Cost + 5%", items: 1284, status: "active" },
  { id: "PL-5", name: "Holiday flat", audience: "Retail", basis: "fixed", rule: "Fixed (per-item)", items: 86, status: "draft" },
]

const audienceTone: Record<Row["audience"], StatusTone> = {
  Retail: "brand",
  Wholesale: "info",
  VIP: "warning",
  Staff: "success",
}
const statusTone: Record<Row["status"], StatusTone> = { active: "success", draft: "neutral", archived: "warning" }

export default function PriceLists() {
  const [query, setQuery] = React.useState("")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.audience.toLowerCase().includes(q))
  }, [query])

  const active = rows.filter((r) => r.status === "active").length
  const draft = rows.filter((r) => r.status === "draft").length

  return (
    <PageShell title="Price lists" withToolbar>
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Price lists", value: String(rows.length), tone: "brand", hint: "defined" },
            { label: "Active", value: String(active), tone: "success", hint: "live" },
            { label: "Audiences", value: String(new Set(rows.map((r) => r.audience)).size), tone: "info", hint: "covered" },
            { label: "Drafts", value: String(draft), tone: "warning", hint: "in progress" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or audience…" className="pl-9" />
          </div>
          <Link to="/inventory/price-lists/new" className="hidden md:inline-flex">
            <Button><Plus className="h-4 w-4" /> New price list</Button>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={TagsIcon} title="No price lists match" description="Try a different name." />
          </CardContent></Card>
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                  <DollarSign className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <StatusBadge tone={statusTone[r.status]} withDot>{r.status}</StatusBadge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <StatusBadge tone={audienceTone[r.audience]}>{r.audience}</StatusBadge>
                    <span className="font-mono">{r.rule}</span>
                    <span>· {r.items.toLocaleString()} items</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
