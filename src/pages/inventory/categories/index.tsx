import * as React from "react"
import { Link } from "react-router-dom"
import { Layers, Plus, Search, Tag } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/contexts/currency"

type Row = { name: string; skus: number; revenue: number; tone: number }

const rows: Row[] = [
  { name: "Electronics", skus: 412, revenue: 84200, tone: 0 },
  { name: "Apparel", skus: 286, revenue: 38400, tone: 1 },
  { name: "Home", skus: 218, revenue: 21800, tone: 2 },
  { name: "Beauty", skus: 142, revenue: 14820, tone: 3 },
  { name: "Food & Bev", skus: 96, revenue: 6420, tone: 4 },
  { name: "Other", skus: 32, revenue: 1260, tone: 5 },
]

const TINTS = [
  "bg-brand/15 text-brand dark:bg-primary/20 dark:text-primary",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
]

export default function Categories() {
  const [query, setQuery] = React.useState("")
  const { formatPrice } = useCurrency()

  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q))
  }, [query])

  const totalSkus = rows.reduce((s, r) => s + r.skus, 0)
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
  const top = [...rows].sort((a, b) => b.revenue - a.revenue)[0]!

  return (
    <PageShell
      title="Categories"
      withToolbar
      titleTooltip={
        <>
          Groupings that bucket similar items together — Apparel,
          Electronics, Beauty, Food, etc. Categories drive reports
          ("revenue by category"), tax overrides, and the storefront
          menu structure. Every item belongs to exactly one category.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Categories", value: String(rows.length), tone: "brand", hint: "tracked" },
            { label: "Total SKUs", value: totalSkus.toLocaleString(), tone: "info", hint: "classified" },
            { label: "Revenue", value: formatPrice(totalRevenue), tone: "success", hint: "all categories" },
            { label: "Top", value: top.name, tone: "warning", hint: formatPrice(top.revenue) },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search categories…" className="pl-9" />
          </div>
          <Link to="/inventory/categories/new" className="hidden md:inline-flex">
            <Button><Plus className="h-4 w-4" /> Add category</Button>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={Tag} title="No categories match" description="Try a different name or add a new category." />
          </CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => {
              const pct = totalRevenue > 0 ? Math.round((r.revenue / totalRevenue) * 100) : 0
              return (
                <Link
                  key={r.name}
                  to="/inventory/categories"
                  className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TINTS[r.tone] ?? TINTS[0])}>
                      <Layers className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">{r.skus.toLocaleString()} SKUs</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-lg font-bold tabular-nums">{formatPrice(r.revenue)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-1 rounded-full bg-gradient-to-r from-brand to-fuchsia-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{pct}%</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </PageShell>
  )
}
