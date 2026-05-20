import * as React from "react"
import { Link } from "react-router-dom"
import { Plus, Search, Sparkles } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { useCurrency } from "@/contexts/currency"

type Row = { name: string; supplier: string; skus: number; revenue: number }

const rows: Row[] = [
  { name: "Cobalt", supplier: "Cobalt Distributors", skus: 84, revenue: 18420 },
  { name: "Delta", supplier: "Delta Apparel", skus: 142, revenue: 24600 },
  { name: "Acme", supplier: "Acme Supplies", skus: 56, revenue: 9420 },
  { name: "Porcel", supplier: "Porcel Ceramics", skus: 48, revenue: 5210 },
  { name: "Glow Co", supplier: "Glow Co", skus: 32, revenue: 7180 },
]

function initialsOf(name: string) {
  return name.split(/\s+/).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("")
}

function avatarTint(name: string) {
  const palette = [
    "bg-brand/15 text-brand dark:bg-primary/20 dark:text-primary",
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]!
}

export default function Brands() {
  const [query, setQuery] = React.useState("")
  const { formatPrice } = useCurrency()

  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.supplier.toLowerCase().includes(q))
  }, [query])

  const totalSkus = rows.reduce((s, r) => s + r.skus, 0)
  const top = [...rows].sort((a, b) => b.revenue - a.revenue)[0]!

  return (
    <PageShell title="Brands" withToolbar>
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Brands", value: String(rows.length), tone: "brand", hint: "tracked" },
            { label: "SKUs", value: totalSkus.toLocaleString(), tone: "info", hint: "all brands" },
            { label: "Top brand", value: top.name, tone: "success", hint: formatPrice(top.revenue) },
            { label: "Suppliers", value: String(new Set(rows.map((r) => r.supplier)).size), tone: "warning", hint: "linked" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brand or supplier…" className="pl-9" />
          </div>
          <Link to="/inventory/brands/new" className="hidden md:inline-flex">
            <Button><Plus className="h-4 w-4" /> Add brand</Button>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={Sparkles} title="No brands match" description="Try a different name." />
          </CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <Link
                key={r.name}
                to="/inventory/brands"
                className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${avatarTint(r.name)}`}>
                    {initialsOf(r.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{r.supplier}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-lg font-bold tabular-nums">{formatPrice(r.revenue)}</p>
                  <p className="text-[11px] text-muted-foreground">{r.skus} SKUs</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
