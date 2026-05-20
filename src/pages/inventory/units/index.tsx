import * as React from "react"
import { Link } from "react-router-dom"
import { Edit3, Plus, Ruler, Search, Trash2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"

type Row = { code: string; name: string; type: "discrete" | "weight" | "volume" | "length" | "time"; baseFor?: string; skus: number }

const rows: Row[] = [
  { code: "pcs", name: "Pieces", type: "discrete", skus: 842 },
  { code: "box", name: "Box", type: "discrete", baseFor: "pcs · 12 per box", skus: 142 },
  { code: "kg", name: "Kilogram", type: "weight", skus: 96 },
  { code: "g", name: "Gram", type: "weight", baseFor: "1/1000 kg", skus: 38 },
  { code: "L", name: "Litre", type: "volume", skus: 24 },
  { code: "ml", name: "Millilitre", type: "volume", baseFor: "1/1000 L", skus: 18 },
  { code: "m", name: "Metre", type: "length", skus: 12 },
  { code: "hr", name: "Hour", type: "time", skus: 8 },
]

export default function Units() {
  const [query, setQuery] = React.useState("")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
  }, [query])

  const totalSkus = rows.reduce((s, r) => s + r.skus, 0)
  const compoundCount = rows.filter((r) => r.baseFor).length

  return (
    <PageShell title="Units of measure" withToolbar>
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Units", value: String(rows.length), tone: "brand", hint: "defined" },
            { label: "Items using", value: totalSkus.toLocaleString(), tone: "info", hint: "across catalog" },
            { label: "Compound", value: String(compoundCount), tone: "warning", hint: "linked" },
            { label: "Base types", value: String(new Set(rows.map((r) => r.type)).size), tone: "success", hint: "covered" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search units…" className="pl-9" />
          </div>
          <Link to="/inventory/units/new" className="hidden md:inline-flex">
            <Button><Plus className="h-4 w-4" /> Add unit</Button>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={Ruler} title="No units match" description="Try a different code or name." />
          </CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <div key={r.code} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                  <Ruler className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {r.name} <span className="text-muted-foreground">({r.code})</span>
                    </p>
                    <StatusBadge tone="info">{r.type}</StatusBadge>
                  </div>
                  {r.baseFor && <p className="mt-0.5 text-[11px] text-muted-foreground">{r.baseFor}</p>}
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{r.skus.toLocaleString()} items</p>
                  <div className="mt-2 flex items-center gap-1">
                    <Button size="sm" variant="ghost" aria-label="Edit"><Edit3 className="h-3.5 w-3.5" aria-hidden="true" /></Button>
                    <Button size="sm" variant="ghost" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
