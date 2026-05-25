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
import { loadAllCatalog } from "@/lib/pos/storage"
import { deriveUnit, unitMeta } from "@/lib/inventory/derive"

type Row = { code: string; name: string; type: "discrete" | "weight" | "volume" | "length" | "time"; baseFor?: string; skus: number }

// Derived from the POS catalog: which units the live items actually use,
// with a count of items per unit. No mock — stays in sync with the till.
function deriveUnits(): Row[] {
  const counts = new Map<string, number>()
  for (const c of loadAllCatalog()) {
    const code = deriveUnit(c)
    counts.set(code, (counts.get(code) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([code, skus]) => ({ code, skus, ...unitMeta(code) }))
    .sort((a, b) => b.skus - a.skus)
}

export default function Units() {
  const [query, setQuery] = React.useState("")
  const [rows, setRows] = React.useState<Row[]>(() => deriveUnits())
  useRegisterPageRefresh(React.useCallback(async () => { setRows(deriveUnits()); await new Promise((r) => setTimeout(r, 300)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
  }, [query, rows])

  const totalSkus = rows.reduce((s, r) => s + r.skus, 0)
  const compoundCount = rows.filter((r) => r.baseFor).length

  return (
    <PageShell
      title="Units of measure"
      withToolbar
      titleTooltip={
        <>
          The way you sell an item — pieces, boxes, kilograms, litres,
          dozens. Tracking the unit prevents confusion when staff
          rings up "5" of something the supplier sold you in cartons
          of 24.
        </>
      }
    >
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
