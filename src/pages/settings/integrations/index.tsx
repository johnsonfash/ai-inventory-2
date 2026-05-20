import * as React from "react"
import { Link } from "react-router-dom"
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Facebook,
  Globe,
  Instagram,
  Mail,
  PackageCheck,
  Plug,
  ShoppingBag,
  Truck,
  Youtube,
  type LucideIcon,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { cn } from "@/lib/utils"

type Integration = {
  href: string
  name: string
  description: string
  Icon: LucideIcon
  category: "Payments" | "E-commerce" | "Shipping" | "Marketing" | "Productivity"
  status: "connected" | "available" | "deprecated"
  tone: "violet" | "emerald" | "amber" | "rose" | "sky" | "fuchsia" | "neutral"
}

const ITEMS: Integration[] = [
  { href: "/settings/integrations/stripe", name: "Stripe", description: "Card payments, payouts, and customer portal.", Icon: CreditCard, category: "Payments", status: "connected", tone: "violet" },
  { href: "/settings/integrations/paypal", name: "PayPal", description: "PayPal & Pay Later for checkout.", Icon: CreditCard, category: "Payments", status: "available", tone: "sky" },
  { href: "/settings/integrations/shopify", name: "Shopify", description: "Sync inventory with your Shopify store.", Icon: ShoppingBag, category: "E-commerce", status: "connected", tone: "emerald" },
  { href: "/settings/integrations/woocommerce", name: "WooCommerce", description: "Two-way product + order sync.", Icon: ShoppingBag, category: "E-commerce", status: "available", tone: "violet" },
  { href: "/settings/integrations/website", name: "Custom website", description: "Connect your own storefront via API.", Icon: Globe, category: "E-commerce", status: "available", tone: "neutral" },
  { href: "/settings/integrations/easypost", name: "EasyPost", description: "Compare carriers and buy shipping labels.", Icon: PackageCheck, category: "Shipping", status: "connected", tone: "amber" },
  { href: "/settings/integrations/shippo", name: "Shippo", description: "Multi-carrier shipping rates.", Icon: Truck, category: "Shipping", status: "available", tone: "sky" },
  { href: "/settings/integrations/facebook-ads", name: "Facebook Ads", description: "Run product ads against catalog feed.", Icon: Facebook, category: "Marketing", status: "available", tone: "sky" },
  { href: "/settings/integrations/instagram-ads", name: "Instagram Ads", description: "Shoppable ads from the same catalog.", Icon: Instagram, category: "Marketing", status: "available", tone: "fuchsia" },
  { href: "/settings/integrations/facebook-marketplace", name: "Facebook Marketplace", description: "List items on Marketplace automatically.", Icon: Facebook, category: "Marketing", status: "available", tone: "rose" },
  { href: "/settings/integrations/youtube-adsense", name: "YouTube + AdSense", description: "Affiliate product placement.", Icon: Youtube, category: "Marketing", status: "available", tone: "rose" },
  { href: "/settings/integrations/google-workspace", name: "Google Workspace", description: "Single sign-on + Gmail + Drive sync.", Icon: Mail, category: "Productivity", status: "connected", tone: "violet" },
  { href: "/settings/integrations/calendar", name: "Calendar sync", description: "Push appointments to Google or Outlook.", Icon: CalendarDays, category: "Productivity", status: "available", tone: "emerald" },
]

const TONES = {
  violet: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
  fuchsia: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
  neutral: "bg-muted text-muted-foreground",
} as const

const CATEGORIES = ["All", "Payments", "E-commerce", "Shipping", "Marketing", "Productivity"] as const
const STATUS_FILTERS = ["All", "Connected", "Available"] as const

const statusTone: Record<Integration["status"], StatusTone> = {
  connected: "success",
  available: "neutral",
  deprecated: "danger",
}

export default function Integrations() {
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<(typeof CATEGORIES)[number]>("All")
  const [statusFilter, setStatusFilter] = React.useState<(typeof STATUS_FILTERS)[number]>("All")

  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    let list = ITEMS
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
    if (category !== "All") list = list.filter((i) => i.category === category)
    if (statusFilter === "Connected") list = list.filter((i) => i.status === "connected")
    if (statusFilter === "Available") list = list.filter((i) => i.status === "available")
    return list
  }, [query, category, statusFilter])

  const connected = ITEMS.filter((i) => i.status === "connected").length

  return (
    <PageShell title="Integrations" withToolbar={false}>
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Connected", value: String(connected), tone: "success", hint: "live" },
            { label: "Available", value: String(ITEMS.length - connected), tone: "neutral", hint: "ready" },
            { label: "Categories", value: String(CATEGORIES.length - 1), tone: "info", hint: "groups" },
            { label: "Providers", value: String(ITEMS.length), tone: "brand", hint: "total" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Plug className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search providers…" className="pl-9" />
          </div>
        </div>

        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:px-0">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === c
                  ? "border-transparent bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:px-0">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === s
                  ? "border-transparent bg-foreground/85 text-background"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState Icon={Plug} title="No providers match" description="Try a different keyword or clear the category filter." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((it) => {
              const Icon = it.Icon
              return (
                <Link
                  key={it.href}
                  to={it.href}
                  className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TONES[it.tone])}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{it.name}</p>
                        {it.status === "connected" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Connected
                          </span>
                        ) : (
                          <StatusBadge tone={statusTone[it.status]}>{it.status}</StatusBadge>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{it.description}</p>
                      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {it.category}
                      </p>
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
