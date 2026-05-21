import * as React from "react"
import { Barcode, MoreHorizontal, Plus, Search } from "lucide-react"
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
  /** Mobile-only: scan trigger rendered as a brand-filled button in the
   *  sticky search bar. Tapping opens the parent's scan sheet. */
  onScanRequest?: () => void
  /** Mobile-only: overflow trigger (drafts / invoices / returns / settings). */
  onOverflowRequest?: () => void
}

// Catalog grid with horizontal-snap filter chips + product tiles.
// Tapping a tile adds the product. Already-in-cart items show a qty
// badge in the top-right corner.
export function CatalogGrid({ catalog, onAdd, cart, onScanRequest, onOverflowRequest }: Props) {
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
    // pb-32 on mobile so the persistent cart bar (~64px) + bottom nav
    // (~64px) don't cover the last list item.
    <div className="flex flex-col gap-3 pb-32 md:pb-0">
      {/* Sticky search header on mobile so it stays visible while
          scrolling. The scroll container is <main>, which sits BELOW
          the mobile top bar (the top bar is a sibling, not an
          ancestor). So sticky top-0 pins this bar at main's visible
          top — which is right under the page header. The earlier
          `top-14` (56px) was wrong: it pinned 56px below main's
          visible top, i.e. ~56px below the page header. */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-background px-4 pt-2 pb-2 md:static md:mx-0 md:border-0 md:px-0 md:py-0">
        <div className="flex items-stretch gap-1.5">
          {/* Mobile scan launcher — only renders when parent provides
              the callback (mobile POS does). Brand-filled to read as
              the page's primary "add" action. */}
          {onScanRequest && (
            <button
              type="button"
              onClick={onScanRequest}
              aria-label="Scan barcode"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm shadow-brand/30 active:scale-[0.97] dark:bg-primary dark:text-primary-foreground md:hidden"
            >
              <Barcode className="h-4 w-4" />
            </button>
          )}

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="h-11 pl-9"
            />
          </div>

          {/* Mobile overflow menu — drafts / invoices / returns / settings. */}
          {onOverflowRequest && (
            <button
              type="button"
              onClick={onOverflowRequest}
              aria-label="POS actions"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-foreground/80 hover:bg-accent active:scale-[0.97] md:hidden"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
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

      {/* Fluid catalog grid — uses CSS Grid's auto-fit with minmax so
          column count adapts continuously to viewport width instead
          of jumping at fixed breakpoints. At 320px (smallest phone):
          ~2 cols of 144px. At 489px: ~3 cols of 145px. At 768px:
          ~4 cols of 180px. At 1024px (with cart): ~3 cols. At 1280px+
          (with cart): 5 cols. No hard transitions. */}
      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(160px, 100%), 1fr))" }}
      >
        {filtered.map((p) => {
          const inCart = cartBySku.get(p.sku) ?? 0
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => onAdd(p)}
              className={cn(
                "group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-all",
                "hover:border-brand/40 hover:shadow-md active:scale-[0.98]",
                inCart > 0 && "border-brand/40 ring-1 ring-brand/20 dark:ring-primary/20",
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
                <span className="absolute bottom-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-brand shadow-sm backdrop-blur-sm transition-transform group-hover:scale-110 dark:bg-card/80 dark:text-primary">
                  <Plus className="h-4 w-4" strokeWidth={2.4} />
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 p-2.5">
                <span className="truncate text-sm font-semibold">{p.name}</span>
                <span className="truncate text-[11px] text-muted-foreground">
                  <span className="font-mono">{p.sku}</span>
                  {p.category && <> · {p.category}</>}
                </span>
                <span className="mt-0.5 text-sm font-bold tabular-nums">{formatPrice(p.price)}</span>
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
