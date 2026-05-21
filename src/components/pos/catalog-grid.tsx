import * as React from "react"
import { Plus, Search } from "lucide-react"
import type { CartItem, CatalogItem } from "@/lib/pos/storage"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/contexts/currency"
import { cn } from "@/lib/utils"

type Props = {
  catalog: CatalogItem[]
  onAdd: (item: CatalogItem) => void
  businessMode: "retail" | "restaurant" | "services" | "auto"
  /** Pass the current cart so each tile can show a qty badge for items already added. */
  cart?: CartItem[]
}

// Catalog grid with horizontal-snap filter chips + product tiles.
// Tapping a tile adds the product. Already-in-cart items show a qty
// badge in the top-right corner.
export function CatalogGrid({ catalog, onAdd, cart }: Props) {
  const [q, setQ] = React.useState("")
  const [category, setCategory] = React.useState<string>("All")
  const { formatPrice } = useCurrency()

  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(catalog.map((c) => c.category).filter(Boolean) as string[]))],
    [catalog],
  )

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    return catalog
      .filter((c) => (category === "All" ? true : c.category === category))
      .filter((c) => (s ? c.name.toLowerCase().includes(s) || c.sku.toLowerCase().includes(s) : true))
  }, [q, category, catalog])

  const cartBySku = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const c of cart ?? []) m.set(c.sku, (m.get(c.sku) ?? 0) + c.qty)
    return m
  }, [cart])

  return (
    <div className="flex flex-col gap-3">
      {/* Sticky search header on mobile so it stays visible while scrolling */}
      <div className="sticky top-14 z-10 -mx-4 border-b border-border bg-background px-4 pt-2 pb-3 md:static md:mx-0 md:border-0 md:px-0 md:py-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products by name or SKU…"
            className="pl-9"
          />
        </div>

        {/* Category pills — scroll horizontally on mobile */}
        <div className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:px-0">
          {categories.map((c) => {
            const active = category === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-transparent bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((p) => {
          const inCart = cartBySku.get(p.sku) ?? 0
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => onAdd(p)}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-all",
                "hover:border-brand/40 hover:shadow-md active:scale-[0.98]",
              )}
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={p.image || "/placeholder.svg"}
                  alt={p.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                {inCart > 0 && (
                  <span className="absolute right-2 top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold tabular-nums text-brand-foreground shadow-sm shadow-brand/30 dark:bg-primary dark:text-primary-foreground">
                    {inCart}
                  </span>
                )}
                <span className="absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-brand shadow-sm backdrop-blur-sm transition-transform group-hover:scale-110 dark:bg-card/80 dark:text-primary">
                  <Plus className="h-4 w-4" strokeWidth={2.4} />
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 p-3">
                <span className="truncate text-sm font-semibold">{p.name}</span>
                <span className="truncate text-[11px] text-muted-foreground">
                  <span className="font-mono">{p.sku}</span>
                  {p.category && <> · {p.category}</>}
                </span>
                <span className="mt-1 text-sm font-bold tabular-nums">{formatPrice(p.price)}</span>
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          No products match. Adjust the search or category filter.
        </div>
      )}
    </div>
  )
}
