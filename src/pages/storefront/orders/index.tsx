import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  Mail,
  Package,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { EmptyState } from "@/components/lists/empty-state"
import { Avatar } from "@/components/avatar"
import { ConnectionChip } from "@/components/integrations/connection-chip"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { useCurrency } from "@/contexts/currency"
import { getStorefrontState, TEMPLATES_BY_ID } from "@/lib/storefront/data"
import { cn } from "@/lib/utils"

// Orders placed through the hosted storefront. Distinct from
// /sales/orders (which includes POS + manual + wholesale + online)
// because storefront-only context is useful — it lets the owner see
// abandoned carts, the courier rail used, the device the customer
// shopped on.

type FulfillmentStatus = "new" | "preparing" | "shipped" | "delivered" | "cancelled"
type PaymentStatus = "paid" | "pending" | "refunded" | "failed"

type StorefrontOrder = {
  id: string
  customer: { name: string; email: string; avatar?: string }
  items: { sku: string; name: string; qty: number; image: string }[]
  subtotal: number
  shipping: number
  total: number
  payment: PaymentStatus
  fulfillment: FulfillmentStatus
  courier: string
  device: "mobile" | "desktop" | "tablet"
  placedAt: string
  city: string
}

const ORDERS: StorefrontOrder[] = [
  {
    id: "SHOP-7901",
    customer: { name: "Aisha Nwosu", email: "aisha@personal.io" },
    items: [
      { sku: "BT-9091", name: "Hydrating Serum",  qty: 2, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=120&h=120&fit=crop&auto=format&q=80" },
      { sku: "HM-2205", name: "Ceramic Mug 12oz", qty: 1, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=120&h=120&fit=crop&auto=format&q=80" },
    ],
    subtotal: 41_000, shipping: 1_500, total: 42_500,
    payment: "paid", fulfillment: "new", courier: "GIG Logistics",
    device: "mobile", placedAt: "12 min ago", city: "Lekki, Lagos",
  },
  {
    id: "SHOP-7898",
    customer: { name: "Linda Mensah", email: "linda.m@studio.so" },
    items: [
      { sku: "AP-4012", name: "Cotton Tee — Black", qty: 4, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop&auto=format&q=80" },
    ],
    subtotal: 50_000, shipping: 1_500, total: 51_500,
    payment: "paid", fulfillment: "preparing", courier: "GIG Logistics",
    device: "mobile", placedAt: "2h ago", city: "Ikeja, Lagos",
  },
  {
    id: "SHOP-7884",
    customer: { name: "Daniel Kim", email: "dk@neuroframe.dev" },
    items: [
      { sku: "EL-2109", name: "USB-C Hub 6-in-1", qty: 1, image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=120&h=120&fit=crop&auto=format&q=80" },
      { sku: "EL-1001", name: "Wireless Mouse",    qty: 1, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=120&h=120&fit=crop&auto=format&q=80" },
    ],
    subtotal: 45_000, shipping: 2_800, total: 47_800,
    payment: "paid", fulfillment: "shipped", courier: "Sendbox",
    device: "desktop", placedAt: "5h ago", city: "Yaba, Lagos",
  },
  {
    id: "SHOP-7882",
    customer: { name: "Sade Adeyemi", email: "sade@gmail.com" },
    items: [
      { sku: "HM-2205", name: "Ceramic Mug 12oz", qty: 3, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=120&h=120&fit=crop&auto=format&q=80" },
    ],
    subtotal: 24_000, shipping: 1_500, total: 25_500,
    payment: "pending", fulfillment: "new", courier: "Kwik Delivery",
    device: "mobile", placedAt: "1d ago", city: "Surulere, Lagos",
  },
  {
    id: "SHOP-7860",
    customer: { name: "Tunde Bello", email: "tunde@ekopro.com" },
    items: [
      { sku: "AP-4012", name: "Cotton Tee — Black", qty: 2, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop&auto=format&q=80" },
      { sku: "BT-9091", name: "Hydrating Serum",    qty: 1, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=120&h=120&fit=crop&auto=format&q=80" },
    ],
    subtotal: 43_000, shipping: 2_800, total: 45_800,
    payment: "paid", fulfillment: "delivered", courier: "GIG Logistics",
    device: "mobile", placedAt: "3d ago", city: "Wuse 2, Abuja",
  },
  {
    id: "SHOP-7842",
    customer: { name: "Funke Adesanya", email: "funke@apparel.com" },
    items: [
      { sku: "EL-2109", name: "USB-C Hub 6-in-1", qty: 1, image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=120&h=120&fit=crop&auto=format&q=80" },
    ],
    subtotal: 25_000, shipping: 1_500, total: 26_500,
    payment: "refunded", fulfillment: "cancelled", courier: "—",
    device: "mobile", placedAt: "5d ago", city: "Lekki, Lagos",
  },
  {
    id: "SHOP-7821",
    customer: { name: "Chiamaka Okeke", email: "ops@lagosmart.ng" },
    items: [
      { sku: "HM-2205", name: "Ceramic Mug 12oz",   qty: 12, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=120&h=120&fit=crop&auto=format&q=80" },
      { sku: "AP-4012", name: "Cotton Tee — Black", qty: 8,  image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop&auto=format&q=80" },
    ],
    subtotal: 196_000, shipping: 3_200, total: 199_200,
    payment: "paid", fulfillment: "delivered", courier: "Sendbox",
    device: "desktop", placedAt: "6d ago", city: "Port Harcourt, Rivers",
  },
  {
    id: "SHOP-7805",
    customer: { name: "Walk-in shopper", email: "guest@pallio.shop" },
    items: [
      { sku: "EL-1001", name: "Wireless Mouse", qty: 1, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=120&h=120&fit=crop&auto=format&q=80" },
    ],
    subtotal: 8_000, shipping: 1_500, total: 9_500,
    payment: "failed", fulfillment: "cancelled", courier: "—",
    device: "tablet", placedAt: "1w ago", city: "Ikeja, Lagos",
  },
]

const ABANDONED = [
  { id: "AB-9912", email: "kemi@studio.io",  total:  18_500, lastSeen: "32 min ago", items: 2 },
  { id: "AB-9908", email: "—",                total:  62_000, lastSeen: "1h ago",     items: 4 },
  { id: "AB-9901", email: "raphael@gmail.com", total: 9_500, lastSeen: "3h ago",     items: 1 },
  { id: "AB-9890", email: "—",                total:  34_000, lastSeen: "1d ago",     items: 3 },
]

const FULFILLMENT_TONE: Record<FulfillmentStatus, StatusTone> = {
  new:        "info",
  preparing:  "warning",
  shipped:    "brand",
  delivered:  "success",
  cancelled:  "neutral",
}

const PAYMENT_TONE: Record<PaymentStatus, StatusTone> = {
  paid:     "success",
  pending:  "warning",
  refunded: "neutral",
  failed:   "danger",
}

type Filter = "all" | "new" | "preparing" | "shipped" | "delivered" | "cancelled" | "abandoned"

export default function StorefrontOrders() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 250)) }, []))
  const isMobile = useIsMobile()
  const { formatPrice } = useCurrency()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<Filter>("all")

  const state = React.useMemo(() => getStorefrontState(), [])
  const template = state.templateId ? TEMPLATES_BY_ID[state.templateId] : null

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (filter === "abandoned") return [] // handled separately
    return ORDERS.filter((o) => {
      if (filter !== "all" && o.fulfillment !== filter) return false
      if (!q) return true
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
      )
    })
  }, [query, filter])

  // Counts for the chips
  const counts: Record<Filter, number> = {
    all:        ORDERS.length,
    new:        ORDERS.filter((o) => o.fulfillment === "new").length,
    preparing:  ORDERS.filter((o) => o.fulfillment === "preparing").length,
    shipped:    ORDERS.filter((o) => o.fulfillment === "shipped").length,
    delivered:  ORDERS.filter((o) => o.fulfillment === "delivered").length,
    cancelled:  ORDERS.filter((o) => o.fulfillment === "cancelled").length,
    abandoned:  ABANDONED.length,
  }

  // KPIs
  const totalToday = ORDERS.filter((o) => o.placedAt.endsWith("min ago") || o.placedAt.endsWith("h ago")).reduce((s, o) => s + o.total, 0)
  const totalRevenue = ORDERS.filter((o) => o.payment === "paid").reduce((s, o) => s + o.total, 0)
  const pendingCount = ORDERS.filter((o) => o.fulfillment === "new" || o.fulfillment === "preparing").length
  const abandonedValue = ABANDONED.reduce((s, a) => s + a.total, 0)

  if (!template) {
    return (
      <PageShell
        title="Storefront orders"
        withToolbar={false}
        titleTooltip="Orders placed through your hosted storefront. Available once you pick a template + publish."
      >
        <Card>
          <CardContent className="p-0">
            <EmptyState
              Icon={Globe}
              title="No storefront yet"
              description="Pick a template to start receiving orders."
              action={<Link to="/storefront/templates"><Button>Pick a template</Button></Link>}
            />
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Storefront orders"
      withToolbar={false}
      titleTooltip={
        <>
          Every sale placed through your hosted storefront — paid,
          pending, shipped, delivered. Includes abandoned carts so
          you can win them back via email or WhatsApp. Different from
          <strong> Sales → Orders</strong> which mixes POS + online +
          wholesale.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* KPIs */}
        <SummaryStrip
          tiles={[
            { label: "Today",         value: formatPrice(totalToday),     tone: "brand",   hint: "revenue" },
            { label: "Period total",  value: formatPrice(totalRevenue),   tone: "success", hint: "paid" },
            { label: "To fulfil",     value: String(pendingCount),        tone: pendingCount > 0 ? "warning" : "neutral", hint: pendingCount > 0 ? "need shipping" : "all caught up" },
            { label: "Abandoned",     value: formatPrice(abandonedValue), tone: "info",    hint: `${ABANDONED.length} carts` },
          ]}
        />

        {/* Courier integration strip — which couriers fulfil these
            orders. Tap any chip to deep-link to its connect / config. */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Couriers shipping your orders</p>
          <div className="flex flex-wrap gap-1.5">
            {["gig-logistics", "sendbox", "kwik", "dhl-express", "fez-delivery"].map((id) => (
              <ConnectionChip key={id} providerId={id} />
            ))}
          </div>
        </div>

        {/* Filter chips + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
            {(["all", "new", "preparing", "shipped", "delivered", "cancelled", "abandoned"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                  filter === f
                    ? "border-transparent bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {f === "all" ? "All" : f}
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  filter === f ? "bg-white/20" : "bg-muted",
                )}>
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative min-w-[200px] sm:ml-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, customer, city…"
              className="pl-9"
            />
          </div>
        </div>

        {/* List */}
        {filter === "abandoned" ? (
          <AbandonedList items={ABANDONED} formatPrice={formatPrice} />
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                Icon={ShoppingBag}
                title="No orders match"
                description="Try a different filter or clear the search."
                action={<Button variant="outline" onClick={() => { setQuery(""); setFilter("all") }}>Clear filters</Button>}
              />
            </CardContent>
          </Card>
        ) : isMobile ? (
          <ul className="flex flex-col gap-2">
            {filtered.map((o) => <OrderCard key={o.id} order={o} formatPrice={formatPrice} />)}
          </ul>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2.5 font-medium">Order</th>
                      <th className="px-3 py-2.5 font-medium">Customer</th>
                      <th className="px-3 py-2.5 font-medium">Items</th>
                      <th className="px-3 py-2.5 text-right font-medium">Total</th>
                      <th className="px-3 py-2.5 font-medium">Payment</th>
                      <th className="px-3 py-2.5 font-medium">Fulfilment</th>
                      <th className="px-3 py-2.5 font-medium">Courier</th>
                      <th className="px-3 py-2.5 font-medium">Placed</th>
                      <th className="px-3 py-2.5 text-right font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((o) => (
                      <tr key={o.id} className="transition-colors hover:bg-accent/30">
                        <td className="px-3 py-2.5">
                          <Link to={`/sales/orders`} className="font-mono text-xs font-semibold hover:underline">{o.id}</Link>
                          <p className="text-[10px] text-muted-foreground">{o.city}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Avatar seed={o.customer.email} name={o.customer.name} size={24} />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold">{o.customer.name}</p>
                              <p className="truncate text-[10px] text-muted-foreground">{o.customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            {o.items.slice(0, 3).map((it) => (
                              <img
                                key={it.sku}
                                src={it.image}
                                alt={it.name}
                                loading="lazy"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                className="h-7 w-7 rounded-md object-cover ring-1 ring-border"
                                title={`${it.name} × ${it.qty}`}
                              />
                            ))}
                            {o.items.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">+{o.items.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right text-xs font-bold tabular-nums">{formatPrice(o.total)}</td>
                        <td className="px-3 py-2.5"><StatusBadge tone={PAYMENT_TONE[o.payment]}>{o.payment}</StatusBadge></td>
                        <td className="px-3 py-2.5"><StatusBadge tone={FULFILLMENT_TONE[o.fulfillment]} withDot>{o.fulfillment}</StatusBadge></td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{o.courier}</td>
                        <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{o.placedAt}</td>
                        <td className="px-3 py-2.5 text-right">
                          <Button size="sm" variant="ghost"><ChevronRight className="h-3.5 w-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom CTAs */}
        <div className="grid gap-2 sm:grid-cols-3">
          <Link to="/sales/shipments/new" className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-brand/40 hover:bg-accent/40">
            <Truck className="h-4 w-4 text-brand dark:text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Bulk-print labels</p>
              <p className="text-[11px] text-muted-foreground">Ship today's preparing orders in one go.</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
          <Link to="/storefront/analytics" className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-brand/40 hover:bg-accent/40">
            <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">View analytics</p>
              <p className="text-[11px] text-muted-foreground">Conversion + traffic + top products.</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
          <Link to="/communications/new?template=abandoned-cart" className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-brand/40 hover:bg-accent/40">
            <Mail className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-300" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Win back abandoned carts</p>
              <p className="text-[11px] text-muted-foreground">{formatPrice(abandonedValue)} at risk.</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </PageShell>
  )
}

// ---------- Mobile order card ----------
function OrderCard({ order: o, formatPrice }: { order: StorefrontOrder; formatPrice: (n: number) => string }) {
  return (
    <li>
      <Link to={`/storefront/orders/${o.id}`} className="block rounded-2xl border border-border bg-card p-3 transition-colors hover:border-brand/40">
        <div className="flex items-start gap-3">
          <Avatar seed={o.customer.email} name={o.customer.name} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold">{o.customer.name}</p>
              <p className="shrink-0 text-sm font-bold tabular-nums">{formatPrice(o.total)}</p>
            </div>
            <p className="truncate text-[11px] text-muted-foreground">
              <span className="font-mono">{o.id}</span> · {o.city} · {o.placedAt}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge tone={PAYMENT_TONE[o.payment]}>{o.payment}</StatusBadge>
              <StatusBadge tone={FULFILLMENT_TONE[o.fulfillment]} withDot>{o.fulfillment}</StatusBadge>
              <span className="text-[10px] text-muted-foreground">via {o.courier}</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {o.items.slice(0, 4).map((it) => (
                <img
                  key={it.sku}
                  src={it.image}
                  alt={it.name}
                  loading="lazy"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-md object-cover ring-1 ring-border"
                  title={`${it.name} × ${it.qty}`}
                />
              ))}
              {o.items.length > 4 && <span className="text-[10px] text-muted-foreground">+{o.items.length - 4}</span>}
            </div>
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </Link>
    </li>
  )
}

// ---------- Abandoned carts ----------
function AbandonedList({
  items,
  formatPrice,
}: {
  items: typeof ABANDONED
  formatPrice: (n: number) => string
}) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            Icon={CheckCircle2}
            title="No abandoned carts"
            description="Every shopper either bought or never started a cart. Nice."
          />
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold md:text-base">Abandoned carts</h3>
            <p className="text-[11px] text-muted-foreground">Shoppers who added items but didn't complete checkout. Email them a nudge.</p>
          </div>
          <Link to="/communications/templates" className="text-[11px] font-semibold text-brand hover:underline dark:text-primary">Templates →</Link>
        </div>
        <ul className="mt-3 divide-y divide-border">
          {items.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                <Package className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold">
                    {c.email === "—" ? <span className="italic text-muted-foreground">Anonymous shopper</span> : c.email}
                  </p>
                  <p className="shrink-0 text-sm font-bold tabular-nums">{formatPrice(c.total)}</p>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  <span className="font-mono">{c.id}</span> · {c.items} items · <Clock className="inline h-2.5 w-2.5" /> {c.lastSeen}
                </p>
              </div>
              {c.email !== "—" ? (
                <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); toast.success(`Recovery email queued for ${c.email}.`) }}>
                  <Mail className="h-3.5 w-3.5" /> Email
                </Button>
              ) : (
                <StatusBadge tone="neutral">no email</StatusBadge>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// Reserved for the next pass (per-order phone CTA, alert banner).
void Phone; void AlertTriangle; void X
