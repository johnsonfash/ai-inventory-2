import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Award,
  ChevronRight,
  Clock,
  Globe,
  Heart,
  Mail,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar } from "@/components/avatar"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { EmptyState } from "@/components/lists/empty-state"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { useCurrency } from "@/contexts/currency"
import { getStorefrontState, TEMPLATES_BY_ID } from "@/lib/storefront/data"
import { cn } from "@/lib/utils"

// Storefront-only customer view. Distinct from /sales/customers
// (which aggregates buyers from POS + online + wholesale). Lets the
// owner build email campaigns / segments scoped to people who bought
// through the hosted site.

type Tier = "vip" | "regular" | "new" | "lapsed"

type StorefrontCustomer = {
  name: string
  email: string
  city: string
  phone?: string
  device: "mobile" | "desktop" | "tablet"
  orders: number
  lifetimeSpend: number
  lastOrderDaysAgo: number
  tier: Tier
  acquiredFrom: "Direct" | "Instagram" | "Google" | "Facebook" | "TikTok" | "WhatsApp"
}

const CUSTOMERS: StorefrontCustomer[] = [
  { name: "Aisha Nwosu",     email: "aisha@personal.io",  city: "Lekki, Lagos",     phone: "+234 803 555 0118", device: "mobile",  orders: 9,  lifetimeSpend: 218_400, lastOrderDaysAgo: 0,  tier: "vip",     acquiredFrom: "Instagram" },
  { name: "Linda Mensah",    email: "linda.m@studio.so",  city: "Ikeja, Lagos",     phone: "+233 24 555 0119",  device: "mobile",  orders: 14, lifetimeSpend: 412_300, lastOrderDaysAgo: 0,  tier: "vip",     acquiredFrom: "Direct" },
  { name: "Daniel Kim",      email: "dk@neuroframe.dev",  city: "Yaba, Lagos",      device: "desktop", orders: 4,  lifetimeSpend:  92_500, lastOrderDaysAgo: 1,  tier: "regular", acquiredFrom: "Google" },
  { name: "Sade Adeyemi",    email: "sade@gmail.com",     city: "Surulere, Lagos",  phone: "+234 803 555 0142", device: "mobile",  orders: 2,  lifetimeSpend:  41_000, lastOrderDaysAgo: 5,  tier: "new",     acquiredFrom: "TikTok" },
  { name: "Tunde Bello",     email: "tunde@ekopro.com",   city: "Wuse 2, Abuja",    phone: "+234 803 555 0166", device: "mobile",  orders: 6,  lifetimeSpend: 138_900, lastOrderDaysAgo: 3,  tier: "regular", acquiredFrom: "Facebook" },
  { name: "Funke Adesanya",  email: "funke@apparel.com",  city: "Lekki, Lagos",     device: "mobile",  orders: 11, lifetimeSpend: 286_400, lastOrderDaysAgo: 6,  tier: "vip",     acquiredFrom: "WhatsApp" },
  { name: "Chiamaka Okeke",  email: "ops@lagosmart.ng",   city: "Port Harcourt",    phone: "+234 803 555 0178", device: "desktop", orders: 22, lifetimeSpend: 642_800, lastOrderDaysAgo: 6,  tier: "vip",     acquiredFrom: "Direct" },
  { name: "Raphael Eze",     email: "raphael@gmail.com",  city: "Garki, Abuja",     device: "mobile",  orders: 1,  lifetimeSpend:   9_500, lastOrderDaysAgo: 8,  tier: "new",     acquiredFrom: "Instagram" },
  { name: "Bisi Sanyaolu",   email: "bisi@studio.io",     city: "Ajah, Lagos",      device: "mobile",  orders: 3,  lifetimeSpend:  62_000, lastOrderDaysAgo: 14, tier: "regular", acquiredFrom: "Instagram" },
  { name: "Hauwa Mohammed",  email: "hauwa@kano.ng",      city: "Kano",             device: "mobile",  orders: 1,  lifetimeSpend:  18_400, lastOrderDaysAgo: 22, tier: "new",     acquiredFrom: "TikTok" },
  { name: "Olu Akinwale",    email: "olu@neuroframe.dev", city: "Ibadan",           device: "desktop", orders: 5,  lifetimeSpend: 102_500, lastOrderDaysAgo: 92, tier: "lapsed",  acquiredFrom: "Google" },
  { name: "Walk-in shopper", email: "guest@pallio.shop",  city: "Lekki, Lagos",     device: "mobile",  orders: 1,  lifetimeSpend:   9_500, lastOrderDaysAgo: 7,  tier: "new",     acquiredFrom: "Direct" },
]

const TIER_TONE: Record<Tier, StatusTone> = {
  vip:     "brand",
  regular: "info",
  new:     "success",
  lapsed:  "warning",
}

type Filter = "all" | Tier

export default function StorefrontCustomers() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 250)) }, []))
  const isMobile = useIsMobile()
  const { formatPrice } = useCurrency()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<Filter>("all")

  const state = React.useMemo(() => getStorefrontState(), [])
  const template = state.templateId ? TEMPLATES_BY_ID[state.templateId] : null

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return CUSTOMERS.filter((c) => {
      if (filter !== "all" && c.tier !== filter) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.acquiredFrom.toLowerCase().includes(q)
      )
    })
  }, [query, filter])

  const counts: Record<Filter, number> = {
    all:     CUSTOMERS.length,
    vip:     CUSTOMERS.filter((c) => c.tier === "vip").length,
    regular: CUSTOMERS.filter((c) => c.tier === "regular").length,
    new:     CUSTOMERS.filter((c) => c.tier === "new").length,
    lapsed:  CUSTOMERS.filter((c) => c.tier === "lapsed").length,
  }

  const totalLTV = CUSTOMERS.reduce((s, c) => s + c.lifetimeSpend, 0)
  const repeatRate = (CUSTOMERS.filter((c) => c.orders > 1).length / CUSTOMERS.length) * 100
  const avgOrders = CUSTOMERS.reduce((s, c) => s + c.orders, 0) / CUSTOMERS.length

  if (!template) {
    return (
      <PageShell title="Storefront customers" withToolbar={false} titleTooltip="Buyers who've purchased from your hosted storefront.">
        <Card>
          <CardContent className="p-0">
            <EmptyState
              Icon={Globe}
              title="No storefront yet"
              description="Pick a template to start collecting customers."
              action={<Link to="/storefront/templates"><Button>Pick a template</Button></Link>}
            />
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Storefront customers"
      withToolbar={false}
      titleTooltip={
        <>
          People who've bought from your hosted shop. Different from
          <strong> Sales → Customers</strong> which aggregates buyers
          across every channel (POS + online + wholesale). Use the
          tier chips to build email + WhatsApp campaign segments.
        </>
      }
      mobileTrailing={
        <Link to="/communications/new" aria-label="Email customers">
          <Button size="sm" variant="ghost"><Mail className="h-3.5 w-3.5" /></Button>
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Customers",  value: String(CUSTOMERS.length),           tone: "brand",   hint: "lifetime" },
            { label: "Total LTV",  value: formatPrice(totalLTV),               tone: "success", hint: "across all buyers" },
            { label: "Repeat rate",value: `${repeatRate.toFixed(0)}%`,         tone: "info",    hint: "2+ orders" },
            { label: "Avg orders", value: avgOrders.toFixed(1),                tone: "warning", hint: "per customer" },
          ]}
        />

        {/* Filter chips + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
            {(["all", "vip", "regular", "new", "lapsed"] as const).map((f) => (
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
                )}>{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="relative min-w-[200px] sm:ml-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, city, source…"
              className="pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                Icon={Users}
                title="No customers match"
                description="Adjust the filter or clear search."
                action={<Button variant="outline" onClick={() => { setQuery(""); setFilter("all") }}>Clear filters</Button>}
              />
            </CardContent>
          </Card>
        ) : isMobile ? (
          <ul className="flex flex-col gap-2">
            {filtered.map((c) => <CustomerCard key={c.email} customer={c} formatPrice={formatPrice} />)}
          </ul>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2.5 font-medium">Customer</th>
                      <th className="px-3 py-2.5 font-medium">Email</th>
                      <th className="px-3 py-2.5 font-medium">Source</th>
                      <th className="px-3 py-2.5 text-right font-medium">Orders</th>
                      <th className="px-3 py-2.5 text-right font-medium">Spend</th>
                      <th className="px-3 py-2.5 font-medium">Tier</th>
                      <th className="px-3 py-2.5 font-medium">Last seen</th>
                      <th className="px-3 py-2.5 text-right font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((c) => (
                      <tr key={c.email} className="transition-colors hover:bg-accent/30">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Avatar seed={c.email} name={c.name} size={28} />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold">{c.name}</p>
                              <p className="truncate text-[10px] text-muted-foreground">{c.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{c.email}</td>
                        <td className="px-3 py-2.5 text-xs">{c.acquiredFrom}</td>
                        <td className="px-3 py-2.5 text-right text-xs tabular-nums">{c.orders}</td>
                        <td className="px-3 py-2.5 text-right text-xs font-bold tabular-nums">{formatPrice(c.lifetimeSpend)}</td>
                        <td className="px-3 py-2.5"><StatusBadge tone={TIER_TONE[c.tier]}>{c.tier}</StatusBadge></td>
                        <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{c.lastOrderDaysAgo === 0 ? "today" : `${c.lastOrderDaysAgo}d ago`}</td>
                        <td className="px-3 py-2.5 text-right">
                          <Link to={`/communications/new?to=${encodeURIComponent(c.email)}`}>
                            <Button size="sm" variant="ghost"><Mail className="h-3.5 w-3.5" /></Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Segments to email — quick action rails */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold md:text-base">Send a campaign</h3>
              <Link to="/communications/templates" className="text-[11px] font-semibold text-brand hover:underline dark:text-primary">Templates →</Link>
            </div>
            <p className="text-[11px] text-muted-foreground">Pre-built segments. Pallio emails everyone in the cohort with one tap.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                { Icon: Sparkles, title: "Thank top customers",   sub: `${counts.vip} VIPs · LTV > ₦200k`,   tone: "brand"   as const, template: "vip-thanks" },
                { Icon: UserPlus, title: "Welcome new buyers",     sub: `${counts.new} buyers this month`,    tone: "success" as const, template: "welcome" },
                { Icon: Heart,    title: "Win back lapsed",        sub: `${counts.lapsed} dormant > 90d`,     tone: "warning" as const, template: "winback" },
                { Icon: ShoppingBag, title: "Cross-sell + upsell", sub: "Recommend based on past order",      tone: "info"    as const, template: "cross-sell" },
              ].map((s) => (
                <Link
                  key={s.title}
                  to={`/communications/new?template=${s.template}`}
                  onClick={() => toast.success(`Campaign queued: ${s.title}`)}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-brand/40 hover:bg-accent/40"
                >
                  <span className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    s.tone === "brand"   && "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
                    s.tone === "success" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                    s.tone === "warning" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                    s.tone === "info"    && "bg-sky-500/15 text-sky-700 dark:text-sky-300",
                  )}>
                    <s.Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

function CustomerCard({ customer: c, formatPrice }: { customer: StorefrontCustomer; formatPrice: (n: number) => string }) {
  const DeviceIcon = c.device === "desktop" ? TrendingUp : Smartphone
  return (
    <li>
      <Link
        to={`/communications/new?to=${encodeURIComponent(c.email)}`}
        className="block rounded-2xl border border-border bg-card p-3 transition-colors hover:border-brand/40"
      >
        <div className="flex items-start gap-3">
          <Avatar seed={c.email} name={c.name} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold">{c.name}</p>
              <p className="shrink-0 text-sm font-bold tabular-nums">{formatPrice(c.lifetimeSpend)}</p>
            </div>
            <p className="truncate text-[11px] text-muted-foreground">{c.email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <StatusBadge tone={TIER_TONE[c.tier]}>{c.tier}</StatusBadge>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" /> {c.city}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <DeviceIcon className="h-2.5 w-2.5" /> {c.device}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {c.orders} orders · {c.acquiredFrom} · <Clock className="inline h-2.5 w-2.5" /> {c.lastOrderDaysAgo === 0 ? "today" : `${c.lastOrderDaysAgo}d ago`}
            </p>
          </div>
        </div>
      </Link>
    </li>
  )
}

void Phone; void Award
