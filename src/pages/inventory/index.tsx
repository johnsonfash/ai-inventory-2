import * as React from "react"
import { Link } from "react-router-dom"
import {
  Edit3,
  Filter,
  Package2,
  Plus,
  Search,
  Tag,
  Truck,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { EmptyState } from "@/components/lists/empty-state"
import { FilterChips, type FilterChip } from "@/components/lists/filter-chips"
import { FilterButton } from "@/components/lists/filter-button"
import {
  FilterPillGroup,
  FilterSection,
  FilterSheet,
} from "@/components/lists/filter-sheet"
import { SwipeableRow } from "@/components/mobile/swipeable-row"
import { cn } from "@/lib/utils"

type Item = {
  sku: string
  name: string
  image: string
  category: string
  brand: string
  unit: string
  warranty: string
  location: string
  stock: number
  reorder: number
  price: number
}

const items: Item[] = [
  { sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", image: "/placeholder.svg", category: "Electronics", brand: "Cobalt", unit: "pcs", warranty: "12 mo", location: "WH-A", stock: 12, reorder: 25, price: 28.5 },
  { sku: "AP-4012", name: "Cotton Tee — Black", image: "/placeholder.svg", category: "Apparel", brand: "Delta", unit: "pcs", warranty: "N/A", location: "WH-B", stock: 8, reorder: 20, price: 12.0 },
  { sku: "HM-2205", name: "Ceramic Mug 12oz", image: "/placeholder.svg", category: "Home", brand: "Porcel", unit: "pcs", warranty: "6 mo", location: "WH-C", stock: 54, reorder: 40, price: 8.0 },
  { sku: "BT-9091", name: "Hydrating Serum", image: "/placeholder.svg", category: "Beauty", brand: "Glow Co", unit: "btl", warranty: "N/A", location: "WH-A", stock: 5, reorder: 15, price: 18.95 },
  { sku: "EL-1001", name: "Wireless Mouse", image: "/placeholder.svg", category: "Electronics", brand: "Acme", unit: "pcs", warranty: "24 mo", location: "WH-B", stock: 24, reorder: 30, price: 22.0 },
  { sku: "AP-4015", name: "Linen Shirt — Stone", image: "/placeholder.svg", category: "Apparel", brand: "Delta", unit: "pcs", warranty: "N/A", location: "WH-B", stock: 0, reorder: 12, price: 38.0 },
  { sku: "HM-2240", name: "Tea Towel Set", image: "/placeholder.svg", category: "Home", brand: "Porcel", unit: "set", warranty: "N/A", location: "WH-C", stock: 36, reorder: 25, price: 14.5 },
]

const CATEGORY_OPTIONS = [
  { value: "Electronics", label: "Electronics" },
  { value: "Apparel", label: "Apparel" },
  { value: "Home", label: "Home" },
  { value: "Beauty", label: "Beauty" },
] as const
const STOCK_OPTIONS = [
  { value: "all", label: "All" },
  { value: "in", label: "In stock" },
  { value: "low", label: "Low" },
  { value: "out", label: "Out" },
] as const
const SORT_OPTIONS = [
  { value: "name", label: "Name (A → Z)" },
  { value: "stock-asc", label: "Stock (low first)" },
  { value: "stock-desc", label: "Stock (high first)" },
  { value: "price-desc", label: "Price (high first)" },
] as const

type StockFilter = (typeof STOCK_OPTIONS)[number]["value"]
type SortKey = (typeof SORT_OPTIONS)[number]["value"]

function stockStatus(it: Item): { tone: StatusTone; label: string } {
  if (it.stock === 0) return { tone: "danger", label: "Out" }
  if (it.stock <= it.reorder * 0.4) return { tone: "danger", label: "Critical" }
  if (it.stock < it.reorder) return { tone: "warning", label: "Low" }
  return { tone: "success", label: "OK" }
}

export default function InventoryItems() {
  const isMobile = useIsMobile()
  const [query, setQuery] = React.useState("")
  const [filterOpen, setFilterOpen] = React.useState(false)

  const [stagedCategories, setStagedCategories] = React.useState<string[]>([])
  const [stagedStock, setStagedStock] = React.useState<StockFilter>("all")
  const [stagedSort, setStagedSort] = React.useState<SortKey>("name")

  const [categories, setCategories] = React.useState<string[]>([])
  const [stock, setStock] = React.useState<StockFilter>("all")
  const [sort, setSort] = React.useState<SortKey>("name")

  const applyFilters = () => {
    setCategories(stagedCategories)
    setStock(stagedStock)
    setSort(stagedSort)
  }
  const resetFilters = () => {
    setStagedCategories([])
    setStagedStock("all")
    setStagedSort("name")
  }

  React.useEffect(() => {
    if (filterOpen) {
      setStagedCategories(categories)
      setStagedStock(stock)
      setStagedSort(sort)
    }
  }, [filterOpen, categories, stock, sort])

  useRegisterPageRefresh(
    React.useCallback(async () => {
      await new Promise((r) => setTimeout(r, 400))
    }, []),
  )

  const filtered = React.useMemo(() => {
    let list = items
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.sku.toLowerCase().includes(q) ||
          it.brand.toLowerCase().includes(q),
      )
    }
    if (categories.length > 0) list = list.filter((it) => categories.includes(it.category))
    if (stock !== "all") {
      list = list.filter((it) => {
        if (stock === "out") return it.stock === 0
        if (stock === "low") return it.stock > 0 && it.stock < it.reorder
        if (stock === "in") return it.stock >= it.reorder
        return true
      })
    }
    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "stock-asc": return a.stock - b.stock
        case "stock-desc": return b.stock - a.stock
        case "price-desc": return b.price - a.price
        default: return a.name.localeCompare(b.name)
      }
    })
    return sorted
  }, [query, categories, stock, sort])

  const chips: FilterChip[] = React.useMemo(() => {
    const c: FilterChip[] = []
    for (const cat of categories) {
      c.push({ key: `cat:${cat}`, label: cat, onRemove: () => setCategories((p) => p.filter((x) => x !== cat)) })
    }
    if (stock !== "all") {
      const opt = STOCK_OPTIONS.find((o) => o.value === stock)!
      c.push({ key: `stock:${stock}`, label: `Stock: ${opt.label}`, onRemove: () => setStock("all") })
    }
    if (sort !== "name") {
      const opt = SORT_OPTIONS.find((o) => o.value === sort)!
      c.push({ key: `sort:${sort}`, label: `Sort: ${opt.label}`, onRemove: () => setSort("name") })
    }
    return c
  }, [categories, stock, sort])

  const appliedCount = chips.length

  const total = items.length
  const lowCount = items.filter((it) => it.stock > 0 && it.stock < it.reorder).length
  const oosCount = items.filter((it) => it.stock === 0).length
  const totalValue = items.reduce((s, it) => s + it.stock * it.price, 0)

  return (
    <PageShell
      title="Inventory"
      withToolbar
      mobileTrailing={<FilterButton onClick={() => setFilterOpen(true)} count={appliedCount} />}
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip total={total} lowCount={lowCount} oosCount={oosCount} totalValue={totalValue} />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items, SKU, brand…"
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="hidden md:inline-flex" onClick={() => setFilterOpen(true)}>
            <Filter className="h-4 w-4" /> Filters {appliedCount ? `(${appliedCount})` : ""}
          </Button>
          <Link to="/inventory/new" className="hidden md:inline-flex">
            <Button>
              <Plus className="h-4 w-4" /> New item
            </Button>
          </Link>
        </div>

        <FilterChips
          chips={chips}
          onClearAll={appliedCount > 0 ? () => { setCategories([]); setStock("all"); setSort("name") } : undefined}
        />

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                Icon={Package2}
                title="No items match"
                description="Try adjusting filters or clearing the search box."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("")
                      setCategories([])
                      setStock("all")
                      setSort("name")
                    }}
                  >
                    Reset everything
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : isMobile ? (
          <MobileItemList items={filtered} />
        ) : (
          <DesktopItemTable items={filtered} />
        )}
      </div>

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={applyFilters}
        onReset={resetFilters}
        appliedCount={appliedCount}
        title="Filter inventory"
        description="Drill down by category, stock state, or sort order."
      >
        <FilterSection title="Categories" hint="Select multiple">
          <FilterPillGroup
            multi
            options={CATEGORY_OPTIONS as unknown as { value: string; label: string }[]}
            value={stagedCategories}
            onChange={(v) => setStagedCategories(Array.isArray(v) ? v : v ? [v] : [])}
          />
        </FilterSection>
        <FilterSection title="Stock state">
          <FilterPillGroup
            options={STOCK_OPTIONS as unknown as { value: StockFilter; label: string }[]}
            value={stagedStock}
            onChange={(v) => setStagedStock((v as StockFilter) ?? "all")}
          />
        </FilterSection>
        <FilterSection title="Sort by">
          <FilterPillGroup
            options={SORT_OPTIONS as unknown as { value: SortKey; label: string }[]}
            value={stagedSort}
            onChange={(v) => setStagedSort((v as SortKey) ?? "name")}
          />
        </FilterSection>
      </FilterSheet>
    </PageShell>
  )
}

function SummaryStrip({
  total,
  lowCount,
  oosCount,
  totalValue,
}: {
  total: number
  lowCount: number
  oosCount: number
  totalValue: number
}) {
  const tiles = [
    { label: "Total SKUs", value: total.toLocaleString(), tone: "brand" as StatusTone, hint: "active" },
    { label: "Low stock", value: lowCount.toLocaleString(), tone: "warning" as StatusTone, hint: "watch" },
    { label: "Out of stock", value: oosCount.toLocaleString(), tone: "danger" as StatusTone, hint: "act now" },
    { label: "Stock value", value: `$${Math.round(totalValue).toLocaleString()}`, tone: "success" as StatusTone, hint: "healthy" },
  ]
  return (
    <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-4 md:gap-3 md:overflow-visible md:px-0">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="min-w-[140px] flex-shrink-0 snap-start rounded-2xl border border-border bg-card p-3 md:min-w-0"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{t.value}</p>
          <div className="mt-1.5">
            <StatusBadge tone={t.tone} withDot>{t.hint}</StatusBadge>
          </div>
        </div>
      ))}
    </div>
  )
}

function MobileItemList({ items }: { items: Item[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it) => {
        const s = stockStatus(it)
        const pct = Math.min(100, (it.stock / Math.max(1, it.reorder)) * 100)
        return (
          <li key={it.sku}>
            <SwipeableRow
              rightActions={[
                {
                  label: "Receive",
                  tone: "primary",
                  icon: <Truck className="h-4 w-4" />,
                  onPress: () => {},
                },
                {
                  label: "Edit",
                  tone: "neutral",
                  icon: <Edit3 className="h-4 w-4" />,
                  onPress: () => {},
                },
              ]}
            >
              <div className="flex items-center gap-3 p-3">
                <img
                  src={it.image}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 shrink-0 rounded-lg border border-border bg-muted object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{it.name}</p>
                    <p className="shrink-0 text-sm font-semibold tabular-nums">${it.price.toFixed(2)}</p>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span className="truncate">
                      <span className="font-mono">{it.sku}</span> · {it.category} · {it.location}
                    </span>
                    <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-1 rounded-full",
                          s.tone === "danger" && "bg-rose-500",
                          s.tone === "warning" && "bg-amber-500",
                          s.tone === "success" && "bg-emerald-500",
                          s.tone === "info" && "bg-sky-500",
                          s.tone === "neutral" && "bg-muted-foreground",
                          s.tone === "brand" && "bg-brand dark:bg-primary",
                        )}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                      {it.stock}/{it.reorder} {it.unit}
                    </span>
                  </div>
                </div>
              </div>
            </SwipeableRow>
          </li>
        )
      })}
    </ul>
  )
}

function DesktopItemTable({ items }: { items: Item[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2.5 font-medium">Item</th>
            <th className="px-3 py-2.5 font-medium">SKU</th>
            <th className="px-3 py-2.5 font-medium">Category</th>
            <th className="px-3 py-2.5 font-medium">Location</th>
            <th className="px-3 py-2.5 text-right font-medium">Stock</th>
            <th className="px-3 py-2.5 text-right font-medium">Price</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 text-right font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((it) => {
            const s = stockStatus(it)
            return (
              <tr key={it.sku} className="transition-colors hover:bg-accent/30">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.image}
                      alt=""
                      loading="lazy"
                      className="h-9 w-9 rounded-md border border-border bg-muted object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{it.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {it.brand} · {it.unit}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{it.sku}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    {it.category}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{it.location}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {it.stock}
                  <span className="text-muted-foreground">/{it.reorder}</span>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">${it.price.toFixed(2)}</td>
                <td className="px-3 py-2.5">
                  <StatusBadge tone={s.tone} withDot>
                    {s.label}
                  </StatusBadge>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Button size="sm" variant="ghost" asChild>
                    <Link to="/inventory">View</Link>
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
